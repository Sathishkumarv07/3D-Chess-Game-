import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export function RedNebula3D({ lowSpecMode = false }) {
  const redSunRef = useRef();

  useFrame((state, delta) => {
    if (lowSpecMode) return; // Skip rotation in low-spec mode
    if (redSunRef.current) {
      redSunRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group>
      {/* Deep Red Cosmic Stars */}
      <Stars radius={100} depth={50} count={lowSpecMode ? 500 : 2500} factor={5} saturation={1} fade speed={lowSpecMode ? 0 : 1.2} />
      {!lowSpecMode && <Sparkles count={80} scale={18} size={4} speed={0.8} color="#ff0033" />}

      {/* Ruby Red Key Light */}
      <directionalLight
        position={[25, 20, -35]}
        intensity={2.2}
        color="#ff2244"
        castShadow={!lowSpecMode}
        shadow-mapSize={lowSpecMode ? [512, 512] : [1024, 1024]}
      />

      {/* Deep Amber Fill Light */}
      <directionalLight
        position={[-20, 10, -25]}
        intensity={1.0}
        color="#ff6600"
      />

      {/* Dark Crimson Ambient Light */}
      <ambientLight intensity={0.35} color="#2b000a" />

      {/* 🔴 Red Giant Star / Mars Atmosphere in background */}
      <group position={[26, 16, -45]} ref={redSunRef}>
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ff0033" />
        </mesh>
        <mesh scale={[1.3, 1.3, 1.3]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.6} side={THREE.BackSide} />
        </mesh>
        <mesh scale={[1.9, 1.9, 1.9]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#990022" transparent opacity={0.25} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Distant Red Planet */}
      <group position={[-25, -12, -35]}>
        <mesh>
          <sphereGeometry args={[12, 32, 32]} />
          <meshStandardMaterial
            color="#800f2f"
            roughness={0.7}
            metalness={0.2}
            emissive="#590d22"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[12, 32, 32]} />
          <meshBasicMaterial color="#ff4d6d" transparent opacity={0.3} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Horizon Fog Plate */}
      <mesh position={[0, -18, -25]} rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[120, 60]} />
        <meshBasicMaterial color="#590d22" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
