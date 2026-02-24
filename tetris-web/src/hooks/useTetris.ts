import { useState, useEffect, useCallback, useRef } from 'react';
import { COLS, ROWS, TETROMINOS, RANDOM_TETROMINOS, type TetrominoKey } from '../constants';

type Board = (string | null)[][];

interface Piece {
  shape: number[][];
  color: string;
  pos: { x: number; y: number };
  type: TetrominoKey;
}

const createEmptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const getRandomTetromino = (): Piece => {
  const type = RANDOM_TETROMINOS[Math.floor(Math.random() * RANDOM_TETROMINOS.length)] as TetrominoKey;
  return {
    ...TETROMINOS[type],
    pos: { x: Math.floor(COLS / 2) - 2, y: 0 },
    type
  };
};

export const useTetris = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [activePiece, setActivePiece] = useState<Piece>(getRandomTetromino());
  const [nextPiece, setNextPiece] = useState<Piece>(getRandomTetromino());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);

  const gameLoopRef = useRef<number | undefined>(undefined);

  const checkCollision = useCallback(
    (pos: { x: number; y: number }, shape: number[][]) => {
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            const newX = pos.x + x;
            const newY = pos.y + y;

            if (
              newX < 0 ||
              newX >= COLS ||
              newY >= ROWS ||
              (newY >= 0 && board[newY][newX] !== null)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [board]
  );

  const rotate = (shape: number[][]) => {
    const rotated = shape[0].map((_, index) =>
      shape.map((col) => col[index]).reverse()
    );
    return rotated;
  };

  const handleRotate = () => {
    const rotatedShape = rotate(activePiece.shape);
    if (!checkCollision(activePiece.pos, rotatedShape)) {
      setActivePiece((prev: Piece) => ({ ...prev, shape: rotatedShape }));
    }
  };

  const handleMove = (dir: { x: number; y: number }) => {
    const newPos = { x: activePiece.pos.x + dir.x, y: activePiece.pos.y + dir.y };
    if (!checkCollision(newPos, activePiece.shape)) {
      setActivePiece((prev: Piece) => ({ ...prev, pos: newPos }));
      return true;
    }
    return false;
  };

  const placePiece = useCallback(() => {
    const newBoard = board.map((row) => [...row]);
    activePiece.shape.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) {
          const boardY = activePiece.pos.y + y;
          const boardX = activePiece.pos.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = activePiece.color;
          }
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    const filteredBoard = newBoard.filter((row) => {
      const isFull = row.every((cell) => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill(null));
    }

    if (linesCleared > 0) {
      setScore((prev) => prev + [0, 100, 300, 500, 800][linesCleared] * level);
      setLines((prev) => {
        const newLines = prev + linesCleared;
        if (newLines >= level * 10) {
          setLevel((l) => l + 1);
        }
        return newLines;
      });
    }

    setBoard(filteredBoard);
    
    // Spawn next piece
    if (checkCollision(nextPiece.pos, nextPiece.shape)) {
      setGameOver(true);
    } else {
      setActivePiece(nextPiece);
      setNextPiece(getRandomTetromino());
    }
  }, [activePiece, board, checkCollision, nextPiece, level]);

  const drop = useCallback(() => {
    if (!handleMove({ x: 0, y: 1 })) {
      placePiece();
    }
  }, [handleMove, placePiece]);

  const hardDrop = () => {
    let newY = activePiece.pos.y;
    while (!checkCollision({ x: activePiece.pos.x, y: newY + 1 }, activePiece.shape)) {
      newY++;
    }
    setActivePiece((prev: Piece) => ({ ...prev, pos: { ...prev.pos, y: newY } }));
  };

  useEffect(() => {
    if (!gameOver && !isPaused) {
      const interval = Math.max(100, 1000 - (level - 1) * 100);
      gameLoopRef.current = window.setInterval(drop, interval);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [drop, gameOver, isPaused, level]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setActivePiece(getRandomTetromino());
    setNextPiece(getRandomTetromino());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setLevel(1);
    setLines(0);
  };

  return {
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
  };
};
