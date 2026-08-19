/**
 * WebSocket client for real-time pulse data streaming.
 */

export interface PulseSampleMessage {
  type: "samples";
  device_id: string;
  samples: number[];
  timestamp: number;
}

export interface PulseBufferMessage {
  type: "buffer";
  samples: number[];
}

export interface PulseAnalysisMessage {
  type: "analysis";
  heart_rate: number;
  pulse_pattern: string;
  confidence: number;
}

export interface PulsePongMessage {
  type: "pong";
}

export type PulseWSMessage =
  | PulseSampleMessage
  | PulseBufferMessage
  | PulseAnalysisMessage
  | PulsePongMessage;

type MessageHandler = (msg: PulseWSMessage) => void;

export class PulseWebSocket {
  private ws: WebSocket | null = null;
  private patientId: string;
  private onMessage: MessageHandler;
  private onStatusChange: (connected: boolean) => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;

  constructor(
    patientId: string,
    onMessage: MessageHandler,
    onStatusChange: (connected: boolean) => void,
  ) {
    this.patientId = patientId;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
  }

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/api/pulse/ws/pulse/${this.patientId}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("Pulse WebSocket connected");
      this.reconnectAttempts = 0;
      this.onStatusChange(true);

      // Start keepalive pings
      this.pingTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 15000);
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: PulseWSMessage = JSON.parse(event.data);
        this.onMessage(msg);
      } catch (e) {
        console.error("Failed to parse WS message:", e);
      }
    };

    this.ws.onclose = () => {
      console.log("Pulse WebSocket disconnected");
      this.onStatusChange(false);
      this.stopPing();
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error("Pulse WebSocket error:", err);
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
    this.maxReconnectAttempts = 0; // prevent reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }
}
