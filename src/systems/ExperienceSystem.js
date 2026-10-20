import Phaser from 'phaser';
import { LEVEL } from '../config/gameConfig.js';

export default class ExperienceSystem extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this.level = 1;
    this.exp = 0;
  }

  get isMax() {
    return this.level >= LEVEL.maxLevel;
  }

  get required() {
    if (this.isMax) return 0;
    if (typeof LEVEL.getRequiredExp === 'function') {
      return LEVEL.getRequiredExp(this.level);
    }
    return Math.round(LEVEL.baseExp * Math.pow(this.level, LEVEL.growth || 1.25));
  }

  addExp(amount) {
    if (this.isMax || amount <= 0) return;
    this.exp += amount;

    while (!this.isMax && this.exp >= this.required) {
      const req = this.required;
      this.exp -= req;
      this.level++;
      this.emit('levelup', this.level);
    }

    if (this.isMax) this.exp = 0;
  }
}
