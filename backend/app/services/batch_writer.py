"""
Batch database writer for pulse samples.

Accumulates samples in memory and flushes to PostgreSQL in bulk
at configurable intervals or size thresholds. This dramatically
reduces DB overhead compared to per-sample writes.

At 100Hz with 10 samples per WS message:
  Before: 10 DB sessions/sec, 10 commits/sec, 100 individual INSERTs/sec
  After:  1 DB session/sec, 1 commit/sec, 1 bulk INSERT/sec (500 rows)
"""

import asyncio
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field

from app.database.connection import SessionLocal
from app.models.pulse import PulseSample


@dataclass
class SessionBuffer:
    """In-memory buffer for one pulse session's samples."""
    session_id: str
    samples: List[float] = field(default_factory=list)
    last_flush: float = field(default_factory=time.time)
    total_written: int = 0


class BatchWriter:
    """Background batch writer that accumulates samples and flushes to DB.

    Usage:
        writer = BatchWriter(flush_interval=1.0, flush_threshold=500)
        writer.start()

        # From WebSocket handler:
        writer.enqueue(session_id, [1.2, 3.4, 5.6])

        # On disconnect:
        await writer.flush_session(session_id)

        # Shutdown:
        await writer.stop()
    """

    def __init__(
        self,
        flush_interval: float = 1.0,
        flush_threshold: int = 500,
    ):
        """
        Args:
            flush_interval: Seconds between automatic flushes.
            flush_threshold: Max samples per session before forced flush.
        """
        self.flush_interval = flush_interval
        self.flush_threshold = flush_threshold
        self._buffers: Dict[str, SessionBuffer] = {}
        self._task: Optional[asyncio.Task] = None
        self._running = False
        self._stats = {
            "total_enqueued": 0,
            "total_flushed": 0,
            "flush_count": 0,
        }

    def start(self):
        """Start the background flush task."""
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._flush_loop())
        print(f"[BatchWriter] Started (interval={self.flush_interval}s, threshold={self.flush_threshold})")

    async def stop(self):
        """Stop the writer and flush all remaining data."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        # Final flush of all buffers
        await self._flush_all()
        print(f"[BatchWriter] Stopped. Stats: {self._stats}")

    def enqueue(self, session_id: str, samples: List[float]):
        """Add samples to the buffer for a session.

        This is called from the WebSocket handler and must be fast
        (non-blocking). It appends to an in-memory list.
        """
        if not session_id or not samples:
            return

        if session_id not in self._buffers:
            self._buffers[session_id] = SessionBuffer(session_id=session_id)

        buf = self._buffers[session_id]
        buf.samples.extend(samples)
        self._stats["total_enqueued"] += len(samples)

        # Force flush if threshold reached
        if len(buf.samples) >= self.flush_threshold:
            # Schedule flush in background (don't block the WS handler)
            asyncio.create_task(self._flush_session(session_id))

    async def flush_session(self, session_id: str):
        """Immediately flush all buffered samples for a session.

        Called when a device disconnects to ensure no data loss.
        """
        await self._flush_session(session_id)

    async def _flush_loop(self):
        """Background task that periodically flushes all buffers."""
        while self._running:
            try:
                await asyncio.sleep(self.flush_interval)
                await self._flush_all()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[BatchWriter] Flush error: {e}")
                await asyncio.sleep(1)

    async def _flush_all(self):
        """Flush all session buffers that have data."""
        session_ids = list(self._buffers.keys())
        for session_id in session_ids:
            await self._flush_session(session_id)

    async def _flush_session(self, session_id: str):
        """Flush a single session's buffer to the database.

        Uses bulk_save_objects for efficient batch INSERT.
        """
        buf = self._buffers.get(session_id)
        if not buf or not buf.samples:
            return

        # Swap buffer to avoid blocking new writes
        samples = buf.samples
        buf.samples = []
        buf.last_flush = time.time()

        try:
            db = SessionLocal()
            # Create PulseSample objects for bulk insert
            objects = [
                PulseSample(
                    session_id=session_id,
                    ir_value=val,
                )
                for val in samples
            ]
            db.bulk_save_objects(objects)
            db.commit()
            db.close()

            buf.total_written += len(samples)
            self._stats["total_flushed"] += len(samples)
            self._stats["flush_count"] += 1

        except Exception as e:
            print(f"[BatchWriter] DB flush error for {session_id}: {e}")
            # Put samples back so they're not lost
            buf.samples = samples + buf.samples

    def get_stats(self) -> dict:
        """Return current writer statistics."""
        return {
            **self._stats,
            "active_sessions": len(self._buffers),
            "buffered_samples": sum(len(b.samples) for b in self._buffers.values()),
        }


# Global singleton instance
batch_writer = BatchWriter(
    flush_interval=1.0,    # Flush every 1 second
    flush_threshold=500,   # Or when 500 samples accumulate
)
