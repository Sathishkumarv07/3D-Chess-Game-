import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';

export function EnvironmentLighting() {
  const lightGroupRef = useRef();

  useFrame((state) => {
    if (lightGroupRef.current) {
      lightGroupRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <group ref={lightGroupRef}>
      {/* Night Violet Ambient Base */}
      <ambientLight intensity={0.4} color="#180930" />

      {/* Dragonfruit Directional Key Light */}
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.5}
        color="#ff007f"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Electric Violet Fill Light */}
      <directionalLight
        position={[-8, 10, -6]}
        intensity={1.0}
        color="#9d4edd"
      />

      {/* Center Point Light */}
      <pointLight position={[0, 8, 0]} intensity={1.8} color="#ff3399" distance={16} />

      {/* Ambient Night Stars & Dragonfruit Sparkles */}
      <Stars radius={100} depth={50} count={3500} factor={4} saturation={1} fade speed={1} />
      <Sparkles count={100} scale={14} size={3.5} speed={0.5} color="#ff007f" />
    </group>
  );
}
