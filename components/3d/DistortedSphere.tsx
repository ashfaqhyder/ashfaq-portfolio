"use client";

import { Canvas } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.5}>
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.5}
          speed={2}
          emissive="#0066ff"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  );
}

export default function DistortedSphere() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 3],
        fov: 75,
      }}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "12px",
      }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <AnimatedSphere />
    </Canvas>
  );
}
