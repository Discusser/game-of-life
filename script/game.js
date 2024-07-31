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
    }
}
export class Game {
    constructor(canvas) {
        this.elapsed = 0;
        this.renderElapsed = 0;
        this.info = new GameInfo();
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }
    // Canvas functions
    drawGrid(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const columns = this.canvas.width / this.info.cellSize;
        const rows = this.canvas.height / this.info.cellSize;
        this.ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
        this.ctx.fillStyle = "black";
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.ctx.beginPath();
                this.ctx.rect(x * this.info.cellSize, y * this.info.cellSize, this.info.cellSize, this.info.cellSize);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }
    drawFrame(timestamp) {
        if (this.start === undefined)
            this.start = timestamp;
        if (this.previousTimestamp === undefined)
            this.previousTimestamp = timestamp;
        this.elapsed += timestamp - this.previousTimestamp;
        this.renderElapsed += timestamp - this.previousTimestamp;
        this.drawGrid(timestamp);
        if (this.elapsed >= this.info.generationInterval) {
            this.elapsed -= this.info.generationInterval;
            if (!this.info.gamePaused)
                this.runGeneration();
        }
        this.previousTimestamp = timestamp;
        requestAnimationFrame((t) => this.drawFrame(t));
    }
    // Game functions
    runGeneration() { }
    // Cell functions
    isPositionValid(position) { }
    isCellAlive(position) { }
    countNeighbors(position) { }
}
