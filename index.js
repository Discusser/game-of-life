var CELLS_PER_ROW = 10;
var ROWS = 10;
var gameContainer = document.querySelector(".game-container");
function constructGrid() {
    if (gameContainer == null)
        return;
    for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < CELLS_PER_ROW; x++) {
            var cellElement = document.createElement("div");
            cellElement.classList.add("game-cell");
            var size = parseInt(window.getComputedStyle(gameContainer).width) / CELLS_PER_ROW + "px";
            cellElement.style.width = size;
            cellElement.style.height = size;
            console.log(size);
            // cellElement.style.backgroundColor = "black";
            // cellElement.style.borderColor = "white";
            // cellElement.style.borderWidth = "2px";
            // cellElement.style.borderStyle = "solid";
            gameContainer.appendChild(cellElement);
        }
    }
}
constructGrid();
