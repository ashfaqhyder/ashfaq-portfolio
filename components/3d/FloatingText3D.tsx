"use client";

import { Canvas } from "@react-three/fiber";
import { Text, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

interface FloatingTextProps {
  text: string;
  color?: string;
  scale?: number;
}

function FloatingTextComponent({ text, color = "#ffffff", scale = 1 }: FloatingTextProps) {
  return (
    <Text
      font="/fonts/geist-mono.woff"
      position={[0, 0, 0]}
      fontSize={scale}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

export default function FloatingText3D({ text = "YOUR PORTFOLIO", color = "#3b82f6" }: FloatingTextProps) {
  return (
    <Canvas
      camera={{
        position: [0, 0, 5],
        fov: 75,
      }}
      style={{
        width: "100%",
        height: "300px",
      }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#0066ff" />

      <FloatingTextComponent text={text} color={color} scale={2} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
      />
    </Canvas>
  );
}
