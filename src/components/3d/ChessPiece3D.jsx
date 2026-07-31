import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ChessPiece3D({
  type,
  color,
  position,
  isSelected,
  isPossibleTarget,
  onClick
}) {
  const meshGroupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(...position));
  const targetPos = useMemo(() => new THREE.Vector3(...position), [position]);

  // Smooth lerp animation for movement across the 3D board
  useFrame((state, delta) => {
    if (meshGroupRef.current) {
      const dist = currentPos.current.distanceTo(targetPos);
      const arcHeight = dist > 0.05 ? Math.sin((1 - Math.min(dist / 4, 1)) * Math.PI) * 0.6 : 0;

      currentPos.current.lerp(targetPos, Math.min(delta * 12, 1));
      meshGroupRef.current.position.set(
        currentPos.current.x,
        currentPos.current.y + arcHeight,
        currentPos.current.z
      );

      // Subtle floating hover effect for selected piece
      if (isSelected) {
        meshGroupRef.current.position.y += Math.sin(state.clock.elapsedTime * 6) * 0.05 + 0.15;
      }
    }
  });

  // Material setup: Authentic Polished Boxwood Ivory for White pieces, Deep Ebony Walnut for Black pieces
  const materialProps = useMemo(() => {
    const isWhite = color === 'w';
    if (isWhite) {
      return {
        color: '#f4efe6',
        roughness: 0.28,
        metalness: 0.05,
        emissive: '#443a2c',
        emissiveIntensity: isSelected ? 1.2 : 0.08
      };
    } else {
      return {
        color: '#221c19',
        roughness: 0.32,
        metalness: 0.08,
        emissive: '#120e0c',
        emissiveIntensity: isSelected ? 1.2 : 0.08
      };
    }
  }, [color, isSelected]);

  // Geometries for pieces
  const geometry = useMemo(() => {
    switch (type) {
      case 'p': return createPawnGeometry();
      case 'r': return createRookGeometry();
      case 'n': return createKnightGeometry();
      case 'b': return createBishopGeometry();
      case 'q': return createQueenGeometry();
      case 'k': return createKingGeometry();
      default: return new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16);
    }
  }, [type]);

  const rotation = useMemo(() => {
    if (type === 'n') {
      return [0, color === 'w' ? 0 : Math.PI, 0];
    }
    return [0, 0, 0];
  }, [type, color]);

  return (
    <group
      ref={meshGroupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Selection Glow Ring */}
      {isSelected && (
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.58, 32]} />
          <meshBasicMaterial
            color={color === 'w' ? '#ff007f' : '#9d4edd'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Target Dot Light for capture targets */}
      {isPossibleTarget && (
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ff3399" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

// Helpers to construct 3D Lathe & Extrude Geometries

function createBasePoints() {
  return [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.42, 0),
    new THREE.Vector2(0.42, 0.08),
    new THREE.Vector2(0.38, 0.12),
    new THREE.Vector2(0.35, 0.22),
    new THREE.Vector2(0.28, 0.26)
  ];
}

function createPawnGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.2, 0.4),
    new THREE.Vector2(0.18, 0.6),
    new THREE.Vector2(0.22, 0.64),
    new THREE.Vector2(0.26, 0.68),
    new THREE.Vector2(0.22, 0.72),
    new THREE.Vector2(0.12, 0.76),
    new THREE.Vector2(0, 0.95)
  ];
  return new THREE.LatheGeometry(points, 24);
}

function createRookGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.28, 0.5),
    new THREE.Vector2(0.3, 0.8),
    new THREE.Vector2(0.36, 0.85),
    new THREE.Vector2(0.36, 1.05),
    new THREE.Vector2(0.24, 1.05),
    new THREE.Vector2(0, 1.05)
  ];
  return new THREE.LatheGeometry(points, 24);
}

function createBishopGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.22, 0.5),
    new THREE.Vector2(0.25, 0.75),
    new THREE.Vector2(0.28, 0.85),
    new THREE.Vector2(0.22, 1.1),
    new THREE.Vector2(0.12, 1.2),
    new THREE.Vector2(0.04, 1.24),
    new THREE.Vector2(0, 1.3)
  ];
  return new THREE.LatheGeometry(points, 24);
}

function createQueenGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.24, 0.5),
    new THREE.Vector2(0.2, 0.8),
    new THREE.Vector2(0.32, 1.1),
    new THREE.Vector2(0.38, 1.35),
    new THREE.Vector2(0.25, 1.38),
    new THREE.Vector2(0.08, 1.45),
    new THREE.Vector2(0, 1.55)
  ];
  return new THREE.LatheGeometry(points, 28);
}

function createKingGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.26, 0.5),
    new THREE.Vector2(0.22, 0.85),
    new THREE.Vector2(0.35, 1.2),
    new THREE.Vector2(0.4, 1.45),
    new THREE.Vector2(0.28, 1.5),
    new THREE.Vector2(0.08, 1.58),
    new THREE.Vector2(0, 1.7)
  ];
  return new THREE.LatheGeometry(points, 28);
}

function createKnightGeometry() {
  return new THREE.LatheGeometry(createBasePoints(), 20);
}
