import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Flame, RotateCcw } from 'lucide-react';
import { ChessBoard3D } from './ChessBoard3D';
import { ChessPiece3D } from './ChessPiece3D';
import { EnvironmentLighting } from './EnvironmentLighting';
import { sounds } from '../../audio/soundSystem';

export function ChessCanvas({
  game,
  selectedSquare,
  legalMoves,
  lastMove,
  kingInCheckPos,
  theme = 'brown',
  bgEnvironment = 'earth_sun',
  setBgEnvironment,
  isTorchOn = false,
  setIsTorchOn,
  lowSpecMode = false,
  onSquareClick,
  onPieceClick
}) {
  const controlsRef = useRef();

  const pieceElements = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = game.board[row][col];
      if (piece) {
        const posX = col - 3.5;
        const posZ = row - 3.5;
        const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
        const isPossibleTarget = legalMoves.some(m => m.to.row === row && m.to.col === col);

        pieceElements.push(
          <ChessPiece3D
            key={`piece-${row}-${col}-${piece.type}-${piece.color}`}
            type={piece.type}
            color={piece.color}
            position={[posX, 0.1, posZ]}
            isSelected={isSelected}
            isPossibleTarget={isPossibleTarget}
            lowSpecMode={lowSpecMode}
            onClick={() => onPieceClick(row, col)}
          />
        );
      }
    }
  }

  // Camera 180-degree flip handler
  const handleFlipCameraView = () => {
    sounds.playClick();
    if (controlsRef.current) {
      const cam = controlsRef.current.object;
      cam.position.x = -cam.position.x;
      cam.position.z = -cam.position.z;
      controlsRef.current.update();
    }
  };

  const envList = [
    { id: 'earth_sun', label: '☀️ Sun & Earth' },
    { id: 'red_theme', label: '🔴 Red Nebula' },
    { id: 'tournament', label: '🏆 Tournament' },
    { id: 'cozy_lounge', label: '🪵 Wood Lounge' },
    { id: 'royal_palace', label: '🏰 Royal Citadel' },
    { id: 'studio', label: '🎨 Studio' },
    { id: 'zen_garden', label: '🌿 Zen Garden' },
    { id: 'space', label: '🌌 Deep Space' }
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* 🎛️ Left-Middle Vertical Control Stack (Arranged One by One) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '46px',
          transform: 'translateY(-50%)',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(18, 9, 36, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 0, 127, 0.35)',
          borderRadius: '18px',
          padding: '12px 10px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* 1. 🔦 Torch Light Button */}
        <button
          onClick={() => {
            sounds.playClick();
            if (setIsTorchOn) setIsTorchOn(!isTorchOn);
          }}
          title="Toggle 3D Torch Light Mode"
          style={{
            background: isTorchOn ? 'linear-gradient(135deg, #ff7700, #ffaa00)' : 'rgba(255, 255, 255, 0.08)',
            color: isTorchOn ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${isTorchOn ? '#ffaa00' : 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: '12px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isTorchOn ? '0 0 16px rgba(255, 170, 0, 0.65)' : 'none',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Flame size={16} color={isTorchOn ? '#fff' : '#ffaa00'} />
          <span>{isTorchOn ? 'Torch ON' : 'Torch Light'}</span>
        </button>

        {/* 2. 🔄 Rotate Board View 180° Button */}
        <button
          onClick={handleFlipCameraView}
          title="Flip Camera View 180°"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--text-muted)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <RotateCcw size={15} />
          <span>180° View</span>
        </button>

        {/* 3. 🧭 Environment Selector Dropdown */}
        {setBgEnvironment && (
          <select
            value={bgEnvironment}
            onChange={(e) => {
              sounds.playClick();
              setBgEnvironment(e.target.value);
            }}
            style={{
              background: 'rgba(255, 0, 127, 0.18)',
              color: 'var(--accent-dragonfruit-bright)',
              border: '1px solid var(--accent-dragonfruit)',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {envList.map(e => (
              <option key={e.id} value={e.id} style={{ background: '#180930', color: '#fff' }}>
                {e.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3D Canvas R3F */}
      <Canvas
        shadows={!lowSpecMode}
        dpr={lowSpecMode ? 1 : [1, 1.5]}
        camera={{ position: [0, 7.5, 7.5], fov: 50 }}
        gl={{
          antialias: !lowSpecMode,
          alpha: true,
          powerPreference: lowSpecMode ? 'low-power' : 'default',
          precision: lowSpecMode ? 'mediump' : 'highp'
        }}
      >
        <EnvironmentLighting
          bgEnvironment={bgEnvironment}
          isTorchOn={isTorchOn}
          lowSpecMode={lowSpecMode}
        />

        <ChessBoard3D
          boardState={game.board}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          kingInCheckPos={kingInCheckPos}
          theme={theme}
          lowSpecMode={lowSpecMode}
          onSquareClick={onSquareClick}
        />

        {pieceElements}

        <OrbitControls
          ref={controlsRef}
          makeDefault
          minDistance={3.5}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2 - 0.05}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
