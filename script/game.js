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
    get generations() {
        return this._generations;
    }
    set generations(value) {
        this._generations = value;
        this.game.updateGameStatistics();
    }
    get gamePaused() {
        return this._gamePaused;
    }
    set gamePaused(value) {
        this._gamePaused = value;
        this.game.updateGameStatus();
    }
    constructor(game) {
        this._generations = 0;
        this._gamePaused = true;
        this.generationInterval = 200; // this value is stored in ms
        this.cellSize = 16;
        this.cellBorderColor = "rgba(100, 100, 100, 0.3)";
        this.cellBackgroundColor = "black";
        this.cellLiveBackgroundColor = "white";
        this.cellHoverBackgroundColor = "lightgray";
        this.game = game;
    }
}
export class Game {
    constructor(canvas, gameStatus, generationCount, populationCount) {
        this.elapsed = 0;
        this.nextLiveCells = [];
        this.liveCells = [];
        this.maxFpsValues = 10;
        this.fpsValues = new Array(this.maxFpsValues);
        this.info = new GameInfo(this);
        this.canvas = canvas;
        this.gameStatus = gameStatus;
        this.generationCount = generationCount;
        this.populationCount = populationCount;
        this.ctx = canvas.getContext("2d");
        this.canvas.addEventListener("mousemove", (event) => this.onMouseMoveOnCanvas(event));
        this.canvas.addEventListener("mouseleave", (event) => this.onMouseLeaveCanvas(event));
        this.canvas.addEventListener("click", (event) => this.onClickOnCanvas(event));
    }
    // HTML functions
    updateGameStatus() {
        this.gameStatus.textContent = this.info.gamePaused
            ? "Game paused"
            : `Game playing at ${this.getAverageFps().toFixed(1)} fps`;
    }
    updateGameStatistics() {
        this.generationCount.textContent = this.info.generations.toString();
        this.populationCount.textContent = this.liveCells.length.toString();
    }
    // Canvas functions
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const columns = this.canvas.width / this.info.cellSize;
        const rows = this.canvas.height / this.info.cellSize;
        this.ctx.strokeStyle = this.info.cellBorderColor;
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.drawCellBorder(x, y);
            }
        }
        this.ctx.fillStyle = this.info.cellLiveBackgroundColor;
        this.liveCells.forEach((pos) => {
            this.drawCell(pos.x, pos.y);
        });
        if (this.hoveredCell) {
            this.ctx.fillStyle = this.info.cellHoverBackgroundColor;
            this.drawCell(this.hoveredCell.x, this.hoveredCell.y);
        }
    }
    drawCellBorder(column, row) {
        this.ctx.beginPath();
        this.ctx.rect(column * this.info.cellSize, row * this.info.cellSize, this.info.cellSize, this.info.cellSize);
        this.ctx.closePath();
        this.ctx.stroke();
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
        const deltaTime = timestamp - this.previousTimestamp;
        this.elapsed += deltaTime;
        if (this.fpsValues.length > this.maxFpsValues)
            this.fpsValues.splice(0, this.fpsValues.length - this.maxFpsValues);
        if (deltaTime != 0)
            this.fpsValues.push((1 / deltaTime) * 1000);
        this.drawGrid();
        if (this.elapsed >= this.info.generationInterval) {
            this.elapsed -= this.info.generationInterval;
            if (!this.info.gamePaused)
                this.runGeneration();
        }
        this.previousTimestamp = timestamp;
        this.updateGameStatus();
        requestAnimationFrame((t) => this.drawFrame(t));
    }
    // Event handlers
    onMouseMoveOnCanvas(event) {
        this.hoveredCell = this.getCellAtCoordinates(event.offsetX, event.offsetY);
    }
    onMouseLeaveCanvas(_) {
        this.hoveredCell = undefined;
    }
    onClickOnCanvas(event) {
        const position = this.getCellAtCoordinates(event.offsetX, event.offsetY);
        const index = this.indexOfPosition(position, this.liveCells);
        // If the cell is not live
        if (index == -1) {
            this.liveCells.push(position);
        }
        else {
            this.liveCells.splice(index, 1);
        }
        this.updateGameStatistics();
    }
    // Game functions
    getAverageFps() {
        if (this.fpsValues.length == 0)
            return 0;
        return this.fpsValues.reduce((prev, curr) => prev + curr) / this.fpsValues.length;
    }
    resetGame() {
        this.info.generations = 0;
        this.info.gamePaused = true;
        this.liveCells = [];
        this.nextLiveCells = [];
        this.previousTimestamp = undefined;
        this.start = undefined;
        this.elapsed = 0;
        this.updateGameStatistics();
        this.updateGameStatus();
    }
    runGeneration() {
        this.nextLiveCells = structuredClone(this.liveCells);
        const enqueuedCells = this.findCellsThatNeedProcessing();
        for (const cell of enqueuedCells) {
            const liveNeighborCount = this.getLiveNeighbors(cell).length;
            const isAlive = this.isCellAlive(cell);
            let index = -1;
            if (liveNeighborCount < 2 && isAlive)
                index = this.indexOfPosition(cell, this.nextLiveCells);
            if (liveNeighborCount > 3 && isAlive)
                index = this.indexOfPosition(cell, this.nextLiveCells);
            if (liveNeighborCount == 3 && !isAlive)
                this.nextLiveCells.push(cell);
            if (index != -1) {
                this.nextLiveCells.splice(index, 1);
            }
        }
        this.liveCells = this.nextLiveCells;
        this.info.generations++;
        this.updateGameStatistics();
    }
    findCellsThatNeedProcessing() {
        const enqueued = [];
        for (const cell of this.liveCells) {
            enqueued.push(cell);
            const neighbors = this.getNeighbors(cell);
            for (const neighbor of neighbors) {
                if (!this.isPositionInArray(neighbor, enqueued)) {
                    enqueued.push(neighbor);
                }
            }
        }
        return enqueued;
    }
    // Cell functions
    getLiveNeighbors(pos) {
        return this.getNeighbors(pos).filter((pos) => this.isCellAlive(pos));
    }
    getNeighbors(pos) {
        const neighbors = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (x == 0 && y == 0)
                    continue;
                neighbors.push(new Position(pos.x + x, pos.y + y));
            }
        }
        return neighbors;
    }
    isCellAlive(pos) {
        return this.isPositionInArray(pos, this.liveCells);
    }
    isPositionInArray(pos, arr) {
        return this.indexOfPosition(pos, arr) != -1;
    }
    indexOfPosition(pos, arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].x == pos.x && arr[i].y == pos.y)
                return i;
        }
        return -1;
    }
    getCellAtCoordinates(x, y) {
        x = clamp(x, 0, this.canvas.width);
        y = clamp(y, 0, this.canvas.height);
        const column = Math.trunc(x / this.info.cellSize);
        const row = Math.trunc(y / this.info.cellSize);
        return new Position(column, row);
    }
}
