import { registerPBallGame } from './pball/index.js';

const gameModules = [
  registerPBallGame
];

export function registerGames() {
  gameModules.forEach((registerGameModule) => registerGameModule());
}
