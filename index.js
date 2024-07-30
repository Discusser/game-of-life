var CELLS_PER_ROW = 48;
var ROWS = CELLS_PER_ROW / 2;
var gameContainer = document.querySelector(".game-container");
function onMouseEnterGameCell(_) {
    var cellElement = this;
    cellElement.style.backgroundColor = "lightgray";
}
function onMouseLeaveGameCell(_) {
    var cellElement = this;
    cellElement.style.backgroundColor = "black";
}
function constructGrid() {
    if (gameContainer == null)
        return;
    for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < CELLS_PER_ROW; x++) {
            var cellElement = document.createElement("div");
            var size = parseInt(window.getComputedStyle(gameContainer).width) / CELLS_PER_ROW + "px";
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
