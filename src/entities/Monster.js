import Phaser from 'phaser';
import { MONSTER } from '../config/gameConfig.js';

export default class Monster extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, target) {
    super(scene, x, y, 'monster');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(50, 42).setOffset(6, 10);
    this.setCollideWorldBounds(true).setDepth(8);
    this.target = target;
    this.home = { x, y };
    this.exp = MONSTER.exp;
    this.bar = scene.add.graphics().setDepth(9);
    this.resetState();
  }

  resetState() {
    this.maxHp = this.hp = MONSTER.hp;
    this.isDead = false;
    this.hurtUntil = 0;
    this.state = 'idle';
  }

  update(time) {
    if (this.isDead || !this.active) return;
    this.drawBar();
    if (time < this.hurtUntil) return;            // 피격 경직 중

    const dx = this.target.x - this.x, dist = Math.abs(dx);
    if (!this.target.isDead && dist < MONSTER.aggroRange && dist > MONSTER.stopRange) {
      this.state = 'chase';
      this.setVelocityX(Math.sign(dx) * MONSTER.speed);
    } else {
      this.state = 'idle';
      this.setVelocityX(0);
    }
  }

  takeDamage(amount, dir, time) {
    if (this.isDead) return;
    this.hp -= amount;
    this.state = 'hurt';
    this.hurtUntil = time + 220;
    this.setVelocity(dir * 220, -180);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(120, () => this.active && this.clearTint());

    // 피격 시 쫀득한 스쿼시 연출 (타격감)
    this.scene.tweens.killTweensOf(this);
    this.setScale(1);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.82,
      yoyo: true,
      duration: 55,
      onComplete: () => { if (this.active && !this.isDead) this.setScale(1); }
    });

    if (this.hp <= 0) this.die();
  }

  die() {
    this.isDead = true;
    this.body.enable = false;
    this.bar.clear();
    this.scene.tweens.add({
      targets: this, alpha: 0, scaleY: 0.2, duration: 250,
      onComplete: () => this.setActive(false).setVisible(false)
    });
  }

  respawn() {
    this.resetState();
    this.setScale(1).setAlpha(1).clearTint();
    this.enableBody(true, this.home.x, this.home.y, true, true);
  }

  drawBar() {
    const w = 50, x = this.x - w / 2, y = this.y - 34;
    this.bar.clear()
      .fillStyle(0x000000, 0.6).fillRect(x - 1, y - 1, w + 2, 7)
      .fillStyle(0xe74c3c).fillRect(x, y, w * Math.max(0, this.hp / this.maxHp), 5);
  }
}
