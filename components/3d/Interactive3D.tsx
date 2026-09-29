"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float
      speed={2}
      rotationIntensity={1}
      floatIntensity={2}
    >
      <mesh ref={meshRef} scale={1.5}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#3b82f6"
          wireframe={false}
          emissive="#1e40af"
          emissiveIntensity={0.2}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function FloatingParticles() {
  const particles = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i < 50; i++) {
      points.push([
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      ]);
    }
    return points;
  }, []);

  return (
    <group>
      {particles.map((pos, i) => (
        <Float
          key={i}
          speed={2 + Math.random() * 2}
          rotationIntensity={0.5}
          floatIntensity={1}
        >
          <mesh position={pos} scale={0.2}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={`hsl(${Math.random() * 360}, 100%, 50%)`}
              emissive={`hsl(${Math.random() * 360}, 100%, 50%)`}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function Interactive3D() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 5],
        fov: 75,
      }}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
      }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />

      <RotatingCube />
      <FloatingParticles />

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate
        autoRotateSpeed={4}
      />
    </Canvas>
  );
}
