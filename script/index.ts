import { Game } from "./game.js";

const gameContainer = document.querySelector<HTMLCanvasElement>(".game-container")!;
const gameStatus = document.querySelector<HTMLLabelElement>(".game-status")!;
const generationCount = document.querySelector<HTMLSpanElement>(".generation-count")!;
const populationCount = document.querySelector<HTMLSpanElement>(".population-count")!;
const game = new Game(gameContainer, gameStatus, generationCount, populationCount);

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

document.querySelector(".option-generation-interval")?.addEventListener("input", (event: Event) => {
  if (event instanceof InputEvent) {
    const inputEvent = event as InputEvent;
    if (inputEvent.target instanceof HTMLInputElement) {
      game.info.generationInterval = inputEvent.target.valueAsNumber;
    }
  }
});

requestAnimationFrame((t) => game.drawFrame(t));