function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class GameInfo {
  public generationInterval: number = 200; // this value is stored in ms
  public gamePaused: boolean = true;
  public generations: number = 0;
  public cellSize: number = 16;
  public cellBorderColor: string | CanvasGradient | CanvasPattern = "rgba(100, 100, 100, 0.3)";
  public cellBackgroundColor: string | CanvasGradient | CanvasPattern = "black";
  public cellHoverBackgroundColor: string | CanvasGradient | CanvasPattern = "lightgray";
}

export class Game {
  public info: GameInfo;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private start: DOMHighResTimeStamp | undefined;
  private previousTimestamp: DOMHighResTimeStamp | undefined;
  private elapsed: DOMHighResTimeStamp = 0;
  private liveCells: Array<Position> = [];
  private hoveredCell: Position | undefined;

  constructor(canvas: HTMLCanvasElement) {
    this.info = new GameInfo();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.canvas.addEventListener("mousemove", (event) => this.onMouseMoveOnCanvas(event));
    this.canvas.addEventListener("click", (event) => this.onClickOnCanvas(event));
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

  drawCell(column: number, row: number) {
    this.ctx.beginPath();
    this.ctx.rect(column * this.info.cellSize, row * this.info.cellSize, this.info.cellSize, this.info.cellSize);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawFrame(timestamp: DOMHighResTimeStamp) {
    if (this.start === undefined) this.start = timestamp;
    if (this.previousTimestamp === undefined) this.previousTimestamp = timestamp;
    this.elapsed += timestamp - this.previousTimestamp;

    this.drawGrid();

    if (this.elapsed >= this.info.generationInterval) {
      this.elapsed -= this.info.generationInterval;
      if (!this.info.gamePaused) this.runGeneration();
    }

    this.previousTimestamp = timestamp;
    requestAnimationFrame((t) => this.drawFrame(t));
  }

  onMouseMoveOnCanvas(event: MouseEvent) {
    this.hoveredCell = this.getCellAtCoordinates(event.offsetX, event.offsetY);
  }

  onClickOnCanvas(event: MouseEvent) {
    const position = this.getCellAtCoordinates(event.offsetX, event.offsetY);
    let index = -1;
    for (let i = 0; i < this.liveCells.length; i++) {
      if (this.liveCells[i].x == position.x && this.liveCells[i].y == position.y) {
        index = i;
        break;
      }
    }

    // If the cell is not live
    if (index == -1) {
      console.log("dead");
      this.liveCells.push(position);
    } else {
      console.log("live");
      this.liveCells.splice(index, 1);
    }
  }

  getCellAtCoordinates(x: number, y: number) {
    x = clamp(x, 0, this.canvas.width);
    y = clamp(y, 0, this.canvas.height);

    const column = Math.trunc(x / this.info.cellSize);
    const row = Math.trunc(y / this.info.cellSize);

    return new Position(column, row);
  }

  // Game functions
  runGeneration() { }

  // Cell functions
  isPositionValid(position: Position) { }
  isCellAlive(position: Position) { }
  countNeighbors(position: Position) { }
}
