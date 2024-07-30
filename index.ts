const CELLS_PER_ROW = 48;
const ROWS = CELLS_PER_ROW / 2;

const gameContainer = document.querySelector<HTMLDivElement>(".game-container");

function onMouseEnterGameCell(_: MouseEvent) {
  const cellElement: HTMLDivElement = this;
  cellElement.style.backgroundColor = "lightgray";
}

function onMouseLeaveGameCell(_: MouseEvent) {
  const cellElement: HTMLDivElement = this;
  cellElement.style.backgroundColor = "black";
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
      cellElement.addEventListener("mouseenter", onMouseEnterGameCell);
      cellElement.addEventListener("mouseleave", onMouseLeaveGameCell);

      gameContainer.appendChild(cellElement);
    }
  }
}

constructGrid();
