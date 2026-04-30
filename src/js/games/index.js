import { registerPongGame } from './pong/index.js';

const gameModules = [
  registerPongGame
];

export function registerGames() {
  gameModules.forEach((registerGameModule) => registerGameModule());
}
