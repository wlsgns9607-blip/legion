import Phaser from 'phaser';
import { GAME } from './config/gameConfig.js';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

window.phaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.width,
  height: GAME.height,
  backgroundColor: '#000000',
  physics: { default: 'arcade', arcade: { gravity: { y: GAME.gravity }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, GameScene]
});
