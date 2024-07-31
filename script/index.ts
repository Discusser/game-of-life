import { Position, Game } from "./game.js";

const CELLS_PER_ROW = 48;
const ROWS = CELLS_PER_ROW / 2;

const gameContainer = document.querySelector<HTMLCanvasElement>(".game-container");
const gameStatus = document.querySelector<HTMLLabelElement>(".game-status");
const generationCount = document.querySelector<HTMLSpanElement>(".generation-count");

// 2D array containing all our cells. 0 means black (dead), 1 means white (alive)
let cells: Array<Array<number>> = [];
let gamePaused = false;

function onMouseEnterGameCell(this: HTMLDivElement, _: MouseEvent) {
  const cellElement = this;
  cellElement.style.backgroundColor = isCellAlive(this) ? "darkgray" : "lightgray";
}

function onMouseLeaveGameCell(this: HTMLDivElement, _: MouseEvent) {
  const cellElement = this;
  cellElement.style.backgroundColor = isCellAlive(this) ? "white" : "black";
}

function updateCellColor(cellElement: HTMLDivElement, cellValue: number = -1) {
  if ((cellValue = -1)) {
    const pos = getCellPosition(cellElement);
    cellValue = cells[pos.y][pos.x];
  }
  cellElement.style.backgroundColor = cellValue == 0 ? "black" : "white";
}

function getCellElementAtPosition(pos: Position) {
  return gameContainer?.children[pos.y * CELLS_PER_ROW + pos.x] as HTMLDivElement;
}

function isPositionValid(pos: Position) {
  return pos.y >= 0 && pos.y < ROWS && pos.x >= 0 && pos.x < CELLS_PER_ROW;
}

function isCellAlive(cell: HTMLDivElement | Position) {
  const pos = cell instanceof Position ? cell : getCellPosition(cell);
  return isPositionValid(pos) && cells[pos.y][pos.x] == 1;
}

function getCellPosition(cellElement: HTMLDivElement) {
  const x = parseInt(cellElement.getAttribute("data-x") || "");
  const y = parseInt(cellElement.getAttribute("data-y") || "");

  return {
    x,
    y,
  };
}

function countNeighbors(cell: HTMLDivElement | Position): number {
  const pos = cell instanceof Position ? cell : getCellPosition(cell);
  let neighborCount = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i == 0 && j == 0) continue;
      if (isCellAlive(new Position(pos.x + i, pos.y + j))) neighborCount++;
    }
  }

  return neighborCount;
}

function runGeneration() {
  const cellsCopy = cells.map((row) => {
    return [...row];
  });

  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
      const neighborCount = countNeighbors(new Position(x, y));
      if (neighborCount < 2) cellsCopy[y][x] = 0;
      if (neighborCount > 3) cellsCopy[y][x] = 0;
      if (neighborCount == 3 && cells[y][x] == 0) cellsCopy[y][x] = 1;
    }
  }

  cells = cellsCopy;
  updateAllCellColors();

  if (generationCount) {
    generationCount.textContent = (parseInt(generationCount?.textContent || "0") + 1).toString();
  }
}

function updateAllCellColors() {
  cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      const element = getCellElementAtPosition(new Position(x, y));
      if (element == undefined) return;
      updateCellColor(element, cell);
    });
  });
}

function onClickGameCell(this: HTMLDivElement, _: MouseEvent) {
  const cellElement = this;
  const pos = getCellPosition(cellElement);

  if (!isNaN(pos.x) && !isNaN(pos.y)) {
    cells[pos.y][pos.x] = cells[pos.y][pos.x] == 0 ? 1 : 0;
    updateCellColor(this, cells[pos.y][pos.x]);
  }
}

function constructGrid() {
  if (gameContainer == null) return;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < CELLS_PER_ROW; x++) {
      const cellElement = document.createElement("div");

      const size = parseInt(window.getComputedStyle(gameContainer).width) / CELLS_PER_ROW + "px";
      cellElement.style.width = size;
      cellElement.style.height = size;
      cellElement.classList.add("game-cell");
      cellElement.setAttribute("data-x", x.toString());
      cellElement.setAttribute("data-y", y.toString());
      cellElement.addEventListener("mouseenter", onMouseEnterGameCell);
      cellElement.addEventListener("mouseleave", onMouseLeaveGameCell);
      cellElement.addEventListener("click", onClickGameCell);

      gameContainer.appendChild(cellElement);
    }
  }
}

function playGame() {
  const delay = (document.querySelector(".option-generation-interval") as HTMLInputElement).valueAsNumber;
  runGeneration();

  if (!gamePaused) setTimeout(playGame, delay);
}

function resetGame() {
  cells = new Array(ROWS).fill(0).map(() => new Array(CELLS_PER_ROW).fill(0));
  updateAllCellColors();

  if (generationCount) generationCount.textContent = "0";
}

function pauseGame() {
  gamePaused = true;
  updateGameStatus();
}

function updateGameStatus() {
  if (gameStatus) {
    gameStatus.textContent = gamePaused ? "Game paused" : "Game playing";
  }
}

const game = new Game(gameContainer!);

document.querySelector(".button-play")?.addEventListener("click", () => {
  gamePaused = false;
  updateGameStatus();
  playGame();
});
document.querySelector(".button-pause")?.addEventListener("click", pauseGame);
document.querySelector(".button-next-generation")?.addEventListener("click", () => {
  game.runGeneration();
});
document.querySelector(".button-reset")?.addEventListener("click", resetGame);

// resetGame();
// constructGrid();
requestAnimationFrame((t) => game.drawFrame(t));
