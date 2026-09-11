import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export function EarthSun3D({ lowSpecMode = false }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const sunGroupRef = useRef();

  useFrame((state, delta) => {
    if (lowSpecMode) return; // Skip frame rotation overhead in low-spec mode
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07;
    }
    if (sunGroupRef.current) {
      sunGroupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      {/* Deep Space Stars */}
      <Stars radius={120} depth={60} count={lowSpecMode ? 600 : 2500} factor={4} saturation={0.9} fade speed={lowSpecMode ? 0 : 0.8} />

      {/* Solar Key Light coming from the Sun position */}
      <directionalLight
        position={[28, 18, -40]}
        intensity={2.2}
        color="#fff4db"
        castShadow={!lowSpecMode}
        shadow-mapSize={lowSpecMode ? [512, 512] : [1024, 1024]}
      />

      {/* Earth Horizon Rim Fill Light */}
      <directionalLight
        position={[-20, -10, -30]}
        intensity={0.8}
        color="#00b4d8"
      />

      {/* Ambient Deep Space Light */}
      <ambientLight intensity={0.4} color="#0d1b2a" />

      {/* ☀️ Glowing Sun Orb & Solar Flare */}
      <group position={[28, 18, -45]} ref={sunGroupRef}>
        {/* Core Sun Mesh */}
        <mesh>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Sun Inner Corona */}
        <mesh scale={[1.25, 1.25, 1.25]}>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial color="#ffb703" transparent opacity={0.65} side={THREE.BackSide} />
        </mesh>
        {/* Sun Outer Solar Flare Halo */}
        <mesh scale={[1.8, 1.8, 1.8]}>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial color="#ff8c00" transparent opacity={0.25} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* 🌍 3D Earth Planet in Background */}
      <group position={[-24, -14, -38]} rotation={[0.4, 0, 0.2]}>
        {/* Earth Base Globe */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[14, 48, 48]} />
          <meshStandardMaterial
            color="#1b4965"
            roughness={0.65}
            metalness={0.1}
            emissive="#0b2545"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Earth Atmosphere Cloud Layer */}
        <mesh ref={cloudsRef} scale={[1.015, 1.015, 1.015]}>
          <sphereGeometry args={[14, 48, 48]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0.3}
            roughness={0.9}
          />
        </mesh>

        {/* Atmospheric Blue Horizon Glow Layer */}
        <mesh scale={[1.06, 1.06, 1.06]}>
          <sphereGeometry args={[14, 48, 48]} />
          <meshBasicMaterial
            color="#48cae4"
            transparent
            opacity={0.35}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      {/* Atmospheric Horizon Light Grid Plate */}
      <mesh position={[0, -18, -30]} rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[120, 60]} />
        <meshBasicMaterial color="#0077b6" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
