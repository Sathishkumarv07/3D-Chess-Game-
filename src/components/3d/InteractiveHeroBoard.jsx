import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChessBoard3D } from './ChessBoard3D';
import { ChessPiece3D } from './ChessPiece3D';
import { EnvironmentLighting } from './EnvironmentLighting';
import { ChessGame } from '../../engine/chessEngine';
import { sounds } from '../../audio/soundSystem';

const demoGame = new ChessGame();

function RotatingGroup({ children }) {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

function PhysicsHeroPiece({ type, color, basePos, knockTrigger }) {
  const meshGroupRef = useRef();
  const physRef = useRef({
    x: basePos[0],
    y: basePos[1],
    z: basePos[2],
    vx: 0,
    vy: 0,
    vz: 0,
    rx: 0,
    ry: color === 'w' ? 0 : Math.PI,
    rz: 0,
    rvx: 0,
    rvy: 0,
    rvz: 0,
    isKnocked: false
  });

  const lastTriggerRef = useRef(0);

  useMemo(() => {
    physRef.current.x = basePos[0];
    physRef.current.y = basePos[1];
    physRef.current.z = basePos[2];
  }, [basePos]);

  if (knockTrigger > 0 && knockTrigger !== lastTriggerRef.current) {
    lastTriggerRef.current = knockTrigger;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.2 + Math.random() * 3.8;
    physRef.current.vx = Math.cos(angle) * speed;
    physRef.current.vy = 4.0 + Math.random() * 4.5;
    physRef.current.vz = Math.sin(angle) * speed;
    physRef.current.rvx = (Math.random() - 0.5) * 14;
    physRef.current.rvy = (Math.random() - 0.5) * 14;
    physRef.current.rvz = (Math.random() - 0.5) * 14;
    physRef.current.isKnocked = true;
  }

  useFrame((state, delta) => {
    if (!meshGroupRef.current) return;
    const st = physRef.current;
    if (st.isKnocked) {
      st.vy -= delta * 12.0; // Gravity simulation
      st.x += st.vx * delta;
      st.y += st.vy * delta;
      st.z += st.vz * delta;
      st.rx += st.rvx * delta;
      st.ry += st.rvy * delta;
      st.rz += st.rvz * delta;

      if (st.y < -4.5) {
        st.isKnocked = false;
      }
    } else {
      st.x += (basePos[0] - st.x) * Math.min(delta * 4, 1);
      st.y += (basePos[1] - st.y) * Math.min(delta * 4, 1);
      st.z += (basePos[2] - st.z) * Math.min(delta * 4, 1);
      st.rx += (0 - st.rx) * Math.min(delta * 4, 1);
      st.ry += ((color === 'w' ? 0 : Math.PI) - st.ry) * Math.min(delta * 4, 1);
      st.rz += (0 - st.rz) * Math.min(delta * 4, 1);
    }

    meshGroupRef.current.position.set(st.x, st.y, st.z);
    meshGroupRef.current.rotation.set(st.rx, st.ry, st.rz);
  });

  return (
    <group ref={meshGroupRef}>
      <ChessPiece3D type={type} color={color} position={[0, 0, 0]} isSelected={false} isPossibleTarget={false} />
    </group>
  );
}

function FallingPieceItem({ type, color, initialX, initialZ, initialY, speed, rotSpeed, knockTrigger }) {
  const groupRef = useRef();
  const pos = useRef({ x: initialX, y: initialY, z: initialZ });
  const rot = useRef({
    x: Math.random() * Math.PI * 2,
    y: Math.random() * Math.PI * 2,
    z: Math.random() * Math.PI * 2
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      const currentSpeed = knockTrigger > 0 ? speed * 1.8 : speed;
      pos.current.y -= delta * currentSpeed;
      rot.current.x += delta * rotSpeed.x * (knockTrigger > 0 ? 2 : 1);
      rot.current.y += delta * rotSpeed.y * (knockTrigger > 0 ? 2 : 1);
      rot.current.z += delta * rotSpeed.z * (knockTrigger > 0 ? 2 : 1);

      if (pos.current.y < -3.8) {
        pos.current.y = 8 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        const dist = 4.2 + Math.random() * 4.5;
        pos.current.x = Math.cos(angle) * dist;
        pos.current.z = Math.sin(angle) * dist;
      }

      groupRef.current.position.set(pos.current.x, pos.current.y, pos.current.z);
      groupRef.current.rotation.set(rot.current.x, rot.current.y, rot.current.z);
    }
  });

  return (
    <group ref={groupRef}>
      <ChessPiece3D type={type} color={color} position={[0, 0, 0]} isSelected={false} isPossibleTarget={false} />
    </group>
  );
}

function FallingPieces3D({ knockTrigger }) {
  const pieces = useMemo(() => {
    const types = ['p', 'n', 'b', 'r', 'q', 'k'];
    const colors = ['w', 'b'];
    const items = [];
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2;
      const dist = 4.0 + Math.random() * 4.2;
      items.push({
        id: `falling-piece-${i}`,
        type: types[i % types.length],
        color: colors[i % 2],
        initialX: Math.cos(angle) * dist,
        initialZ: Math.sin(angle) * dist,
        initialY: (i % 6) * 1.8 + Math.random() * 3,
        speed: 1.8 + Math.random() * 2.2,
        rotSpeed: {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3,
          z: (Math.random() - 0.5) * 3
        }
      });
    }
    return items;
  }, []);

  return (
    <group>
      {pieces.map((item) => (
        <FallingPieceItem key={item.id} {...item} knockTrigger={knockTrigger} />
      ))}
    </group>
  );
}

export function InteractiveHeroBoard({ theme = 'brown', bgEnvironment = 'earth_sun' }) {
  const [knockTrigger, setKnockTrigger] = useState(0);

  const pieceElements = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = demoGame.board[row][col];
      if (piece) {
        const posX = col - 3.5;
        const posZ = row - 3.5;
        pieceElements.push(
          <PhysicsHeroPiece
            key={`hero-piece-${row}-${col}-${piece.type}-${piece.color}`}
            type={piece.type}
            color={piece.color}
            basePos={[posX, 0.1, posZ]}
            knockTrigger={knockTrigger}
          />
        );
      }
    }
  }

  const handleCanvasClick = () => {
    sounds.playCapture();
    setKnockTrigger((prev) => prev + 1);
  };

  return (
    <div
      style={{ width: '100%', height: '520px', borderRadius: '24px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasClick}
    >
      <Canvas
        shadows
        camera={{ position: [5.5, 6.5, 6.5], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        <EnvironmentLighting bgEnvironment={bgEnvironment} />

        <RotatingGroup>
          <ChessBoard3D
            boardState={demoGame.board}
            theme={theme}
          />
          {pieceElements}
        </RotatingGroup>

        {/* Falling Animated 3D Pieces */}
        <FallingPieces3D knockTrigger={knockTrigger} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2 - 0.05}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
