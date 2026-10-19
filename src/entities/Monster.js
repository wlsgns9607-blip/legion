import Phaser from 'phaser';
import { MONSTER, MONSTER_TYPES } from '../config/gameConfig.js';

export default class Monster extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, target, type = 'normal') {
    const cfg = MONSTER_TYPES[type] || MONSTER_TYPES.normal;
    const texKey = cfg.texture || 'monster';
    super(scene, x, y, texKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    this.cfg = cfg;
    this.target = target;
    this.home = { x, y };

    this.baseScale = cfg.scale || 1.0;
    this.setScale(this.baseScale);

    const bw = Math.round(50 * this.baseScale);
    const bh = Math.round(42 * this.baseScale);
    this.body.setSize(bw, bh).setOffset(4, 8);
    this.setCollideWorldBounds(true).setDepth(cfg.isBoss ? 15 : 8);

    if (cfg.fly) {
      this.body.setAllowGravity(false);
    }

    this.exp = cfg.exp || MONSTER.exp;
    this.contactDamage = cfg.contactDamage || MONSTER.contactDamage;
    this.isBoss = !!cfg.isBoss;
    this.isElite = !!cfg.isElite;

    this.bar = scene.add.graphics().setDepth(cfg.isBoss ? 20 : 9);
    this.nameText = null;
    if (this.isBoss || this.isElite) {
      const label = cfg.name;
      this.nameText = scene.add.text(x, y - 50, label, {
        fontFamily: '"Malgun Gothic", sans-serif',
        fontSize: this.isBoss ? '13px' : '11px',
        color: this.isBoss ? '#ffd700' : '#00ffff',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(20);
    }

    this.resetState();
  }

  resetState() {
    this.maxHp = this.hp = this.cfg.hp || MONSTER.hp;
    this.isDead = false;
    this.hurtUntil = 0;
    this.state = 'idle';
  }

  update(time) {
    if (this.isDead || !this.active) {
      if (this.nameText) this.nameText.setVisible(false);
      return;
    }
    this.drawBar();

    if (this.nameText) {
      this.nameText.setVisible(true).setPosition(this.x, this.y - 48 * this.baseScale);
    }

    if (time < this.hurtUntil) return;

    const dx = this.target.x - this.x, dist = Math.abs(dx);
    const speed = this.cfg.speed || MONSTER.speed;

    if (!this.target.isDead && dist < MONSTER.aggroRange && dist > MONSTER.stopRange) {
      this.state = 'chase';
      this.setVelocityX(Math.sign(dx) * speed);

      // 비행 몬스터(박쥐) 부유 움직임
      if (this.cfg.fly) {
        const floatY = Math.sin(time * 0.005) * 45;
        this.setVelocityY(floatY);
      }
    } else {
      this.state = 'idle';
      this.setVelocityX(0);
      if (this.cfg.fly) this.setVelocityY(0);
    }
  }

  takeDamage(amount, dir, time) {
    if (this.isDead) return;
    this.hp -= amount;
    this.state = 'hurt';
    this.hurtUntil = time + (this.isBoss ? 160 : 260);

    this.setVelocity(0, 0);
    this.setTintFill(0xffffff);

    const knockback = this.isBoss ? 90 : (this.isElite ? 160 : 240);
    const knockbackUp = this.isBoss ? -70 : -170;

    this.scene.time.delayedCall(45, () => {
      if (this.active && !this.isDead) {
        this.setVelocity(dir * knockback, knockbackUp);
      }
    });

    this.scene.time.delayedCall(110, () => this.active && this.clearTint());

    // 피격 시 스쿼시 & 셰이크 연출
    this.scene.tweens.killTweensOf(this);
    this.setScale(this.baseScale);
    this.scene.tweens.add({
      targets: this,
      scaleX: this.baseScale * 1.25,
      scaleY: this.baseScale * 0.8,
      yoyo: true,
      duration: 60,
      onComplete: () => { if (this.active && !this.isDead) this.setScale(this.baseScale); }
    });

    if (this.hp <= 0) this.die();
  }

  die() {
    this.isDead = true;
    this.body.enable = false;
    this.bar.clear();
    if (this.nameText) this.nameText.setVisible(false);

    if (this.isBoss) {
      this.scene.cameras.main.shake(350, 0.015);
    }

    this.scene.tweens.add({
      targets: this, alpha: 0, scaleY: 0.2, duration: 280,
      onComplete: () => this.setActive(false).setVisible(false)
    });
  }

  respawn() {
    this.resetState();
    this.setScale(this.baseScale).setAlpha(1).clearTint();
    this.enableBody(true, this.home.x, this.home.y, true, true);
  }

  drawBar() {
    const isBoss = this.isBoss;
    const isElite = this.isElite;
    const w = isBoss ? 120 : (isElite ? 80 : Math.round(50 * this.baseScale));
    const h = isBoss ? 9 : 5;
    const x = this.x - w / 2;
    const y = this.y - (34 * this.baseScale + (isBoss ? 16 : 0));

    this.bar.clear();
    // 테두리
    if (isBoss) {
      this.bar.fillStyle(0xf1c40f, 0.9).fillRect(x - 2, y - 2, w + 4, h + 4);
    } else if (isElite) {
      this.bar.fillStyle(0x00d2d3, 0.8).fillRect(x - 2, y - 2, w + 4, h + 4);
    }

    this.bar.fillStyle(0x000000, 0.7).fillRect(x - 1, y - 1, w + 2, h + 2)
      .fillStyle(isBoss ? 0xff4757 : 0xe74c3c).fillRect(x, y, w * Math.max(0, this.hp / this.maxHp), h);
  }
}
