import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export function ChessBoard3D({
  boardState,
  selectedSquare,
  legalMoves = [],
  lastMove = null,
  kingInCheckPos = null,
  theme = 'dragonfruit',
  onSquareClick
}) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Board materials based on selected theme
  const { lightSquareMat, darkSquareMat, borderMat, labelColor } = useMemo(() => {
    switch (theme) {
      case 'normal_green':
      case 'tournament':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#eeeed2', roughness: 0.35, metalness: 0.05 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#769656', roughness: 0.45, metalness: 0.05 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#3e522c', roughness: 0.6, metalness: 0.1 }),
          labelColor: '#eeeed2'
        };

      case 'walnut':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#e0c097', roughness: 0.5, metalness: 0.05 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#5c3d2e', roughness: 0.6, metalness: 0.05 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#2d1b12', roughness: 0.7, metalness: 0.0 }),
          labelColor: '#e0c097'
        };

      case 'dragonfruit':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#2d1454', roughness: 0.25, metalness: 0.7, emissive: '#16082d', emissiveIntensity: 0.2 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#130826', roughness: 0.35, metalness: 0.8, emissive: '#090314', emissiveIntensity: 0.2 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#ff007f', roughness: 0.2, metalness: 0.9, emissive: '#5a002d', emissiveIntensity: 0.5 }),
          labelColor: '#ff3399'
        };

      case 'cyberpunk':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#1a1d2e', roughness: 0.2, metalness: 0.8 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#0a0b12', roughness: 0.3, metalness: 0.9 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#00f0ff', roughness: 0.2, metalness: 0.9, emissive: '#004455', emissiveIntensity: 0.4 }),
          labelColor: '#00f0ff'
        };

      case 'emerald':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#e8f5e9', roughness: 0.2, metalness: 0.1 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#1b4332', roughness: 0.3, metalness: 0.4 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.3, metalness: 0.6, emissive: '#081c15', emissiveIntensity: 0.2 }),
          labelColor: '#52b788'
        };

      case 'marble':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#f4f1de', roughness: 0.15, metalness: 0.1 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#3d405b', roughness: 0.25, metalness: 0.2 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#ffd700', roughness: 0.2, metalness: 0.8, emissive: '#554400', emissiveIntensity: 0.3 }),
          labelColor: '#ffd700'
        };

      case 'ocean':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#e0f2fe', roughness: 0.2, metalness: 0.1 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#0369a1', roughness: 0.3, metalness: 0.3 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.25, metalness: 0.6, emissive: '#075985', emissiveIntensity: 0.2 }),
          labelColor: '#38bdf8'
        };

      case 'charcoal':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#e4e4e7', roughness: 0.3, metalness: 0.2 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.4, metalness: 0.3 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#3f3f46', roughness: 0.5, metalness: 0.4 }),
          labelColor: '#a1a1aa'
        };

      case 'brown':
      default:
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#f0d9b5', roughness: 0.4, metalness: 0.05 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#b58863', roughness: 0.5, metalness: 0.05 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#5c3d2e', roughness: 0.6, metalness: 0.1, emissive: '#2d1b12', emissiveIntensity: 0.15 }),
          labelColor: '#f0d9b5'
        };
    }
  }, [theme]);

  const legalMap = useMemo(() => {
    const map = new Map();
    legalMoves.forEach(m => {
      map.set(`${m.to.row},${m.to.col}`, m);
    });
    return map;
  }, [legalMoves]);

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Border Rim Frame */}
      <mesh position={[0, -0.2, 0]} material={borderMat} receiveShadow>
        <boxGeometry args={[8.8, 0.4, 8.8]} />
      </mesh>

      {/* 64 Board Squares */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => {
          const isLight = (row + col) % 2 === 0;
          const posX = col - 3.5;
          const posZ = row - 3.5;

          const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
          const isLegal = legalMap.has(`${row},${col}`);
          const isLastFrom = lastMove && lastMove.from.row === row && lastMove.from.col === col;
          const isLastTo = lastMove && lastMove.to.row === row && lastMove.to.col === col;
          const isCheckSquare = kingInCheckPos && kingInCheckPos.row === row && kingInCheckPos.col === col;

          return (
            <group key={`${row}-${col}`} position={[posX, 0, posZ]}>
              <mesh
                material={isLight ? lightSquareMat : darkSquareMat}
                receiveShadow
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSquareClick) onSquareClick(row, col);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'auto';
                }}
              >
                <boxGeometry args={[0.98, 0.1, 0.98]} />
              </mesh>

              {isSelected && (
                <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#ff007f" transparent opacity={0.6} />
                </mesh>
              )}

              {isLegal && (
                <group position={[0, 0.06, 0]}>
                  {boardState[row][col] ? (
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                      <ringGeometry args={[0.35, 0.46, 32]} />
                      <meshBasicMaterial color="#ff0055" transparent opacity={0.8} />
                    </mesh>
                  ) : (
                    <mesh>
                      <cylinderGeometry args={[0.16, 0.16, 0.02, 16]} />
                      <meshBasicMaterial color="#ff3399" transparent opacity={0.8} />
                    </mesh>
                  )}
                </group>
              )}

              {(isLastFrom || isLastTo) && !isSelected && (
                <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#9d4edd" transparent opacity={0.4} />
                </mesh>
              )}

              {isCheckSquare && (
                <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#ff0000" transparent opacity={0.7} />
                </mesh>
              )}
            </group>
          );
        })
      )}

      {/* Board Coordinates */}
      {files.map((file, col) => (
        <React.Fragment key={`file-${file}`}>
          <Text position={[col - 3.5, 0.02, 4.15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">{file}</Text>
          <Text position={[col - 3.5, 0.02, -4.15]} rotation={[-Math.PI / 2, 0, Math.PI]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">{file}</Text>
        </React.Fragment>
      ))}

      {ranks.map((rank, row) => (
        <React.Fragment key={`rank-${rank}`}>
          <Text position={[-4.15, 0.02, row - 3.5]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">{rank}</Text>
          <Text position={[4.15, 0.02, row - 3.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">{rank}</Text>
        </React.Fragment>
      ))}
    </group>
  );
}
