import { registerCraboidGame } from './craboid/index.js';
import { registerPongGame } from './pong/index.js';

const gameModules = [
  registerPongGame,
  registerCraboidGame
];

export function registerGames() {
  gameModules.forEach((registerGameModule) => registerGameModule());
}
