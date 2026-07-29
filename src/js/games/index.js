import { registerPBallGame } from './pball/index.js';
import { registerCraboidGame } from './craboid/index.js';
import { registerPongGame } from './pong/index.js';

const gameModules = [
  registerPBallGame,
  registerPongGame,
  registerCraboidGame
];

export function registerGames() {
  gameModules.forEach((registerGameModule) => registerGameModule());
}
