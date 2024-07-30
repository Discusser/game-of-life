"use strict";
const CELLS_PER_ROW = 48;
const ROWS = CELLS_PER_ROW / 2;
const gameContainer = document.querySelector(".game-container");
// 2D array containing all our cells. 0 means black (dead), 1 means white (alive)
const cells = new Array(ROWS).fill(0).map(() => new Array(CELLS_PER_ROW).fill(0));
function onMouseEnterGameCell(_) {
    const cellElement = this;
    cellElement.style.backgroundColor = isCellAlive(this) ? "darkgray" : "lightgray";
}
function onMouseLeaveGameCell(_) {
    const cellElement = this;
    cellElement.style.backgroundColor = isCellAlive(this) ? "white" : "black";
}
function updateCellColor(cellElement, cellValue) {
    cellElement.style.backgroundColor = cellValue == 0 ? "black" : "white";
}
function isCellAlive(cellElement) {
    const pos = getCellPosition(cellElement);
    return !isNaN(pos.y) && !isNaN(pos.x) && cells[pos.y][pos.x] == 1;
}
function getCellPosition(cellElement) {
    const x = parseInt(cellElement.getAttribute("data-x") || "");
    const y = parseInt(cellElement.getAttribute("data-y") || "");
    return {
        x,
        y,
    };
}
function onClickGameCell(_) {
    const cellElement = this;
    const pos = getCellPosition(cellElement);
    if (!isNaN(pos.x) && !isNaN(pos.y)) {
        cells[pos.y][pos.x] = cells[pos.y][pos.x] == 0 ? 1 : 0;
        updateCellColor(this, cells[pos.y][pos.x]);
    }
}
function constructGrid() {
    if (gameContainer == null)
        return;
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
constructGrid();
