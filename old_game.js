const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status');

// Constants
const BOARD_SIZE = 280;
const CELL_SIZE = 76;
const CELL_PADDING = 20;
const GRID_LINE_WIDTH = 6;
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const DARK_RED = '#320000';
const DARK_BLUE = '#000032';
const GRAY = '#888888';

// Game state
let boards = Array(9).fill(null).map(() => Array(9).fill(null));
let turn = 1; // 1 for X, 0 for O
let won = null;
let allowedBoard = null;
let debug = false;

// Initialize canvas size
canvas.width = 940;
canvas.height = 940;

// Helper functions
function getBoardPos(boardIndex) {
  return {
    x: 30 + (300 * (boardIndex % 3)),
    y: 30 + (Math.floor(boardIndex / 3) * 300)
  };
}

function getCellPos(cellIndex) {
  return {
    x: CELL_PADDING + (82 * (cellIndex % 3)),
    y: CELL_PADDING + (82 * (Math.floor(cellIndex / 3)))
  };
}

function checkBoardWin(boardIndex) {
  const board = boards[boardIndex];
  
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i * 3] !== null && 
        board[i * 3] === board[i * 3 + 1] && 
        board[i * 3] === board[i * 3 + 2]) {
      return board[i * 3];
    }
  }
  
  // Check columns
  for (let i = 0; i < 3; i++) {
    if (board[i] !== null && 
        board[i] === board[i + 3] && 
        board[i] === board[i + 6]) {
      return board[i];
    }
  }
  
  // Check diagonals
  if (board[0] !== null && board[0] === board[4] && board[0] === board[8]) {
    return board[0];
  }
  if (board[2] !== null && board[2] === board[4] && board[2] === board[6]) {
    return board[2];
  }
  
  // Check for draw
  if (board.every(cell => cell !== null)) {
    return 2; // Draw
  }
  
  return null;
}

function checkGameWin() {
  const bigBoard = Array(9).fill(null);
  for (let i = 0; i < 9; i++) {
    bigBoard[i] = checkBoardWin(i);
  }
  
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (bigBoard[i * 3] !== null && bigBoard[i * 3] < 2 &&
        bigBoard[i * 3] === bigBoard[i * 3 + 1] && 
        bigBoard[i * 3] === bigBoard[i * 3 + 2]) {
      return bigBoard[i * 3];
    }
  }
  
  // Check columns
  for (let i = 0; i < 3; i++) {
    if (bigBoard[i] !== null && bigBoard[i] < 2 &&
        bigBoard[i] === bigBoard[i + 3] && 
        bigBoard[i] === bigBoard[i + 6]) {
      return bigBoard[i];
    }
  }
  
  // Check diagonals
  if (bigBoard[0] !== null && bigBoard[0] < 2 && 
      bigBoard[0] === bigBoard[4] && bigBoard[0] === bigBoard[8]) {
    return bigBoard[0];
  }
  if (bigBoard[2] !== null && bigBoard[2] < 2 && 
      bigBoard[2] === bigBoard[4] && bigBoard[2] === bigBoard[6]) {
    return bigBoard[2];
  }
  
  return null;
}

function drawBoard(boardIndex, boardWinner) {
  const pos = getBoardPos(boardIndex);
  
  // Draw grid lines
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = GRID_LINE_WIDTH;
  
  // Vertical lines
  ctx.strokeRect(pos.x, pos.y, BOARD_SIZE, BOARD_SIZE);
  ctx.beginPath();
  ctx.moveTo(pos.x + 96, pos.y + 20);
  ctx.lineTo(pos.x + 96, pos.y + 260);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(pos.x + 178, pos.y + 20);
  ctx.lineTo(pos.x + 178, pos.y + 260);
  ctx.stroke();
  
  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(pos.x + 20, pos.y + 96);
  ctx.lineTo(pos.x + 260, pos.y + 96);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(pos.x + 20, pos.y + 178);
  ctx.lineTo(pos.x + 260, pos.y + 178);
  ctx.stroke();
  
  // Draw winner overlay
  if (boardWinner !== null && boardWinner !== undefined) {
    ctx.fillStyle = boardWinner === 1 ? 'rgba(200, 200, 200, 0.5)' : 'rgba(200, 200, 200, 0.5)';
    ctx.fillRect(pos.x, pos.y, BOARD_SIZE, BOARD_SIZE);
    
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (boardWinner === 1) {
      ctx.fillText('X', pos.x + BOARD_SIZE / 2, pos.y + BOARD_SIZE / 2);
    } else if (boardWinner === 0) {
      ctx.fillText('O', pos.x + BOARD_SIZE / 2, pos.y + BOARD_SIZE / 2);
    } else if (boardWinner === 2) {
      ctx.fillText('D', pos.x + BOARD_SIZE / 2, pos.y + BOARD_SIZE / 2);
    }
  }
  
  // Draw cells
  const board = boards[boardIndex];
  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) {
      const cellPos = getCellPos(i);
      ctx.fillStyle = WHITE;
      ctx.font = '50px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbol = board[i] === 1 ? 'X' : 'O';
      ctx.fillText(symbol, pos.x + cellPos.x + 38, pos.y + cellPos.y + 38);
    }
  }
}

function drawGame() {
  // Background
  ctx.fillStyle = turn === 1 ? DARK_RED : DARK_BLUE;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw big board grid
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 20;
  
  ctx.beginPath();
  ctx.moveTo(310, 20);
  ctx.lineTo(310, 920);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(610, 20);
  ctx.lineTo(610, 920);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(20, 310);
  ctx.lineTo(920, 310);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(20, 610);
  ctx.lineTo(920, 610);
  ctx.stroke();
  
  // Draw all boards
  const boardWinners = Array(9).fill(null).map((_, i) => checkBoardWin(i));
  
  for (let i = 0; i < 9; i++) {
    drawBoard(i, boardWinners[i]);
    
    // Fade allowed board if restricted
    if (allowedBoard !== null && allowedBoard !== i && allowedBoard !== undefined) {
      const pos = getBoardPos(i);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(pos.x, pos.y, BOARD_SIZE, BOARD_SIZE);
    }
  }
  
  // Draw win screen
  if (won !== null) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 54px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const winText = won === 1 ? 'X Won!' : 'O Won!';
    ctx.fillText(winText, canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '28px Arial';
    ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 50);
  }
  
  // Update status
  if (won !== null) {
    statusDisplay.textContent = `${won === 1 ? 'X' : 'O'} won the game!`;
  } else {
    statusDisplay.textContent = `Player ${turn === 1 ? 'X' : 'O'}'s Turn${allowedBoard !== null ? ` (Board ${allowedBoard})` : ''}`;
  }
}

function mark(boardIndex, cellIndex) {
  if (boards[boardIndex][cellIndex] !== null) return;
  
  boards[boardIndex][cellIndex] = turn;
  turn = turn === 1 ? 0 : 1;
  
  // Check for board win
  const boardWinner = checkBoardWin(boardIndex);
  
  // Update allowed board
  if (!debug) {
    const nextBoard = boards[boardIndex][cellIndex] === 1 ? boardIndex : cellIndex;
    if (checkBoardWin(cellIndex) === null) {
      allowedBoard = cellIndex;
    } else {
      allowedBoard = null;
    }
  }
  
  // Check for game win
  won = checkGameWin();
}

function restart() {
  boards = Array(9).fill(null).map(() => Array(9).fill(null));
  turn = 1;
  won = null;
  allowedBoard = null;
}

function getClickedCell(x, y) {
  // Find board
  for (let b = 0; b < 9; b++) {
    const boardPos = getBoardPos(b);
    if (x >= boardPos.x && x < boardPos.x + BOARD_SIZE &&
        y >= boardPos.y && y < boardPos.y + BOARD_SIZE) {
      
      // Find cell
      const relX = x - boardPos.x;
      const relY = y - boardPos.y;
      
      for (let c = 0; c < 9; c++) {
        const cellPos = getCellPos(c);
        if (relX >= cellPos.x && relX < cellPos.x + CELL_SIZE &&
            relY >= cellPos.y && relY < cellPos.y + CELL_SIZE) {
          return { board: b, cell: c };
        }
      }
    }
  }
  return null;
}

// Event listeners
canvas.addEventListener('click', (e) => {
  if (won !== null) {
    restart();
    return;
  }
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const clicked = getClickedCell(x, y);
  if (!clicked) return;
  
  const { board, cell } = clicked;
  
  // Check if move is allowed
  if (allowedBoard !== null && board !== allowedBoard) return;
  
  // Check if board is already won
  if (checkBoardWin(board) !== null) return;
  
  mark(board, cell);
});

//document.getElementById('restartButton').addEventListener('click', restart);

document.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') restart();
  if (e.key === 'd' || e.key === 'D') debug = !debug;
});

// Game loop
function gameLoop() {
  drawGame();
  requestAnimationFrame(gameLoop);
}

gameLoop();
