import { useEffect, useState } from "react";
import "./App.css";

const BOARD_X = 10;
const BOARD_Y = 20;

const SQUARE_PIECE = [
  [1, 1],
  [1, 1],
]; // => []

const I_PIECE = [[1, 1, 1, 1]];

const T_PIECE = [
  [0, 1, 0],
  [1, 1, 1], // 2x3
];

const L_PIECE = [
  [1, 1, 1],
  [1, 0, 0],
];

class Tetris {
  board;
  piece;
  pieces;

  constructor() {
    this.board = Array(BOARD_Y)
      .fill("")
      .map(() => Array(BOARD_X).fill(0));
    this.pieces = [SQUARE_PIECE, L_PIECE, I_PIECE, T_PIECE];
  }

  generatePiece = () => {
    const shape = this.pieces[Math.floor(Math.random() * this.pieces.length)];
    this.piece = {
      x: Math.floor(BOARD_X / 2),
      y: 0,
      shape,
    };
    this.place({ shape });
  };

  place({ remove = false, stick = false, shape = this.piece.shape } = {}) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        const newY = this.piece.y + y;
        const newX = this.piece.x + x;
        this.board[newY][newX] = remove
          ? 0
          : stick && shape[y][x]
          ? 2
          : shape[y][x];
      }
    }
  }

  check({ dx, dy, shape }) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        const newY = this.piece.y + y + dy;
        const newX = this.piece.x + x + dx;
        if (newX < 0 || newX >= BOARD_X) {
          return false;
        }
        if (newY >= BOARD_Y) {
          return false;
        }
        if (this.board[newY][newX] === 2) {
          return false;
        }
      }
    }
    return true;
  }

  clearLines = () => {
    this.board.forEach((row, i) => {
      if (row.every((cell) => cell === 2)) {
        this.board.splice(i, 1);
        this.board.unshift(Array(BOARD_X).fill(0));
      }
    });
  };

  rotatePiece = () => {
    const { shape } = this.piece;
    const rotatedPiece = Array(shape[0].length)
      .fill("")
      .map(() => Array(shape.length).fill(0));

    //3x2 --> if rows > cols --> first row becomes first col,
    //  if cols > rows --> first col becomes second row
    // [
    //   [0, 1],
    //   [1, 1],
    //   [0, 1], //3x2
    // ];
    // [
    //   [1, 1, 1],
    //   [0, 1, 0], //2x3
    // ];
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        rotatedPiece[x][shape[0].length - y - 1] = shape[y][x];
      }
    }
    return rotatedPiece;
  };

  move = ({ dx = 0, dy = 0, rotate = false }) => {
    this.piece.shape = rotate ? this.rotatePiece() : this.piece.shape;
    const { shape } = this.piece;

    const isValid = this.check({ dx, dy, shape });

    if (!isValid && dy) {
      this.place({ stick: true, shape });
      this.clearLines();
      this.generatePiece();
      return;
    }

    if (!isValid) return;

    this.place({ remove: true, shape });
    this.piece.x += dx;
    this.piece.y += dy;
    this.place({ shape });
  };
}

const cellStyles = {
  width: "40px",
  height: "40px",
};

const tetris = new Tetris();
tetris.generatePiece();

function App() {
  const [, render] = useState({});

  useEffect(() => {
    const keyDownHandler = (e) => {
      if (e.key === "ArrowDown") {
        tetris.move({ dy: 1 });
      }

      if (e.key === "ArrowLeft") {
        tetris.move({ dx: -1 });
      }
      if (e.key === "ArrowRight") {
        tetris.move({ dx: 1 });
      }
      if (e.key === "ArrowUp") {
        tetris.move({ rotate: true });
      }
      render({});
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => document.removeEventListener("keydown", keyDownHandler);
  }, []);

  const getColor = (col) => {
    return col === 1 ? "red" : col === 2 ? "yellow" : "black";
  };
   useEffect(() => {
     const interval = setInterval(() => {
       tetris.move({ dy: 1 });
       render({});
     }, [500]);

     return () => clearInterval(interval);
   }, []);
  
  

  return (
    <>
      <h1>Tetris</h1>
      {tetris.board.map((row, i) => (
        <div key={i} style={{ display: "flex" }}>
          {row.map((col, j) => (
            <div
              key={j}
              style={{
                ...cellStyles,
                backgroundColor: getColor(col),
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
}

export default App;
