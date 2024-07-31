function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

class GeneralSet<T extends StringHashable> {
  public map: Map<string, T>;

  constructor(other?: GeneralSet<T>) {
    if (other) {
      this.map = new Map(other.map);
    } else {
      this.map = new Map();
    }
  }

  add(item: T) {
    this.map.set(item.hash(), item);
  }

  values() {
    return this.map.values();
  }

  delete(item: T) {
    return this.map.delete(item.hash());
  }

  has(item: T) {
    return this.map.has(item.hash());
  }
}

interface StringHashable {
  hash(): string;
}

class Position implements StringHashable {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  hash(): string {
    return `${this.x}-${this.y}`;
  }
}

export class GameInfo {
  private game: Game;
  private _generations: number = 0;
  private _gamePaused: boolean = true;
  public generationInterval: number = 200; // this value is stored in ms
  public cellSize: number = 16;
  public cellBorderColor: string | CanvasGradient | CanvasPattern = "rgba(100, 100, 100, 0.3)";
  public cellBackgroundColor: string | CanvasGradient | CanvasPattern = "black";
  public cellLiveBackgroundColor: string | CanvasGradient | CanvasPattern = "white";
  public cellHoverBackgroundColor: string | CanvasGradient | CanvasPattern = "lightgray";
  public drawGrid: boolean = true;

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

  constructor(game: Game) {
    this.game = game;
  }
}

export class Game {
  public info: GameInfo;
  private canvas: HTMLCanvasElement;
  private gameStatus: HTMLLabelElement;
  private generationCount: HTMLSpanElement;
  private populationCount: HTMLSpanElement;
  private ctx: CanvasRenderingContext2D;
  private start: DOMHighResTimeStamp | undefined;
  private previousTimestamp: DOMHighResTimeStamp | undefined;
  private elapsed: DOMHighResTimeStamp = 0;
  private nextLiveCells: GeneralSet<Position> = new GeneralSet();
  private liveCells: GeneralSet<Position> = new GeneralSet();
  private hoveredCell: Position | undefined;
  private maxFpsValues = 10;
  private fpsValues: Array<number> = new Array(this.maxFpsValues);
  private canPan: boolean = false;
  private mouseButtonHeld: number | undefined;
  private scale: number = 1;
  private maxScale: number = 3;
  private minScale: number = 0.05;
  private mouseMovement: [number, number] = [0, 0];

  constructor(
    canvas: HTMLCanvasElement,
    gameStatus: HTMLLabelElement,
    generationCount: HTMLSpanElement,
    populationCount: HTMLSpanElement,
  ) {
    this.info = new GameInfo(this);
    this.canvas = canvas;
    this.gameStatus = gameStatus;
    this.generationCount = generationCount;
    this.populationCount = populationCount;
    this.ctx = canvas.getContext("2d")!;

    this.canvas.addEventListener("contextmenu", (event) => this.onContextMenuOnCanvas(event));
    this.canvas.addEventListener("wheel", (event) => this.onScrollOnCanvas(event));
    this.canvas.addEventListener("mousedown", (event) => this.onMouseDownOnCanvas(event));
    this.canvas.addEventListener("mouseup", (event) => this.onMouseUpOnCanvas(event));
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
    this.populationCount.textContent = this.liveCells.map.size.toString();
  }

  // Canvas functions
  drawGrid() {
    if (!this.info.drawGrid || this.scale <= 0.5) return;

    const transform = this.ctx.getTransform();
    const x1 = Math.floor(-Math.abs(transform.e / this.info.cellSize / this.scale));
    const y1 = Math.floor(-Math.abs(transform.f / this.info.cellSize / this.scale));
    const x2 = Math.ceil(this.canvas.width / this.info.cellSize / this.scale - x1);
    const y2 = Math.ceil(this.canvas.height / this.info.cellSize / this.scale - y1);

    this.ctx.strokeStyle = this.info.cellBorderColor;
    for (let x = x2; x >= x1; x--) {
      for (let y = y2; y >= y1; y--) {
        this.drawCellBorder(x, y, this.info.cellSize);
      }
    }
  }

  drawCells() {
    this.ctx.strokeStyle = this.info.cellBorderColor;
    this.ctx.fillStyle = this.info.cellLiveBackgroundColor;
    this.liveCells.map.forEach((pos) => {
      this.drawCell(pos.x, pos.y, this.info.cellSize);
    });

    if (this.hoveredCell) {
      this.ctx.fillStyle = this.info.cellHoverBackgroundColor;
      this.drawCell(this.hoveredCell.x, this.hoveredCell.y, this.info.cellSize);
    }
  }

  drawCellBorder(column: number, row: number, cellSize: number) {
    this.ctx.beginPath();
    this.ctx.rect(column * cellSize, row * cellSize, cellSize, cellSize);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  drawCell(column: number, row: number, cellSize: number) {
    this.drawCellBorder(column, row, cellSize);
    this.ctx.fill();
  }

  drawFrame(timestamp: DOMHighResTimeStamp) {
    if (this.start === undefined) this.start = timestamp;
    if (this.previousTimestamp === undefined) this.previousTimestamp = timestamp;
    const deltaTime = timestamp - this.previousTimestamp;
    this.elapsed += deltaTime;

    if (this.fpsValues.length > this.maxFpsValues) this.fpsValues.splice(0, this.fpsValues.length - this.maxFpsValues);
    if (deltaTime != 0) this.fpsValues.push((1 / deltaTime) * 1000);

    const previousTransform = this.ctx.getTransform();
    this.ctx.setTransform(new DOMMatrix());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(previousTransform);
    this.drawGrid();
    this.drawCells();

    if (this.elapsed >= this.info.generationInterval) {
      this.elapsed = this.elapsed % this.info.generationInterval;
      if (!this.info.gamePaused) this.runGeneration();
    }

    this.previousTimestamp = timestamp;
    this.updateGameStatus();
    requestAnimationFrame((t) => this.drawFrame(t));
  }

  // Event handlers
  onContextMenuOnCanvas(event: MouseEvent) {
    event.preventDefault();
  }

  onScrollOnCanvas(event: WheelEvent) {
    const transform = this.ctx.getTransform();
    const transformed = this.transformCoordinates(this.canvas.width / 2, this.canvas.height / 2);

    let scaleMultiplier = 1 - 0.2 * Math.sign(event.deltaY);
    const newScale = transform.a * scaleMultiplier;
    if (newScale > this.maxScale) scaleMultiplier = this.maxScale / transform.a;
    else if (newScale < this.minScale) scaleMultiplier = this.minScale / transform.a;

    transform.scaleSelf(scaleMultiplier, scaleMultiplier, 1, transformed.x, transformed.y);
    this.scale = transform.a;

    this.ctx.setTransform(transform);
  }

  onMouseDownOnCanvas(event: MouseEvent) {
    this.mouseButtonHeld = event.button;
    if (this.mouseButtonHeld == 2) this.canPan = true;
  }

  onMouseUpOnCanvas(_: MouseEvent) {
    if (this.mouseButtonHeld == 2) {
      this.canPan = false;
      this.mouseMovement = [0, 0];
    }
    this.mouseButtonHeld = undefined;
  }

  onMouseMoveOnCanvas(event: MouseEvent) {
    // Don't display hovered cell when holding right click
    if (this.mouseButtonHeld == 2) this.hoveredCell = undefined;
    else this.hoveredCell = this.getCellAtCoordinates(event.offsetX, event.offsetY);

    if (this.canPan) {
      const transform = this.ctx.getTransform();
      const scaledSize = this.info.cellSize * this.scale;
      this.mouseMovement[0] += event.movementX;
      this.mouseMovement[1] += event.movementY;
      if (Math.abs(this.mouseMovement[0]) >= scaledSize) {
        transform.e += Math.trunc(this.mouseMovement[0] / scaledSize) * scaledSize;
        this.mouseMovement[0] = this.mouseMovement[0] % scaledSize;
      }
      if (Math.abs(this.mouseMovement[1]) >= scaledSize) {
        transform.f += Math.trunc(this.mouseMovement[1] / scaledSize) * scaledSize;
        this.mouseMovement[1] = this.mouseMovement[1] % scaledSize;
      }
      this.ctx.setTransform(transform);
    }
  }

  onMouseLeaveCanvas(_: MouseEvent) {
    this.hoveredCell = undefined;
    this.mouseButtonHeld = undefined;
    this.canPan = false;
  }

  onClickOnCanvas(event: MouseEvent) {
    const position = this.getCellAtCoordinates(event.offsetX, event.offsetY);

    if (this.liveCells.has(position)) {
      this.liveCells.delete(position);
    } else {
      this.liveCells.add(position);
    }

    this.updateGameStatistics();
  }

  // Game functions
  getAverageFps() {
    if (this.fpsValues.length == 0) return 0;

    return this.fpsValues.reduce((prev, curr) => prev + curr) / this.fpsValues.length;
  }

  resetGame() {
    this.info.generations = 0;
    this.info.gamePaused = true;
    this.liveCells = new GeneralSet();
    this.nextLiveCells = new GeneralSet();
    this.previousTimestamp = undefined;
    this.start = undefined;
    this.elapsed = 0;

    this.updateGameStatistics();
    this.updateGameStatus();
  }

  runGeneration() {
    this.nextLiveCells = new GeneralSet(this.liveCells);

    const enqueuedCells = this.findCellsThatNeedProcessing();
    for (const [_, cell] of enqueuedCells.map) {
      const liveNeighborCount = this.getLiveNeighbors(cell).length;
      const isAlive = this.isCellAlive(cell);
      let shouldKill = false;
      if (liveNeighborCount < 2 && isAlive) shouldKill = this.nextLiveCells.has(cell);
      if (liveNeighborCount > 3 && isAlive) shouldKill = this.nextLiveCells.has(cell);
      if (liveNeighborCount == 3 && !isAlive) this.nextLiveCells.add(cell);

      if (shouldKill) {
        this.nextLiveCells.delete(cell);
      }
    }

    this.liveCells = this.nextLiveCells;
    this.info.generations++;
    this.updateGameStatistics();
  }

  findCellsThatNeedProcessing() {
    const enqueued: GeneralSet<Position> = new GeneralSet();
    for (const [_, cell] of this.liveCells.map) {
      enqueued.add(cell);

      const neighbors = this.getNeighbors(cell);
      for (const neighbor of neighbors) {
        enqueued.add(neighbor);
      }
    }

    return enqueued;
  }

  // Cell functions
  getLiveNeighbors(pos: Position) {
    return this.getNeighbors(pos).filter((pos) => this.isCellAlive(pos));
  }

  getNeighbors(pos: Position) {
    const neighbors: Array<Position> = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x == 0 && y == 0) continue;

        neighbors.push(new Position(pos.x + x, pos.y + y));
      }
    }

    return neighbors;
  }

  isCellAlive(pos: Position) {
    return this.liveCells.has(pos);
  }

  getCellAtCoordinates(x: number, y: number) {
    x = clamp(x, 0, this.canvas.width);
    y = clamp(y, 0, this.canvas.height);
    const transformed = this.transformCoordinates(x, y);

    const column = Math.floor(transformed.x / this.info.cellSize);
    const row = Math.floor(transformed.y / this.info.cellSize);

    return new Position(column, row);
  }

  transformCoordinates(x: number, y: number) {
    const transform = this.ctx.getTransform().inverse();
    return {
      x: transform.a * x + transform.c * y + transform.e,
      y: transform.b * x + transform.d * y + transform.f,
    };
  }
}
