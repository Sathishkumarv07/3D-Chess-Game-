import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { EarthSun3D } from './EarthSun3D';
import { RedNebula3D } from './RedNebula3D';
import { TorchLight3D } from './TorchLight3D';

export function EnvironmentLighting({
  bgEnvironment = 'earth_sun',
  isSunFlipped = false,
  isTorchOn = false,
  lowSpecMode = false
}) {
  const lightGroupRef = useRef();

  useFrame((state) => {
    if (lowSpecMode) return; // Skip continuous frame rotation overhead in low-spec mode
    if (lightGroupRef.current && (bgEnvironment === 'space' || bgEnvironment === 'earth_sun' || bgEnvironment === 'red_theme')) {
      lightGroupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  // Calculate direction multiplier for shadow flip
  const shadowMultX = isSunFlipped ? -1 : 1;
  const shadowMultZ = isSunFlipped ? -1 : 1;
  const shadowMapSize = lowSpecMode ? [512, 512] : [1024, 1024];

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
                <EarthSun3D lowSpecMode={lowSpecMode} />
              </group>
            );

          case 'red_theme':
            return (
              <group scale={[shadowMultX, 1, shadowMultZ]}>
                <RedNebula3D lowSpecMode={lowSpecMode} />
              </group>
            );

          case 'tournament':
            return (
              <group>
                <mesh position={[0, -0.45, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[30, 0.1, 30]} />
                  <meshStandardMaterial color="#2c1a0e" roughness={0.3} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.38, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[11, 0.15, 11]} />
                  <meshStandardMaterial color="#4a2c11" roughness={0.4} metalness={0.2} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.25 : 0.5} color="#fff8e7" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 6 * shadowMultZ]}
                  intensity={2.2}
                  color="#fff0d6"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={0.6} color="#d4a373" />
              </group>
            );

          case 'cozy_lounge':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[24, 0.12, 24]} />
                  <meshStandardMaterial color="#3d1e11" roughness={0.4} metalness={0.05} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.2 : 0.45} color="#ffbe0b" />
                <directionalLight
                  position={[7 * shadowMultX, 12, 8 * shadowMultZ]}
                  intensity={2.0}
                  color="#ffaa00"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <pointLight position={[-10 * shadowMultX, 5, -8 * shadowMultZ]} intensity={1.8} color="#ff5500" distance={20} />
              </group>
            );

          case 'royal_palace':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow={!lowSpecMode}>
                  <cylinderGeometry args={[8.5, 9, 0.14, lowSpecMode ? 24 : 48]} />
                  <meshStandardMaterial color="#f8f9fa" roughness={0.15} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.34, 0]}>
                  <torusGeometry args={[8.5, 0.08, 16, lowSpecMode ? 32 : 64]} />
                  <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.3 : 0.6} color="#fdf0d5" />
                <directionalLight
                  position={[10 * shadowMultX, 16, 10 * shadowMultZ]}
                  intensity={2.2}
                  color="#ffffff"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <directionalLight position={[-10 * shadowMultX, 12, -10 * shadowMultZ]} intensity={1.0} color="#ffd700" />
              </group>
            );

          case 'studio':
            return (
              <group>
                <mesh position={[0, -0.41, 0]} receiveShadow={!lowSpecMode}>
                  <planeGeometry args={[50, 50]} />
                  <meshStandardMaterial color="#18181b" roughness={0.8} metalness={0.1} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.2 : 0.4} color="#ffffff" />
                <directionalLight
                  position={[10 * shadowMultX, 15, 10 * shadowMultZ]}
                  intensity={2.2}
                  color="#ffffff"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <directionalLight position={[-10 * shadowMultX, 12, -8 * shadowMultZ]} intensity={1.0} color="#e4e4e7" />
              </group>
            );

          case 'zen_garden':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[12, 0.14, 12]} />
                  <meshStandardMaterial color="#212529" roughness={0.6} metalness={0.2} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.25 : 0.45} color="#d8f3dc" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 6 * shadowMultZ]}
                  intensity={2.0}
                  color="#74c69d"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={0.8} color="#40916c" />
              </group>
            );

          // ── World Tour Country Environments ──────────────────────────────────────────
          case 'india_palace':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow={!lowSpecMode}>
                  <cylinderGeometry args={[8.5, 9, 0.14, lowSpecMode ? 24 : 48]} />
                  <meshStandardMaterial color="#fefae0" roughness={0.2} metalness={0.15} />
                </mesh>
                <mesh position={[0, -0.34, 0]}>
                  <torusGeometry args={[8.5, 0.08, 16, lowSpecMode ? 32 : 64]} />
                  <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.9} />
                </mesh>
                <ambientLight intensity={isTorchOn ? 0.35 : 0.55} color="#fff1d6" />
                <directionalLight
                  position={[9 * shadowMultX, 15, 8 * shadowMultZ]}
                  intensity={2.3}
                  color="#ffeedd"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <pointLight position={[-6 * shadowMultX, 6, -6 * shadowMultZ]} intensity={1.5} color="#f59e0b" distance={25} />
                {!lowSpecMode && <Sparkles count={40} scale={12} size={3} speed={0.4} color="#d4af37" />}
              </group>
            );

          case 'japan_zen':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[13, 0.14, 13]} />
                  <meshStandardMaterial color="#1c1917" roughness={0.5} metalness={0.1} />
                </mesh>
                <ambientLight intensity={isTorchOn ? 0.25 : 0.45} color="#fce7f3" />
                <directionalLight
                  position={[7 * shadowMultX, 13, 6 * shadowMultZ]}
                  intensity={2.0}
                  color="#fff1f2"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <directionalLight position={[-7 * shadowMultX, 9, -6 * shadowMultZ]} intensity={0.7} color="#fb7185" />
                {!lowSpecMode && <Sparkles count={50} scale={10} size={2.8} speed={0.3} color="#f472b6" />}
              </group>
            );

          case 'russia_hall':
            return (
              <group>
                <mesh position={[0, -0.44, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[22, 0.12, 22]} />
                  <meshStandardMaterial color="#2e1008" roughness={0.35} metalness={0.1} />
                </mesh>
                <ambientLight intensity={isTorchOn ? 0.2 : 0.4} color="#fef3c7" />
                <directionalLight
                  position={[0, 16, 0]}
                  intensity={2.6}
                  color="#fffdf5"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <pointLight position={[5 * shadowMultX, 5, 5 * shadowMultZ]} intensity={1.8} color="#16a34a" distance={15} />
                <directionalLight position={[-8 * shadowMultX, 8, -6 * shadowMultZ]} intensity={0.6} color="#d97706" />
              </group>
            );

          case 'iceland_frost':
            return (
              <group>
                <mesh position={[0, -0.43, 0]} receiveShadow={!lowSpecMode}>
                  <cylinderGeometry args={[9, 9.4, 0.16, lowSpecMode ? 24 : 48]} />
                  <meshStandardMaterial color="#083344" roughness={0.1} metalness={0.8} />
                </mesh>
                <ambientLight intensity={isTorchOn ? 0.2 : 0.4} color="#0891b2" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 7 * shadowMultZ]}
                  intensity={2.2}
                  color="#cffafe"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <pointLight position={[-8 * shadowMultX, 8, -8 * shadowMultZ]} intensity={2.0} color="#06b6d4" distance={22} />
                {!lowSpecMode && <Sparkles count={70} scale={14} size={3.2} speed={0.6} color="#22d3ee" />}
              </group>
            );

          case 'egypt_pharaoh':
            return (
              <group>
                <mesh position={[0, -0.44, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[14, 0.16, 14]} />
                  <meshStandardMaterial color="#451a03" roughness={0.7} metalness={0.1} />
                </mesh>
                <ambientLight intensity={isTorchOn ? 0.2 : 0.45} color="#b45309" />
                <directionalLight
                  position={[8 * shadowMultX, 13, 7 * shadowMultZ]}
                  intensity={2.1}
                  color="#fef08a"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <pointLight position={[-6 * shadowMultX, 6, -6 * shadowMultZ]} intensity={2.2} color="#ea580c" distance={18} />
                {!lowSpecMode && <Sparkles count={40} scale={11} size={2.5} speed={0.5} color="#f59e0b" />}
              </group>
            );

          case 'england_club':
            return (
              <group>
                <mesh position={[0, -0.43, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[16, 0.14, 16]} />
                  <meshStandardMaterial color="#27130b" roughness={0.4} metalness={0.1} />
                </mesh>
                <ambientLight intensity={isTorchOn ? 0.25 : 0.5} color="#fed7aa" />
                <directionalLight
                  position={[7 * shadowMultX, 13, 8 * shadowMultZ]}
                  intensity={2.1}
                  color="#ffedd5"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <pointLight position={[-7 * shadowMultX, 5, -7 * shadowMultZ]} intensity={1.6} color="#d97706" distance={20} />
              </group>
            );

          case 'france_bistro':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow={!lowSpecMode}>
                  <cylinderGeometry args={[8.8, 9.2, 0.14, lowSpecMode ? 24 : 48]} />
                  <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.15} />
                </mesh>
                <ambientLight intensity={isTorchOn ? 0.25 : 0.5} color="#f1f5f9" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 7 * shadowMultZ]}
                  intensity={2.2}
                  color="#f8fafc"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <pointLight position={[-7 * shadowMultX, 6, -7 * shadowMultZ]} intensity={1.4} color="#60a5fa" distance={20} />
              </group>
            );

          case 'brazil_rio':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow={!lowSpecMode}>
                  <boxGeometry args={[14, 0.14, 14]} />
                  <meshStandardMaterial color="#064e3b" roughness={0.4} metalness={0.1} />
                </mesh>
                <ambientLight intensity={isTorchOn ? 0.3 : 0.55} color="#ecfdf5" />
                <directionalLight
                  position={[9 * shadowMultX, 16, 8 * shadowMultZ]}
                  intensity={2.5}
                  color="#fef08a"
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <directionalLight position={[-7 * shadowMultX, 10, -7 * shadowMultZ]} intensity={0.9} color="#10b981" />
                {!lowSpecMode && <Sparkles count={45} scale={12} size={3} speed={0.6} color="#10b981" />}
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
                  castShadow={!lowSpecMode}
                  shadow-mapSize={shadowMapSize}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={1.0} color="#9d4edd" />
                <Stars radius={100} depth={50} count={lowSpecMode ? 600 : 2500} factor={4} saturation={1} fade speed={lowSpecMode ? 0 : 1} />
                {!lowSpecMode && <Sparkles count={80} scale={14} size={3.5} speed={0.5} color="#ff007f" />}
              </group>
            );
        }
      })()}
    </group>
  );
}
