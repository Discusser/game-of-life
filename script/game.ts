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
}

export class Game {
  public info: GameInfo;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private start: DOMHighResTimeStamp | undefined;
  private previousTimestamp: DOMHighResTimeStamp | undefined;
  private elapsed: DOMHighResTimeStamp = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.info = new GameInfo();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
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
        this.ctx.beginPath();
        this.ctx.rect(x * this.info.cellSize, y * this.info.cellSize, this.info.cellSize, this.info.cellSize);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      }
    }
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

  // Game functions
  runGeneration() { }

  // Cell functions
  isPositionValid(position: Position) { }
  isCellAlive(position: Position) { }
  countNeighbors(position: Position) { }
}
