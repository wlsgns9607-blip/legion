import Phaser from 'phaser';
import { PSYCHOKINESIS, GAME } from '../config/gameConfig.js';

export const WEAPON_STATE = {
  READY: 'READY',
  FLYING: 'FLYING',
  SUSPENDED: 'SUSPENDED',
  REPOSITIONING: 'REPOSITIONING',
  PINNED: 'PINNED',
  RECALLING: 'RECALLING'
};

// 시노비 염동력 무기: 표창 및 쿠나이의 비행, 몬스터 꽂힘, 방향키 조종, 회수를 담당
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, weaponType = 'shuriken', options = {}) {
    const config = PSYCHOKINESIS[weaponType] || PSYCHOKINESIS.shuriken;
    super(scene, x, y, weaponType);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.weaponType = weaponType;
    this.cfg = config;
    this.state = WEAPON_STATE.READY;
    this.setDepth(12);
    this.setScale(this.cfg.scale || 1.0);

    // 차수 및 타격 속성
    this.tier = options.tier || 1;
    this.maxHits = options.maxHits ?? (this.tier === 1 ? 2 : (this.tier === 2 ? 3 : 6));
    this.hitCount = 0;
    this.canPin = options.canPin ?? (this.tier >= 2);
    this.isWind = options.isWind || (weaponType.startsWith('wind_'));

    this.body.setAllowGravity(false);
    this.body.setCircle(this.cfg.size, (this.width - this.cfg.size * 2) / 2, (this.height - this.cfg.size * 2) / 2);

    this.lastTrailTime = 0;
    this.suspendStartTime = 0;
    this.hoverBaseY = y;
    this.hoverBaseX = x;

    // 몬스터 꽂힘 관련 속성
    this.pinnedMonster = null;
    this.pinnedOffsetX = 0;
    this.pinnedOffsetY = 0;

    // 타격 쿨다운 맵 (몬스터 식별자 -> 타격 가능 시각)
    this.hitCooldowns = new Map();

    // 현재 비행 각도 (라디안) 및 속도
    this.currentAngle = 0;
    this.currentSpeed = 0;

    // 공중 부유 오라 링
    this.aura = scene.add.sprite(x, y, 'aura_ring')
      .setDepth(11)
      .setScale(0.9)
      .setAlpha(0)
      .setTint(this.cfg.auraTint);
  }

  launch(dir, baseDamage) {
    const angle = dir > 0 ? 0 : Math.PI;
    this.launchAngle(angle, baseDamage, dir);
  }

  launchAngle(angleRad, baseDamage, dir = 1, customSpeed = null) {
    this.dir = dir >= 0 ? 1 : -1;
    this.damage = Math.round(baseDamage * this.cfg.damageMult);
    this.state = WEAPON_STATE.FLYING;
    this.currentAngle = angleRad;
    this.currentSpeed = customSpeed || this.cfg.speed;

    this.setVelocity(
      Math.cos(this.currentAngle) * this.currentSpeed,
      Math.sin(this.currentAngle) * this.currentSpeed
    );

    if (this.weaponType === 'kunai' || this.weaponType === 'wind_kunai' || this.weaponType === 'big_kunai') {
      this.rotation = this.currentAngle;
    }
  }

  // 충돌 후 또는 명령으로 공중 대기 상태로 전환
  suspend() {
    if (this.state === WEAPON_STATE.SUSPENDED) return;
    this.state = WEAPON_STATE.SUSPENDED;
    this.setVelocity(0, 0);
    this.currentSpeed = 0;
    this.hoverBaseX = this.x;
    this.hoverBaseY = this.y;
    this.suspendStartTime = this.scene ? this.scene.time.now : 0;
    this.body.enable = true;

    if (this.aura && this.aura.active) {
      this.aura.setPosition(this.x, this.y);
      this.scene.tweens.add({
        targets: this.aura,
        alpha: 0.8,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        repeat: -1
      });
    }
  }

  // 몬스터에게 꽂히는 상태로 전환 (2차 이상 스킬 특징)
  pinTo(monster) {
    if (!monster || monster.isDead) {
      this.suspend();
      return;
    }
    this.state = WEAPON_STATE.PINNED;
    this.pinnedMonster = monster;
    this.pinnedOffsetX = Phaser.Math.Clamp(this.x - monster.x, -16, 16);
    this.pinnedOffsetY = Phaser.Math.Clamp(this.y - monster.y, -12, 12);
    this.setVelocity(0, 0);
    this.body.enable = false; // 꽂혀있는 동안은 추가 직접 충돌 방지

    if (this.aura && this.aura.active) {
      this.aura.setAlpha(0.3).setScale(0.8);
    }
  }

  // 플레이어의 방향 조종 입력 (dx, dy: -1, 0, 1)
  control(dx, dy) {
    if (this.state === WEAPON_STATE.RECALLING || this.state === WEAPON_STATE.PINNED) return;

    if (dx === 0 && dy === 0) {
      if (this.state === WEAPON_STATE.REPOSITIONING) {
        this.suspend();
      }
      return;
    }

    const targetAngle = Math.atan2(dy, dx);
    this.state = WEAPON_STATE.REPOSITIONING;
    this.currentSpeed = this.cfg.controlSpeed;

    // 자연스러운 각도 보간 (Lerp)
    let diff = Phaser.Math.Angle.wrap(targetAngle - this.currentAngle);
    this.currentAngle += diff * this.cfg.turnRate;

    this.setVelocity(
      Math.cos(this.currentAngle) * this.currentSpeed,
      Math.sin(this.currentAngle) * this.currentSpeed
    );

    if (this.weaponType.includes('kunai')) {
      this.rotation = this.currentAngle;
    }

    if (this.aura && this.aura.active) {
      this.aura.setAlpha(0.4);
    }
  }

  // 재발사 (현재 바라보는 방향 또는 지정 방향으로 재가속)
  relaunch(targetDir = null) {
    if (this.state === WEAPON_STATE.PINNED) {
      this.pinnedMonster = null;
      this.body.enable = true;
    }

    let angle = this.currentAngle;
    if (targetDir !== null) {
      angle = targetDir > 0 ? 0 : Math.PI;
    }
    this.state = WEAPON_STATE.FLYING;
    this.currentAngle = angle;
    this.currentSpeed = this.cfg.speed;

    this.setVelocity(
      Math.cos(this.currentAngle) * this.currentSpeed,
      Math.sin(this.currentAngle) * this.currentSpeed
    );

    if (this.weaponType.includes('kunai')) {
      this.rotation = this.currentAngle;
    }

    if (this.aura && this.aura.active) {
      this.scene.tweens.killTweensOf(this.aura);
      this.aura.setAlpha(0);
    }
  }

  // 플레이어에게 회수 (몬스터에 꽂힌 표창 뽑기 포함)
  recall(player) {
    if (this.state === WEAPON_STATE.PINNED) {
      const m = this.pinnedMonster;
      this.pinnedMonster = null;
      this.body.enable = true;

      // 꽂힌 무기가 뽑히면서 몬스터에게 강력한 회수 데미지 가함!
      if (m && m.active && !m.isDead) {
        const recallDmg = Math.round(this.damage * 1.5);
        m.takeDamage(recallDmg, player.facing, this.scene.time.now);
        if (this.scene && this.scene.combat) {
          this.scene.combat.hitEffect(m.x, m.y, recallDmg, true, player.facing);
          this.scene.combat.floatText(m.x, m.y - 42, `꽂힌 ${this.cfg.name} 뽑기!`, '#ffd32a', 15);
        }
      }
    }

    this.state = WEAPON_STATE.RECALLING;
    this.targetPlayer = player;
    if (this.aura && this.aura.active) {
      this.scene.tweens.killTweensOf(this.aura);
      this.aura.setAlpha(0.7).setTint(0xffd32a);
    }
  }

  update(time) {
    if (!this.active) return;

    const mapWidth = (this.scene && this.scene.maps && this.scene.maps.map) ? this.scene.maps.map.width : GAME.worldWidth;

    // 0. 몬스터에 꽂혀있는 (PINNED) 동작
    if (this.state === WEAPON_STATE.PINNED) {
      if (!this.pinnedMonster || !this.pinnedMonster.active || this.pinnedMonster.isDead) {
        this.pinnedMonster = null;
        this.body.enable = true;
        this.suspend();
        return;
      }
      this.x = this.pinnedMonster.x + this.pinnedOffsetX;
      this.y = this.pinnedMonster.y + this.pinnedOffsetY;
      this.updateAuraPos();
      return;
    }

    // 1. 회수 중 동작
    if (this.state === WEAPON_STATE.RECALLING) {
      if (!this.targetPlayer || !this.targetPlayer.active) {
        this.safeDestroy();
        return;
      }

      const dx = this.targetPlayer.x - this.x;
      const dy = (this.targetPlayer.y - 10) - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 32) {
        // 플레이어에게 도착 완료
        this.safeDestroy();
        if (this.scene && this.scene.combat) {
          this.scene.combat.floatText(this.targetPlayer.x, this.targetPlayer.y - 30, `${this.cfg.name} 회수!`, '#00d2d3', 13);
        }
        return;
      }

      const angle = Math.atan2(dy, dx);
      this.currentAngle = angle;
      const recallSpeed = PSYCHOKINESIS.recallSpeed || 850;
      this.setVelocity(Math.cos(angle) * recallSpeed, Math.sin(angle) * recallSpeed);

      if (this.weaponType.includes('kunai')) {
        this.rotation = angle;
      } else {
        this.angle += 40;
      }
      this.updateTrail(time);
      this.updateAuraPos();
      return;
    }

    // 2. 공중 대기 (SUSPENDED) 동작
    if (this.state === WEAPON_STATE.SUSPENDED) {
      // 미세 부유 애니메이션 (공중에 머물며 둥실거림)
      const elapsed = time - this.suspendStartTime;
      const floatOffsetY = Math.sin(elapsed * 0.005) * 6;
      this.y = this.hoverBaseY + floatOffsetY;

      if (this.weaponType === 'shuriken') {
        this.angle += 8; // 부유 중 느긋한 회전
      } else {
        this.angle = Math.sin(elapsed * 0.004) * 8; // 쿠나이 미세 진동
      }

      // 최대 유지 시간 초과 시 자동 회수 또는 안전 삭제
      if (elapsed > PSYCHOKINESIS.maxSuspendTime) {
        this.suspend();
        this.safeDestroy();
        return;
      }

      this.updateAuraPos();
      return;
    }

    // 3. 비행 (FLYING) 또는 궤적 변경 (REPOSITIONING)
    if (this.state === WEAPON_STATE.FLYING || this.state === WEAPON_STATE.REPOSITIONING) {
      if (this.weaponType === 'shuriken') {
        this.angle += 35;
      } else {
        this.rotation = this.currentAngle;
      }

      this.updateTrail(time);
      this.updateAuraPos();

      // 맵 경계 체크: 벽이나 화면 밖으로 나가면 경계에서 SUSPENDED로 대기
      if (this.x <= 20 || this.x >= mapWidth - 20 || this.y <= 20 || this.y >= GAME.groundY + 10) {
        this.x = Phaser.Math.Clamp(this.x, 24, mapWidth - 24);
        this.y = Phaser.Math.Clamp(this.y, 24, GAME.groundY);
        this.suspend();
      }
    }
  }

  updateTrail(time) {
    if (!this.lastTrailTime || time - this.lastTrailTime > 45) {
      this.lastTrailTime = time;
      this.spawnGhost();
    }
  }

  updateAuraPos() {
    if (this.aura && this.aura.active) {
      this.aura.setPosition(this.x, this.y);
    }
  }

  // 몬스터 공격 가능 여부 (재타격 쿨다운 방어)
  canHitMonster(monster, time) {
    if (!monster || monster.isDead) return false;
    const nextAllowed = this.hitCooldowns.get(monster) || 0;
    return time >= nextAllowed;
  }

  // 몬스터 공격 등록
  registerHit(monster, time) {
    const cd = this.cfg.hitCooldown || 350;
    this.hitCooldowns.set(monster, time + cd);
  }

  spawnGhost() {
    if (!this.scene) return;
    const ghost = this.scene.add.sprite(this.x, this.y, this.weaponType)
      .setDepth(11)
      .setAngle(this.angle)
      .setRotation(this.rotation)
      .setAlpha(0.55)
      .setScale(this.scaleX * 0.85, this.scaleY * 0.85)
      .setTint(this.cfg.trailTint || 0x00d2d3);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: ghost.scaleX * 0.6,
      scaleY: ghost.scaleY * 0.6,
      duration: 130,
      onComplete: () => ghost.destroy()
    });
  }

  safeDestroy() {
    if (this.aura && this.aura.active) {
      this.aura.destroy();
    }
    this.destroy();
  }
}
