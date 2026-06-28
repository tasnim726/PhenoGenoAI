import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Line, Float } from "@react-three/drei";
import * as THREE from "three";

const numBasePairs = 25;
const radius = 2.5;
const height = 18;
const angleStep = Math.PI / 6;

function DNAStrand() {
  const group = useRef();

  // Continually rotate the DNA helix
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15; // Ralenti pour être plus discret
    }
  });

  const basePairs = useMemo(() => {
    return Array.from({ length: numBasePairs }).map((_, i) => {
      const y = (i / numBasePairs) * height - height / 2;
      const angle = i * angleStep;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Color mapping for bases - couleurs plus douces/pastels
      const color1 = i % 4 === 0 ? "#4ade80" : i % 4 === 1 ? "#f87171" : i % 4 === 2 ? "#60a5fa" : "#facc15";
      const color2 = i % 4 === 0 ? "#f87171" : i % 4 === 1 ? "#4ade80" : i % 4 === 2 ? "#facc15" : "#60a5fa";

      return (
        <group key={i}>
          {/* Backbone 1 */}
          <Sphere args={[0.15, 16, 16]} position={[x1, y, z1]}>
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.2} transparent opacity={0.3} roughness={0.5} />
          </Sphere>
          {/* Backbone 2 */}
          <Sphere args={[0.15, 16, 16]} position={[x2, y, z2]}>
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.2} transparent opacity={0.3} roughness={0.5} />
          </Sphere>
          {/* Connection Line */}
          <Line points={[[x1, y, z1], [x2, y, z2]]} color="#00E5FF" lineWidth={1} transparent opacity={0.15} />
          {/* Base Pair nodes */}
          <Sphere args={[0.1, 16, 16]} position={[x1 * 0.3, y, z1 * 0.3]}>
            <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={0.4} transparent opacity={0.5} />
          </Sphere>
          <Sphere args={[0.1, 16, 16]} position={[x2 * 0.3, y, z2 * 0.3]}>
            <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.4} transparent opacity={0.5} />
          </Sphere>
        </group>
      );
    });
  }, []);

  return (
    <group ref={group}>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
        {basePairs}
      </Float>
    </group>
  );
}

export default function DNA3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <spotLight position={[-10, -10, -10]} intensity={0.5} color="#00E5FF" />
        <DNAStrand />
      </Canvas>
    </div>
  );
}
