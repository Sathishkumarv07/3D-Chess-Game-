import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function TorchLight3D() {
  const spotLightRef = useRef();
  const pointLightRef = useRef();

  // Gentle realistic torch flame flicker effect
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const flicker = Math.sin(time * 12) * 0.25 + Math.cos(time * 23) * 0.15;
    if (spotLightRef.current) {
      spotLightRef.current.intensity = 3.6 + flicker;
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 2.0 + flicker * 0.5;
    }
  });

  return (
    <group position={[0, 9, 4]}>
      {/* Primary Torch Spotlight casting dynamic piece shadows */}
      <spotLight
        ref={spotLightRef}
        position={[0, 0, 0]}
        target-position={[0, 0, 0]}
        angle={0.65}
        penumbra={0.4}
        intensity={3.8}
        color="#ffaa33"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Warm Ambient Torch Point Light */}
      <pointLight
        ref={pointLightRef}
        position={[0, -0.5, 0]}
        intensity={2.2}
        color="#ff7700"
        distance={18}
      />

      {/* Visual Glowing Torch Flame Orb */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[1.6, 1.6, 1.6]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.45} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
