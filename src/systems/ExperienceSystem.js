import Phaser from 'phaser';
import { LEVEL } from '../config/gameConfig.js';

export default class ExperienceSystem extends Phaser.Events.EventEmitter {
  constructor() { super(); this.level = 1; this.exp = 0; }

  get isMax() { return this.level >= LEVEL.maxLevel; }
  get required() { return this.isMax ? 0 : Math.round(LEVEL.baseExp * Math.pow(this.level, LEVEL.growth)); }

  addExp(amount) {
    if (this.isMax) return;
    this.exp += amount;
    while (!this.isMax && this.exp >= this.required) {
      this.exp -= this.required;
      this.level++;
      this.emit('levelup', this.level);
    }
    if (this.isMax) this.exp = 0;
  }
}
