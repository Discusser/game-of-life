function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class GameInfo {
    constructor() {
        this.generationInterval = 200; // this value is stored in ms
        this.gamePaused = true;
        this.generations = 0;
        this.cellSize = 16;
        this.cellBorderColor = "rgba(100, 100, 100, 0.3)";
        this.cellBackgroundColor = "black";
        this.cellHoverBackgroundColor = "lightgray";
    }
}
export class Game {
    constructor(canvas) {
        this.elapsed = 0;
        this.liveCells = [];
        this.info = new GameInfo();
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.addEventListener("mousemove", (event) => this.onMouseMoveOnCanvas(event));
    }
    // Canvas functions
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const columns = this.canvas.width / this.info.cellSize;
        const rows = this.canvas.height / this.info.cellSize;
        this.ctx.strokeStyle = this.info.cellBorderColor;
        this.ctx.fillStyle = this.info.cellBackgroundColor;
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.drawCell(x, y);
            }
        }
        if (this.hoveredCell) {
            this.ctx.fillStyle = this.info.cellHoverBackgroundColor;
            this.drawCell(this.hoveredCell.x, this.hoveredCell.y);
        }
    }
    drawCell(column, row) {
        this.ctx.beginPath();
        this.ctx.rect(column * this.info.cellSize, row * this.info.cellSize, this.info.cellSize, this.info.cellSize);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }
    drawFrame(timestamp) {
        if (this.start === undefined)
            this.start = timestamp;
        if (this.previousTimestamp === undefined)
            this.previousTimestamp = timestamp;
        this.elapsed += timestamp - this.previousTimestamp;
        this.drawGrid();
        if (this.elapsed >= this.info.generationInterval) {
            this.elapsed -= this.info.generationInterval;
            if (!this.info.gamePaused)
                this.runGeneration();
        }
        this.previousTimestamp = timestamp;
        requestAnimationFrame((t) => this.drawFrame(t));
    }
    onMouseMoveOnCanvas(event) {
        const x = clamp(event.offsetX, 0, this.canvas.width);
        const y = clamp(event.offsetY, 0, this.canvas.height);
        const column = Math.trunc(x / this.info.cellSize);
        const row = Math.trunc(y / this.info.cellSize);
        this.hoveredCell = new Position(column, row);
    }
    // Game functions
    runGeneration() { }
    // Cell functions
    isPositionValid(position) { }
    isCellAlive(position) { }
    countNeighbors(position) { }
}
