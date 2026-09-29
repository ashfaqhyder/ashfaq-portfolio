"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function NetworkNode() {
  const nodes = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * 3,
          Math.sin(angle) * 3,
          Math.cos(angle * 2) * 1.5
        )
      );
    }
    return points;
  }, []);

  return (
    <group>
      {nodes.map((node, i) => (
        <Float key={i} speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[node.x, node.y, node.z]} scale={0.2}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#0066ff"
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}

      {/* Connection lines */}
      {nodes.map((node, i) => {
        const nextNode = nodes[(i + 1) % nodes.length];
        return (
          <Line
            key={`line-${i}`}
            points={[node, nextNode]}
            color="#0066ff"
            lineWidth={2}
            transparent
            opacity={0.6}
            dashed={false}
          />
        );
      })}
    </group>
  );
}

export default function Network3D() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 6],
        fov: 75,
      }}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
      }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.7} color="#0066ff" />

      <NetworkNode />

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
      />
    </Canvas>
  );
}
