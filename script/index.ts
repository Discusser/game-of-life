import { Game } from "./game.js";

const gameContainer = document.querySelector<HTMLCanvasElement>(".game-container")!;
const gameStatus = document.querySelector<HTMLLabelElement>(".game-status")!;
const generationCount = document.querySelector<HTMLSpanElement>(".generation-count")!;
const populationCount = document.querySelector<HTMLSpanElement>(".population-count")!;
const buttonDrawMode = document.querySelector<HTMLInputElement>(".button-draw-mode")!;
const keysPressed: Map<string, boolean> = new Map();
const game = new Game(gameContainer, gameStatus, generationCount, populationCount, buttonDrawMode);

document.querySelector(".button-play")?.addEventListener("click", () => {
  game.info.gamePaused = false;
});

document.querySelector(".button-pause")?.addEventListener("click", () => {
  game.info.gamePaused = true;
});

document.querySelector(".button-next-generation")?.addEventListener("click", () => {
  game.runGeneration();
});

document.querySelector(".button-reset")?.addEventListener("click", () => {
  game.resetGame();
});

document.querySelector(".button-toggle-grid")?.addEventListener("click", () => {
  game.info.drawGrid = !game.info.drawGrid;
});

buttonDrawMode.addEventListener("click", () => game.switchDrawMode());

window.addEventListener("keydown", (event) => {
  if (!keysPressed.get(event.key)) {
    keysPressed.set(event.key, true);

    switch (event.key) {
      case "f":
        game.switchDrawMode();
        break;
      case "g":
        game.info.drawGrid = !game.info.drawGrid;
        break;
      case "v":
        game.info.drawHover = !game.info.drawHover;
        break;
      case "p":
        game.info.gamePaused = !game.info.gamePaused;
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  keysPressed.set(event.key, false);
});

document.querySelector(".option-generation-interval")?.addEventListener("input", (event: Event) => {
  if (event instanceof InputEvent) {
    const inputEvent = event as InputEvent;
    if (inputEvent.target instanceof HTMLInputElement) {
      game.info.generationInterval = inputEvent.target.valueAsNumber;
    }
  }
});

game.startGame();
