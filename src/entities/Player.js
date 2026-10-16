import Phaser from 'phaser';
import { PLAYER, LEVEL } from '../config/gameConfig.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(32, 60).setOffset(12, 10);
    this.setCollideWorldBounds(true).setDepth(10);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.altKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);
    this.ctrlKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.cKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.zKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    this.facing = 1;
    this.maxHp = PLAYER.maxHp;
    this.hp = this.maxHp;
    this.maxMp = PLAYER.maxMp || 80;
    this.mp = this.maxMp;
    this.damage = PLAYER.damage;
    this.isDead = false;
    this.nextAttack = 0;
    this.invulnUntil = 0;
    this.stunUntil = 0;

    // 차수 시스템 (1차: 표창만 2명 / 2차: 쿠나이+표창 3명 & 회수 & 10초 바람스킬 4명 / 3차: 큰 쿠나이+표창)
    this.jobTier = 1;
    this.skill2CooldownUntil = 0; // 2차 스킬 추가 쿨타임 (10초)

    // 무기 설정
    this.selectedWeapon = 'shuriken'; // 'shuriken' | 'kunai'
    this.isTelekinesisMode = false;
  }

  setJobTier(tier) {
    this.jobTier = tier;
    if (tier === 1) {
      this.selectedWeapon = 'shuriken'; // 1차는 표창만 가능
      this.scene.combat.floatText(this.x, this.y - 50, '【1차 시노비】 전직: 표창만 가능 (2명 이하 타격)', '#00d2d3', 16);
    } else if (tier === 2) {
      this.scene.combat.floatText(this.x, this.y - 50, '【2차 듀얼시노비】 전직: 표창+쿠나이 (3명 타격, 꽂힌 무기 회수, [A]바람스킬 쿨10초)', '#feca57', 15);
    } else if (tier === 3) {
      this.scene.combat.floatText(this.x, this.y - 50, '【3차 풍마거검사】 전직: 거대 쿠나이 & 표창 공격', '#ff4757', 16);
    }
  }

  update(time) {
    if (this.isDead) { this.setVelocityX(0); return; }

    // [로그인 필수] 로그인하지 않은 상태에서는 이동 및 모든 스킬 작동 차단
    if (!window.currentUser || (this.scene && !this.scene.isGameActive)) {
      this.setVelocityX(0);
      return;
    }

    this.setAlpha(time < this.invulnUntil && Math.floor(time / 80) % 2 ? 0.4 : 1);
    if (time < this.stunUntil) return;

    // 0. 전직 차수 즉시 변경 (1 / 2 / 3 숫자키)
    if (Phaser.Input.Keyboard.JustDown(this.key1)) this.setJobTier(1);
    if (Phaser.Input.Keyboard.JustDown(this.key2)) this.setJobTier(2);
    if (Phaser.Input.Keyboard.JustDown(this.key3)) this.setJobTier(3);

    // 1. 무기 전환 (C 키) - 1차는 표창만 사용 가능, 2차부터 쿠나이 가능
    if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
      if (this.jobTier === 1) {
        this.selectedWeapon = 'shuriken';
        this.scene.combat.floatText(this.x, this.y - 45, '1차는 표창만 사용 가능합니다! (2차 전직 필요: [2]키)', '#ff6b6b', 14);
      } else {
        this.selectedWeapon = (this.selectedWeapon === 'shuriken') ? 'kunai' : 'shuriken';
        const weaponName = this.selectedWeapon === 'shuriken' ? '표창' : '쿠나이';
        const color = this.selectedWeapon === 'shuriken' ? '#00d2d3' : '#ff6b81';
        this.scene.combat.floatText(this.x, this.y - 45, `[${weaponName}] 장착`, color, 15);
      }
    }

    // 2. 무기 회수 명령 (Z 키) - 공중 무기 및 몬스터에 꽂힌 표창/쿠나이 전탄 회수!
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      const recalledCount = this.scene.combat.recallWeapons(this);
      if (recalledCount === 0) {
        this.scene.combat.floatText(this.x, this.y - 35, '회수할 무기가 없습니다.', '#8395a7', 13);
      }
    }

    // 3. 염동력 조종 모드 (Shift 키 홀드)
    const k = this.cursors;
    this.isTelekinesisMode = this.shiftKey.isDown;

    if (this.isTelekinesisMode) {
      // 염동력 집중 상태
      this.setVelocityX(0);
      const pulse = 0x88ffff;
      this.setTint(Math.floor(time / 150) % 2 ? pulse : 0xffffff);

      const ctrlDx = (k.right.isDown ? 1 : 0) - (k.left.isDown ? 1 : 0);
      const ctrlDy = (k.down.isDown ? 1 : 0) - (k.up.isDown ? 1 : 0);
      this.scene.combat.controlWeapons(ctrlDx, ctrlDy);
    } else {
      if (this.clearTint && !this.isDead && time >= this.invulnUntil) {
        this.clearTint();
      }

      // 일반 캐릭터 이동 및 점프
      const dir = (k.right.isDown ? 1 : 0) - (k.left.isDown ? 1 : 0);
      this.setVelocityX(dir * PLAYER.speed);
      if (dir) { this.facing = dir; this.setFlipX(dir < 0); }

      const grounded = this.body.blocked.down || this.body.touching.down;
      if (Phaser.Input.Keyboard.JustDown(this.altKey) && grounded) {
        this.setVelocityY(PLAYER.jump);
      }
    }

    // 4. 차수별 공격 및 스킬 시스템

    // [기본 공격] Ctrl 키: 차수별 차별화
    if (this.ctrlKey.isDown && time >= this.nextAttack) {
      this.nextAttack = time + (PLAYER.attackInterval || 300);

      if (this.jobTier === 1) {
        // 1차: 표창만 가능, 2명 이하 타격
        this.scene.combat.fireTier1(this);
      } else if (this.jobTier === 2) {
        // 2차: 쿠나이랑 표창 가능, 3명 이하 타격, 몬스터에 꽂힘
        this.scene.combat.fireTier2(this, this.selectedWeapon);
      } else {
        // 3차: 큰 쿠나이, 표창 공격
        this.scene.combat.fireTier3(this);
      }
    }

    // [2차 스킬] A 키: 표창과 쿠나이에 바람속성을 붙여 4명의 몬스터를 없앤다 (쿨타임 10초)
    if (Phaser.Input.Keyboard.JustDown(this.aKey)) {
      if (this.jobTier < 2) {
        this.scene.combat.floatText(this.x, this.y - 45, '2차 이상 전직 후 사용 가능합니다! (2번 키)', '#ff6b6b', 14);
      } else if (time < this.skill2CooldownUntil) {
        const remainingSec = ((this.skill2CooldownUntil - time) / 1000).toFixed(1);
        this.scene.combat.floatText(this.x, this.y - 45, `바람 스킬 쿨타임: ${remainingSec}초 남음`, '#ff9f43', 14);
      } else {
        // 쿨타임 10초 적용 및 스킬 발동
        this.skill2CooldownUntil = time + 10000;
        this.nextAttack = time + 350;
        this.scene.combat.fireWindSkill(this);
      }
    }

    // [3차 스킬] S 키: 큰 쿠나이 표창 폭풍 공격
    if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
      if (this.jobTier < 3) {
        this.scene.combat.floatText(this.x, this.y - 45, '3차 이상 전직 후 사용 가능합니다! (3번 키)', '#ff6b6b', 14);
      } else {
        this.nextAttack = time + 400;
        this.scene.combat.fireTier3(this);
      }
    }
  }

  healHp(amount) {
    if (this.isDead) return 0;
    const actual = Math.min(this.maxHp - this.hp, amount);
    this.hp += actual;
    return actual;
  }

  healMp(amount) {
    if (this.isDead) return 0;
    const actual = Math.min(this.maxMp - this.mp, amount);
    this.mp += actual;
    return actual;
  }

  takeDamage(amount, time, fromX) {
    if (this.isDead || time < this.invulnUntil) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnUntil = time + PLAYER.invulnMs;
    this.stunUntil = time + PLAYER.stunMs;
    this.setVelocity(((this.x >= fromX) ? 1 : -1) * 220, -240);
    if (this.hp <= 0) this.die();
    return true;
  }

  die() {
    this.isDead = true;
    this.setTint(0x777777).setAlpha(1);
    if (this.scene && this.scene.combat) {
      this.scene.combat.clearWeapons();
    }
  }

  revive(x, y, time) {
    this.isDead = false;
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    this.clearTint();
    this.setPosition(x, y).setVelocity(0, 0);
    this.invulnUntil = time + 1500;
  }

  applyLevelUp(level) {
    this.maxHp = PLAYER.maxHp + (level - 1) * LEVEL.hpPerLevel;
    this.maxMp = (PLAYER.maxMp || 80) + (level - 1) * (LEVEL.mpPerLevel || 8);
    this.damage = PLAYER.damage + (level - 1) * LEVEL.damagePerLevel;
    this.hp = this.maxHp;
    this.mp = this.maxMp;

    // 30레벨 2차 전직, 60레벨 3차 전직 적용
    if (level >= 60 && this.jobTier < 3) {
      this.setJobTier(3);
      if (this.scene && this.scene.combat) {
        this.scene.combat.floatText(this.x, this.y - 70, '★ 축하합니다! 60레벨 달성 - 【3차 풍마거검사】 전직! ★', '#ff4757', 20);
      }
    } else if (level >= 30 && this.jobTier < 2) {
      this.setJobTier(2);
      if (this.scene && this.scene.combat) {
        this.scene.combat.floatText(this.x, this.y - 70, '★ 축하합니다! 30레벨 달성 - 【2차 듀얼시노비】 전직! ★', '#feca57', 20);
      }
    }
  }
}
