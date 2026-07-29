import { registerPBallGame } from './pball/index.js';
import { registerCraboidGame } from './craboid/index.js';

const gameModules = [
  registerPBallGame,
  registerCraboidGame
];

export function registerGames() {
  gameModules.forEach((registerGameModule) => registerGameModule());
}
