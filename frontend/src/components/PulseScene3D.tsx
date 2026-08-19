import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function PulseTorus() {
  const torusRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = 1 + 0.08 * Math.sin(t * 2);
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.3;
      torusRef.current.rotation.y = t * 0.5;
      torusRef.current.scale.setScalar(s);
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 2);
    }
  });

  return (
    <mesh ref={torusRef}>
      <torusGeometry args={[1.2, 0.08, 32, 100]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#0d9488"
        emissive="#2dd4bf"
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function OuterRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * speed;
      ref.current.rotation.z = t * speed * 0.6;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.015, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.4} />
    </mesh>
  );
}

function CoreSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const s = 0.8 + 0.15 * Math.sin(t * 3);
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial
        color="#06b6d4"
        emissive="#22d3ee"
        emissiveIntensity={1.2}
        transparent
        opacity={0.35}
        roughness={0.1}
      />
    </mesh>
  );
}

function OrbitParticles({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 1.2;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#2dd4bf" size={0.03} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function PulseRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.z = t * 0.4;
      ref.current.rotation.x = 0.3;
      const s = 1 + 0.04 * Math.sin(t * 4);
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.5, 0.01, 8, 200]} />
      <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.6} transparent opacity={0.35} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#2dd4bf" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#06b6d4" />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <PulseTorus />
        <CoreSphere />
        <OuterRing radius={1.6} speed={0.3} color="#2dd4bf" />
        <OuterRing radius={2.0} speed={-0.2} color="#06b6d4" />
        <PulseRing />
      </Float>
      <OrbitParticles count={120} />
      <Sparkles count={60} scale={5} size={2} speed={0.3} color="#2dd4bf" opacity={0.4} />
    </>
  );
}

export default function PulseScene3D() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <Scene />
      </Canvas>
    </div>
  );
}
