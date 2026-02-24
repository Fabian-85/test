import React, { useEffect, useRef } from 'react';
import { useTetris } from '../hooks/useTetris';
import { COLS, ROWS, BLOCK_SIZE } from '../constants';

const Tetris: React.FC = () => {
  const {
    board,
    activePiece,
    nextPiece,
    score,
    gameOver,
    isPaused,
    level,
    lines,
    handleMove,
    handleRotate,
    hardDrop,
    setIsPaused,
    resetGame,
    drop
  } = useTetris();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleMove({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleMove({ x: 1, y: 0 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          drop();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleRotate();
          break;
        case ' ':
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, handleMove, handleRotate, hardDrop, setIsPaused, drop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Board
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) {
          drawBlock(ctx, x, y, color);
        } else {
          // Grid lines
          ctx.strokeStyle = '#333';
          ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });

    // Draw Active Piece
    activePiece.shape.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) {
          drawBlock(ctx, activePiece.pos.x + x, activePiece.pos.y + y, activePiece.color);
        }
      });
    });
  }, [board, activePiece]);

  useEffect(() => {
    const canvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nextPiece.shape.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) {
          drawBlock(ctx, x, y, nextPiece.color, BLOCK_SIZE * 0.8);
        }
      });
    });
  }, [nextPiece]);

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = BLOCK_SIZE) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.strokeRect(x * size, y * size, size, size);
    
    // Add shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x * size, y * size, size, size / 4);
  };

  return (
    <div className="game-container">
      <div className="main-area">
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
          className="game-board"
        />
        {(gameOver || isPaused) && (
          <div className="overlay">
            {gameOver ? (
              <div className="game-over">
                <h2>GAME OVER</h2>
                <button onClick={resetGame}>Try Again</button>
              </div>
            ) : (
              <div className="paused">
                <h2>PAUSED</h2>
                <button onClick={() => setIsPaused(false)}>Resume</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="side-panel">
        <div className="stat-box">
          <h3>NEXT</h3>
          <canvas
            ref={nextCanvasRef}
            width={4 * BLOCK_SIZE * 0.8}
            height={4 * BLOCK_SIZE * 0.8}
          />
        </div>
        <div className="stat-box">
          <h3>SCORE</h3>
          <p>{score}</p>
        </div>
        <div className="stat-box">
          <h3>LEVEL</h3>
          <p>{level}</p>
        </div>
        <div className="stat-box">
          <h3>LINES</h3>
          <p>{lines}</p>
        </div>
        <div className="controls-help">
          <p>← → : Move</p>
          <p>↑ : Rotate</p>
          <p>↓ : Soft Drop</p>
          <p>Space : Hard Drop</p>
          <p>P : Pause</p>
        </div>
      </div>
    </div>
  );
};

export default Tetris;
