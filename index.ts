const CELLS_PER_ROW = 10;
const ROWS = 10;

const gameContainer = document.querySelector<HTMLDivElement>(".game-container");

function constructGrid() {
  if (gameContainer == null) return;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < CELLS_PER_ROW; x++) {
      const cellElement = document.createElement("div");

      const size = parseInt(window.getComputedStyle(gameContainer).width) / CELLS_PER_ROW + "px";
      cellElement.style.width = size;
      cellElement.style.height = size;
      cellElement.classList.add("game-cell");

      gameContainer.appendChild(cellElement);
    }
  }
}

constructGrid();
