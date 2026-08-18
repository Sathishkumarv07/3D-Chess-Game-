import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { EarthSun3D } from './EarthSun3D';
import { RedNebula3D } from './RedNebula3D';
import { TorchLight3D } from './TorchLight3D';

export function EnvironmentLighting({
  bgEnvironment = 'earth_sun',
  isSunFlipped = false,
  isTorchOn = false
}) {
  const lightGroupRef = useRef();

  useFrame((state) => {
    if (lightGroupRef.current && (bgEnvironment === 'space' || bgEnvironment === 'earth_sun' || bgEnvironment === 'red_theme')) {
      lightGroupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  // Calculate direction multiplier for shadow flip
  const shadowMultX = isSunFlipped ? -1 : 1;
  const shadowMultZ = isSunFlipped ? -1 : 1;

  return (
    <group>
      {/* Torch Light Overlay if enabled */}
      {isTorchOn && <TorchLight3D />}

      {/* Render Environment Lighting */}
      {(() => {
        switch (bgEnvironment) {
          case 'earth_sun':
            return (
              <group scale={[shadowMultX, 1, shadowMultZ]}>
                <EarthSun3D />
              </group>
            );

          case 'red_theme':
            return (
              <group scale={[shadowMultX, 1, shadowMultZ]}>
                <RedNebula3D />
              </group>
            );

          case 'tournament':
            return (
              <group>
                <mesh position={[0, -0.45, 0]} receiveShadow>
                  <boxGeometry args={[30, 0.1, 30]} />
                  <meshStandardMaterial color="#2c1a0e" roughness={0.3} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.38, 0]} receiveShadow>
                  <boxGeometry args={[11, 0.15, 11]} />
                  <meshStandardMaterial color="#4a2c11" roughness={0.4} metalness={0.2} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.25 : 0.5} color="#fff8e7" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 6 * shadowMultZ]}
                  intensity={2.2}
                  color="#fff0d6"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={0.6} color="#d4a373" />
              </group>
            );

          case 'cozy_lounge':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow>
                  <boxGeometry args={[24, 0.12, 24]} />
                  <meshStandardMaterial color="#3d1e11" roughness={0.4} metalness={0.05} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.2 : 0.45} color="#ffbe0b" />
                <directionalLight
                  position={[7 * shadowMultX, 12, 8 * shadowMultZ]}
                  intensity={2.0}
                  color="#ffaa00"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <pointLight position={[-10 * shadowMultX, 5, -8 * shadowMultZ]} intensity={1.8} color="#ff5500" distance={20} />
              </group>
            );

          case 'royal_palace':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow>
                  <cylinderGeometry args={[8.5, 9, 0.14, 48]} />
                  <meshStandardMaterial color="#f8f9fa" roughness={0.15} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.34, 0]}>
                  <torusGeometry args={[8.5, 0.08, 16, 64]} />
                  <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.3 : 0.6} color="#fdf0d5" />
                <directionalLight
                  position={[10 * shadowMultX, 16, 10 * shadowMultZ]}
                  intensity={2.2}
                  color="#ffffff"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-10 * shadowMultX, 12, -10 * shadowMultZ]} intensity={1.0} color="#ffd700" />
              </group>
            );

          case 'studio':
            return (
              <group>
                <mesh position={[0, -0.41, 0]} receiveShadow>
                  <planeGeometry args={[50, 50]} />
                  <meshStandardMaterial color="#18181b" roughness={0.8} metalness={0.1} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.2 : 0.4} color="#ffffff" />
                <directionalLight
                  position={[10 * shadowMultX, 15, 10 * shadowMultZ]}
                  intensity={2.2}
                  color="#ffffff"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-10 * shadowMultX, 12, -8 * shadowMultZ]} intensity={1.0} color="#e4e4e7" />
              </group>
            );

          case 'zen_garden':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow>
                  <boxGeometry args={[12, 0.14, 12]} />
                  <meshStandardMaterial color="#212529" roughness={0.6} metalness={0.2} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.25 : 0.45} color="#d8f3dc" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 6 * shadowMultZ]}
                  intensity={2.0}
                  color="#74c69d"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={0.8} color="#40916c" />
              </group>
            );

          case 'space':
          default:
            return (
              <group ref={lightGroupRef}>
                <ambientLight intensity={isTorchOn ? 0.2 : 0.4} color="#180930" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 6 * shadowMultZ]}
                  intensity={1.8}
                  color="#ff007f"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={1.0} color="#9d4edd" />
                <Stars radius={100} depth={50} count={3500} factor={4} saturation={1} fade speed={1} />
                <Sparkles count={100} scale={14} size={3.5} speed={0.5} color="#ff007f" />
              </group>
            );
        }
      })()}
    </group>
  );
}
