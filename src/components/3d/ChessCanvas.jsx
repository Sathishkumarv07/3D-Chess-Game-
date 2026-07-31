import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChessBoard3D } from './ChessBoard3D';
import { ChessPiece3D } from './ChessPiece3D';
import { EnvironmentLighting } from './EnvironmentLighting';

export function ChessCanvas({
  game,
  selectedSquare,
  legalMoves,
  lastMove,
  kingInCheckPos,
  theme = 'brown',
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
            onClick={() => onPieceClick(row, col)}
          />
        );
      }
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows
        camera={{ position: [0, 7.5, 7.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <EnvironmentLighting />

        <ChessBoard3D
          boardState={game.board}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          kingInCheckPos={kingInCheckPos}
          theme={theme}
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
