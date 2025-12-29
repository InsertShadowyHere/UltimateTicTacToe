const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restart');
const viewBoardButton = document.getElementById('viewBoard');
// TODO - add undo button, maybe fix spacing if i care enough
canvas.height = window.innerHeight - 10;
canvas.width = canvas.height;
viewBoardButton.hidden = true;

// COLORS
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const RED = '#FF0000';
const TRANSL_RED = 'rgba(255, 0, 0, 0.8)'
const BLUE = '#0000FF';
const TRANSL_BLUE = 'rgba(0, 0, 255, 0.8)'
const DARK_RED = '#320000';
const DARK_BLUE = '#000032';
const GRAY = '#888888';

// RESIZING STUFF
let outerMargin, innerMargin;
let bigBarWidth, smallBarWidth;
let pos;
let availSpace = canvas.width - outerMargin*2;
let boardSize, boardReal, cellSize;
let imgMargin, imgSize;
let bigFont, lilFont;

// TEMPs
let relX;
let relY;
let notFull = 0;

// GAME VARS
let turn = 1;
let allowed = null;
let boards = [];
let won = null;
let gameOver = null;
let debug_mode = false; // developer only so no touchies pls - it lets you play anywhere

// DRAWING
imgO = new Image()
imgO.src = "assets/o.png"
imgX = new Image()
imgX.src = "assets/x.png"

// GRAPHICAL FUNCTIONS
function handleResize () {
    canvas.height = window.innerHeight - 10;
    canvas.width = canvas.height;

    bigBarWidth = Math.ceil(canvas.height / 60); // 14 px on my sscreen size
    smallBarWidth = Math.ceil(canvas.height / 200); // 4 px on my sscreen size

    outerMargin = Math.floor(canvas.height / 40) // 20 px on my screen size
    innerMargin = Math.floor(canvas.height / 40) // 20 px on my sscreen size

    availSpace = canvas.width - outerMargin*2
    boardSize = Math.floor((availSpace - bigBarWidth*2) / 3)
    boardReal = boardSize - innerMargin * 2

    cellSize = Math.floor((boardReal - smallBarWidth * 2) / 3);

    imgMargin = Math.floor(cellSize/10);
    imgSize = cellSize - 2*imgMargin;

    bigFont = Math.floor(canvas.width / 30)
    lilFont = Math.floor(canvas.width / 45)

    setBoardsPos();
    drawGame();
}

function setBoardsPos() {
    for (let i=0; i<9; i++) {
        pos = [outerMargin+innerMargin, outerMargin+innerMargin]
        pos[0] += (boardSize+bigBarWidth)*(i % 3)
        pos[1] += (boardSize+bigBarWidth)*Math.floor(i / 3)
        boards[i].tl = pos;
        boards[i].br = [pos[0] + boardReal, pos[1] + boardReal];
    }
}

// LOCATION FUNCTIONS 
function getMouseBoard(x, y) {
    for (let i=0; i<9; i++) {
        if (x >= boards[i].tl[0] && x <= boards[i].br[0] &&
            y >= boards[i].tl[1] && y <= boards[i].br[1]) {
                return i;
        }
    }
}

function getMouseRelCell(x, y) {
    for (let i=0; i<9; i++) {
        // do frogs bounce
        cellX = (i % 3) * (cellSize + smallBarWidth);
        cellY = Math.floor(i / 3) * (cellSize + smallBarWidth);
        if (x >= cellX && x <= cellX + cellSize &&
            y >= cellY && y <= cellY + cellSize) {
                return i;
        }
    }
}

// GAME DEFINITIONS
class Board {
    constructor(pos) {
        this.grid = [null, null, null, null, null, null, null, null, null];
        this.scored = null;
        this.tl = pos;
        this.br = [pos[0] + boardReal, pos[1] + boardReal];
        
    }

    check() {
        notFull = 0;
        // check to see if grid is filled
        for (let i=0; i<9; i++) {
            if (this.grid[i] !== null)
                notFull += 1;
        }
        if (notFull === 9){
            this.scored = 2;
            return
        }

        for (let i=0; i<3; i++) {
            // check horizontal
            if (this.grid[i*3] === this.grid[i*3 + 1] 
                && this.grid[i*3] === this.grid[i*3 + 2] 
                && this.grid[i*3] !== null)
                this.scored = this.grid[i*3];
            // vertical
            if (this.grid[i] === this.grid[i+3]
                && this.grid[i] === this.grid[i+6] 
                && this.grid[i] !== null) {this.scored = this.grid[i];}
        }
        
        // diagonal tl-br
        if (this.grid[0] === this.grid[4] 
            && this.grid[0] === this.grid[8] 
            && this.grid[0] !== null)
            this.scored = this.grid[0];
        // diagonal tr-bl
        if (this.grid[2] === this.grid[4]
            && this.grid[2] === this.grid[6] 
            && this.grid[2] !== null)
            this.scored = this.grid[2];
        
        
        if (this.scored !== null)
            bigCheck();
    }

    mark(cellNum) {
        this.grid[cellNum] = turn;
    }

    draw(dulled) {
        ctx.imageSmoothingEnabled = false;
        if (this.scored === 1 || this.scored === 0) {
            
            ctx.drawImage(this.scored === 1 ? imgX : imgO, this.tl[0]+imgMargin, this.tl[1]+imgMargin, boardReal-2*imgMargin, boardReal-2*imgMargin)
            return
        }
        ctx.fillStyle = dulled === false ? WHITE : GRAY;

        // vertical
        ctx.fillRect(this.tl[0]+cellSize, this.tl[1], smallBarWidth, boardReal);
        ctx.fillRect(this.tl[0]+boardReal-cellSize-smallBarWidth, this.tl[1], smallBarWidth, boardReal);

        // horizontal
        ctx.fillRect(this.tl[0], this.tl[1]+cellSize, boardReal, smallBarWidth);
        ctx.fillRect(this.tl[0], this.tl[1]+boardReal-cellSize-smallBarWidth, boardReal, smallBarWidth);
        
        // draw X/Os 
        for (let i = 0; i<9; i++) {
            if (this.grid[i] == null)
                continue
            ctx.fillStyle = this.grid[i] === 1 ? RED : BLUE
            relX = this.tl[0] + (cellSize+smallBarWidth)*(i % 3)
            relY = this.tl[1] + (cellSize+smallBarWidth)*Math.floor(i/3)
            
            ctx.drawImage(this.grid[i] === 1 ? imgX : imgO, relX+imgMargin, relY+imgMargin, imgSize, imgSize)
            //ctx.fillRect(relX, relY, cellSize, cellSize)

            // TODO - add image loading -------------------------
        }
    }
};

function initBoards() {
    for (let i=0; i<9; i++) {
        pos = [outerMargin+innerMargin, outerMargin+innerMargin]
        pos[0] += (boardSize+bigBarWidth)*(i % 3)
        pos[1] += (boardSize+bigBarWidth)*Math.floor(i / 3)
        boards.push(new Board(pos))
    }
}

initBoards();
// ok lets be real whos reading the code for my crappy web game???
// i appreciate you whoever you are
// youre awesome

function bigCheck() {
    notFull = 0;
    // check to see if grid is filled
    for (let i=0; i<9; i++) {
        if (boards[i].scored !== null)
            notFull += 1;
    }
    if (notFull === 9){
        won = 2;
        return
    }
    // check horizontal scores
    for (let i=0; i<3; i++) {
        if (boards[i*3].scored === boards[i*3 + 1].scored 
            && boards[i*3].scored === boards[i*3 + 2].scored 
            && (0 === boards[i*3].scored
            || 1 === boards[i*3].scored))
            won = boards[i*3].scored;
        if (boards[i].scored === boards[i+3].scored 
            && boards[i].scored === boards[i+6].scored 
            && (0 === boards[i].scored
            || 1 === boards[i].scored))
            won = boards[i].scored;

    }
    // diagonal tl-br
    if (boards[0].scored === boards[4].scored
        && boards[0].scored === boards[8].scored 
        && (0 === boards[0].scored
        || 1 === boards[0].scored))
        won = boards[0].scored;
    // diagonal tr-bl
    if (boards[2].scored === boards[4].scored
        && boards[2].scored === boards[6].scored 
        && (0 === boards[2].scored
        || 1 === boards[2].scored))
        won = boards[2].scored;
    
    if (won !== null) {
        gameOver = 1;
        viewBoardButton.hidden = false;
    }
}

handleResize();

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // on click, we should:
    // check that the game isn't over already
    if (gameOver !== null)
        return
    // get board that's being clicked on
    boardNum = getMouseBoard(x, y);
    // validate board existence
    if (boardNum === undefined)
        return;
    // validate board allowedness
    if (allowed !== null && debug_mode === false) {
        if (boardNum !== allowed) 
            return;
    }
    // get the cell that's being clicked on
    relX = x - boards[boardNum].tl[0];
    relY = y - boards[boardNum].tl[1];
    cellNum = getMouseRelCell(relX, relY);

    // if its populated, pass
    if (boards[boardNum].grid[cellNum] !== null) 
        return;

    // mark the cell
    boards[boardNum].mark(cellNum);

    // check the board
    boards[boardNum].check();

    // switch turns
    turn = turn === 1 ? 0 : 1;


    // define new allowed (unless in debug_mode)
    if (boards[cellNum].scored !== null) 
        allowed = null
    else if (debug_mode === false)
        allowed = cellNum

    drawGame();
}


function drawGame() {
    
    ctx.fillStyle = turn === 1 ? DARK_RED : DARK_BLUE;
    if (gameOver)
        ctx.fillStyle = "rgb(60, 60, 60)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 0: if game is won, show win overlay and return
    if (won !== null) {
        let userText;
        if (won == 2) {
            ctx.fillStyle = BLACK;
            userText = "Nobody"; 
        }
        else {
            ctx.fillStyle = won === 1 ? DARK_RED : DARK_BLUE;
            userText = won === 1 ? "X" : "O"
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = WHITE;
        ctx.font = String(bigFont) + "pt Helvetica"
        let mst = ctx.measureText(userText + " won the game! Well done.")
        ctx.fillText(userText + " won the game! Well done.", canvas.width/2 - mst.width/2, canvas.height/2)
        // no way ur still reading my code!!
        // awesomeeeeeee
        // i think im in love
        // (with you)
        // 
        // ...
        //
        // ...
        //
        // see that's funny because i dont know who you are and so im confessing my love to a complete stranger
        // 
        // but thats the trick - maybe i DO love you and i just dont know that ur reading my code
        // or maybe i think youre a really awful person and this is extra weird
        // i doubt the latter cus there aren't many people i think that about
        // either way ur probbaly cool so yea
        // thanks
        // for being cool
        // i guess
        ctx.font = String(lilFont) + "pt Helvetica"
        let mst2 = ctx.measureText("Use the sidebar buttons to continue.")
        ctx.fillText("Use the sidebar buttons to continue.", canvas.width/2 - mst2.width/2, canvas.height/2+(bigFont+lilFont)*0.8)
        return
    }

    // 1: draw the big board
    ctx.fillStyle = WHITE;
    // 1.1: verticals
    ctx.fillRect(outerMargin+boardSize, outerMargin, bigBarWidth, availSpace);
    ctx.fillRect(canvas.height - outerMargin - boardSize - bigBarWidth, outerMargin, bigBarWidth, availSpace);
    // 1.2: horizontals
    ctx.fillRect(outerMargin, outerMargin+boardSize, availSpace, bigBarWidth);
    ctx.fillRect(outerMargin, canvas.width - outerMargin - boardSize - bigBarWidth, availSpace, bigBarWidth);

    // 2: draw each small board
    for (let i=0; i<9; i++) {
        if (allowed !== null && allowed !== i)
            boards[i].draw(true);
        else
            boards[i].draw(false);
    }
}

canvas.addEventListener('click', handleClick);

window.addEventListener("resize", handleResize);

restartButton.addEventListener("click", (e) => {
    turn = 1;
    allowed = null;
    boards = [];
    initBoards();
    won = null;
    gameOver = null;
    viewBoardButton.hidden = true;
    // the potatos are taking over my miiiiiiiiiind
    drawGame();
});

viewBoardButton.addEventListener("click", (e) => {
    won = null;
    allowed = null;
    drawGame();
});

drawGame();