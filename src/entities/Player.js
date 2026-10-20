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
    this.xKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.ctrlKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.cKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.zKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.rKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 직업 시스템: 'shinobi' (시노비: 원거리 표창/쿠나이) | 'shadow_lord' (그림자 군주)
    this.characterClass = 'shinobi';
    this.shadowUltCooldownUntil = 0;

    // 키보드 캡처 방지: 브라우저 기본 키 이벤트(Space, Arrow, Backspace 등)를 가로채지 않도록 해제
    if (scene.input.keyboard) {
      scene.input.keyboard.preventDefault = false;
      scene.input.keyboard.clearCaptures();
    }

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

    // 캐릭터 외형 커스터마이징 및 머리 위 칭호/닉네임 태그 (메이플 스타일)
    this.customTint = null;
    const tagStyle = {
      fontFamily: '"Malgun Gothic","Apple SD Gothic Neo",sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    };
    this.nameTag = scene.add.text(x, y - 46, '', tagStyle).setOrigin(0.5).setDepth(25);
    this.titleTag = scene.add.text(x, y - 60, '', {
      ...tagStyle,
      fontSize: '10px',
      color: '#feca57',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(25);

    // 캐릭터 주변을 염동력으로 호위/공전하는 표창 4기 (필드 최대 4개 제한 연동)
    this.orbitShurikens = [];
    this.orbitCount = 4;     // 최대 4개만 비행 및 조종 가능하도록 밸런스 엄격 동기화
    this.orbitAngle = 0;
    this.orbitSpeed = 0.024; // 중간 정도의 우아한 공전 속도
    this.orbitRadiusX = 44;
    this.orbitRadiusY = 24;

    for (let i = 0; i < this.orbitCount; i++) {
      const s = scene.add.sprite(x, y, 'shuriken')
        .setScale(0.72)
        .setAlpha(0.85)
        .setTint(0x00ffff);
      this.orbitShurikens.push(s);
    }
  }

  setCustomAppearance(nickname = '', title = '', colorTheme = 'default', weapon = 'shuriken') {
    if (this.nameTag) this.nameTag.setText(nickname || '시노비');
    if (this.titleTag) this.titleTag.setText(title ? `[${title}]` : '');

    const themeColors = {
      default: null,
      black: null,
      blue: 0x70a1ff,
      red: 0xff6b81,
      yellow: 0xfeca57,
      purple: 0xa55eea
    };
    this.customTint = themeColors[colorTheme] || null;
    if (this.customTint) {
      this.setTint(this.customTint);
    } else {
      this.clearTint();
    }

    if (weapon && (weapon === 'shuriken' || weapon === 'kunai')) {
      if (this.jobTier >= 2 || weapon === 'shuriken') {
        this.selectedWeapon = weapon;
      }
    }
  }

  setJobTier(tier) {
    this.jobTier = tier;
    if (this.characterClass === 'shadow_lord') {
      if (tier === 1) {
        this.scene.combat.floatText(this.x, this.y - 50, '【견습 그림자 검사】 불완전 잔영 사출 (최대 2인 타격)', '#a55eea', 16);
      } else if (tier === 2) {
        this.scene.combat.floatText(this.x, this.y - 50, '【1차: 그림자 추적자】 단검 4연타 + 사슬낫 견인 (최대 4인 타격)', '#e056fd', 16);
      } else if (tier === 3) {
        this.scene.combat.floatText(this.x, this.y - 50, '【2차: 그림자 지휘관】 대검 에어본 + 창 관통 돌파 (최대 5인 타격)', '#feca57', 16);
      } else {
        this.scene.combat.floatText(this.x, this.y - 50, '【3차: 그림자 군주】 언월도 흡입 + 도끼 단죄, 6인 편제 (최대 6인 타격, [R]필살기)', '#ff4757', 16);
      }
      return;
    }
    if (tier === 1) {
      this.selectedWeapon = 'shuriken'; // 1차는 표창만 가능
      this.scene.combat.floatText(this.x, this.y - 50, '【1차 시노비】 전직: 표창만 가능 (2명 이하 타격)', '#00d2d3', 16);
    } else if (tier === 2) {
      this.scene.combat.floatText(this.x, this.y - 50, '【2차 듀얼시노비】 전직: 표창+쿠나이 (3명 타격, 꽂힌 무기 회수, [A]바람스킬 쿨10초)', '#feca57', 15);
    } else if (tier === 3) {
      this.scene.combat.floatText(this.x, this.y - 50, '【3차 풍마대장군】 전직: 거대 쿠나이 & 대형 풍마표창 (최대 5인 타격)', '#ff4757', 16);
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

    // 직업별 2.5등신 SD 스프라이트 텍스처 동적 동기화
    if (this.characterClass === 'shadow_lord') {
      if (this.texture.key !== 'player_shadow_lord' && this.scene.textures.exists('player_shadow_lord')) {
        this.setTexture('player_shadow_lord');
        this.clearTint();
      }
    } else {
      if (this.texture.key === 'player_shadow_lord') {
        this.setTexture('player');
        if (this.customTint) this.setTint(this.customTint);
      }
    }

    // 0. 전직 차수 즉시 변경 (1 / 2 / 3 숫자키: 1차 시노비 / 2차 듀얼시노비 / 3차 풍마대장군)
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

    // 2. 무기 회수 명령 (Z 키) - 2차 전직부터 사용 가능!
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      if (this.jobTier < 2) {
        this.scene.combat.floatText(this.x, this.y - 45, '무기 회수는 2차 전직(Lv.30)부터 가능합니다! (전직: [2]키)', '#ff6b6b', 14);
      } else {
        const recalledCount = this.scene.combat.recallWeapons(this);
        if (recalledCount === 0) {
          this.scene.combat.floatText(this.x, this.y - 35, '회수할 무기가 없습니다.', '#8395a7', 13);
        }
      }
    }

    // 3. 염동력 조종 모드 (Shift 키 홀드)
    if (this.nameTag) {
      this.nameTag.setPosition(this.x, this.y - 46).setVisible(!this.isDead && this.visible);
    }
    if (this.titleTag) {
      this.titleTag.setPosition(this.x, this.y - 60).setVisible(!this.isDead && this.visible);
    }

    // 캐릭터 주변 염동력 4기 표창 공전 시뮬레이션 (필드 잔여 표창 수 실시간 동기화)
    const currentOrbitSpeed = this.isTelekinesisMode ? this.orbitSpeed * 1.5 : this.orbitSpeed;
    this.orbitAngle += currentOrbitSpeed;
    const baseCenterY = this.y - 12;

    // 현재 필드에 날아가 있는 무기 개수만큼 주변 공전 표창 소모/표시
    const activeFieldWeapons = (this.scene && this.scene.combat) ? this.scene.combat.getActiveWeapons().length : 0;
    const availableOrbitCount = Math.max(0, this.orbitCount - activeFieldWeapons);

    for (let i = 0; i < this.orbitShurikens.length; i++) {
      const s = this.orbitShurikens[i];
      if (!s || !s.active) continue;

      // 그림자 군주는 원거리 표창 일체 배제 (표창 공전체 비표시)
      if (this.characterClass === 'shadow_lord' || this.isDead || !this.visible || i >= availableOrbitCount) {
        s.setVisible(false);
        continue;
      }
      s.setVisible(true);

      const angle = this.orbitAngle + (i * (Math.PI * 2 / this.orbitCount));
      const floatBob = Math.sin(time * 0.003 + i * 1.2) * 3;
      const ox = this.x + Math.cos(angle) * this.orbitRadiusX;
      const oy = baseCenterY + Math.sin(angle) * this.orbitRadiusY + floatBob;

      s.setPosition(ox, oy);
      s.angle += 3.2; // 표창 자체 자전 회전 (중간 속도)

      // 3D 입체감: 플레이어(depth 10) 앞뒤로 자연스럽게 오감
      if (Math.sin(angle) > 0) {
        s.setDepth(15);
        s.setScale(0.74);
        s.setAlpha(0.9);
      } else {
        s.setDepth(5);
        s.setScale(0.60);
        s.setAlpha(0.6);
      }

      // 색상 틴트 동기화
      if (this.characterClass === 'shadow_lord') {
        s.setTint(0x8e44ad);
        s.setScale(0.55);
      } else if (this.customTint) {
        s.setTint(this.customTint);
      } else if (this.isTelekinesisMode) {
        s.setTint(0x88ffff);
      } else {
        s.setTint(0x00ffff);
      }
    }

    const k = this.cursors;
    this.isTelekinesisMode = this.shiftKey.isDown;

    if (this.isTelekinesisMode) {
      // 염동력 집중 상태
      this.setVelocityX(0);
      const pulse = 0x88ffff;
      this.setTint(Math.floor(time / 150) % 2 ? pulse : (this.customTint || 0xffffff));

      const ctrlDx = (k.right.isDown ? 1 : 0) - (k.left.isDown ? 1 : 0);
      const ctrlDy = (k.down.isDown ? 1 : 0) - (k.up.isDown ? 1 : 0);
      this.scene.combat.controlWeapons(ctrlDx, ctrlDy);
    } else {
      if (!this.isDead && time >= this.invulnUntil) {
        if (this.customTint) {
          this.setTint(this.customTint);
        } else if (this.clearTint) {
          this.clearTint();
        }
      }

      // 일반 캐릭터 이동 및 점프
      const dir = (k.right.isDown ? 1 : 0) - (k.left.isDown ? 1 : 0);
      this.setVelocityX(dir * PLAYER.speed);
      if (dir) { this.facing = dir; this.setFlipX(dir < 0); }

      const grounded = this.body.blocked.down || this.body.touching.down;
      if (Phaser.Input.Keyboard.JustDown(this.xKey) && grounded) {
        this.setVelocityY(PLAYER.jump);
      }
    }

    // 4. 차수별 공격 및 스킬 시스템

    // [기본 공격] Ctrl 키:
    if (this.ctrlKey.isDown && time >= this.nextAttack) {
      if (this.characterClass === 'shadow_lord') {
        this.nextAttack = time + 280;
        let sId = 'SKL_SHD_01';
        if (this.jobTier === 1) sId = 'SKL_SHD_01';      // 견습: 잔영격 (최대 2인)
        else if (this.jobTier === 2) sId = 'SKL_SHD_11'; // 1차: 쌍단 급습 (최대 4인)
        else if (this.jobTier === 3) sId = 'SKL_SHD_21'; // 2차: 단절 대검 (최대 5인)
        else sId = 'SKL_SHD_31';                         // 3차: 풍마 언월참 (최대 6인)

        this.scene.combat.fireShadowMelee(this, sId);
        return;
      }

      // 시노비 원거리 투사체 공격
      if (this.scene.combat && !this.scene.combat.canFire(this)) {
        return;
      }

      this.nextAttack = time + (PLAYER.attackInterval || 360);

      if (this.scene) {
        this.scene.tweens.add({
          targets: this,
          scaleX: (this.facing < 0 ? -1.05 : 1.05),
          scaleY: 0.96,
          duration: 50,
          yoyo: true,
          ease: 'Quad.easeOut'
        });
      }

      if (this.jobTier === 1) {
        this.scene.combat.fireTier1(this);
      } else if (this.jobTier === 2) {
        this.scene.combat.fireTier2(this, this.selectedWeapon);
      } else {
        this.scene.combat.fireTier3(this);
      }
    }

    // [특수 스킬 1] A 키:
    if (Phaser.Input.Keyboard.JustDown(this.aKey)) {
      if (this.characterClass === 'shadow_lord') {
        if (time < this.skill2CooldownUntil) {
          const remainingSec = ((this.skill2CooldownUntil - time) / 1000).toFixed(1);
          this.scene.combat.floatText(this.x, this.y - 45, `스킬 쿨타임: ${remainingSec}초 남음`, '#ff9f43', 14);
          return;
        }
        this.skill2CooldownUntil = time + 6500;
        this.nextAttack = time + 250;
        const sId = (this.jobTier >= 2) ? 'SKL_SHD_12' : 'SKL_SHD_02'; // 사슬 포박 (견인) 또는 그림자 밟기
        this.scene.combat.fireShadowMelee(this, sId);
        return;
      }

      // 시노비 2차 스킬
      if (this.jobTier < 2) {
        this.scene.combat.floatText(this.x, this.y - 45, '2차 이상 전직 후 사용 가능합니다! (2번 키)', '#ff6b6b', 14);
      } else if (time < this.skill2CooldownUntil) {
        const remainingSec = ((this.skill2CooldownUntil - time) / 1000).toFixed(1);
        this.scene.combat.floatText(this.x, this.y - 45, `바람 스킬 쿨타임: ${remainingSec}초 남음`, '#ff9f43', 14);
      } else {
        this.skill2CooldownUntil = time + 10000;
        this.nextAttack = time + 350;
        this.scene.combat.fireWindSkill(this);
      }
    }

    // [특수 스킬 2] S 키:
    if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
      if (this.characterClass === 'shadow_lord') {
        if (this.jobTier < 2) {
          this.scene.combat.floatText(this.x, this.y - 45, '2차 이상 전직 후 사용 가능합니다! (2번 키)', '#ff6b6b', 14);
          return;
        }
        this.nextAttack = time + 350;
        const sId = (this.jobTier >= 3) ? 'SKL_SHD_32' : 'SKL_SHD_22'; // 단죄의 대부 (도끼 기절) 또는 나선 돌파 (창)
        this.scene.combat.fireShadowMelee(this, sId);
        return;
      }

      // 시노비 3차 스킬
      if (this.jobTier < 3) {
        this.scene.combat.floatText(this.x, this.y - 45, '3차 이상 전직 후 사용 가능합니다! (3번 키)', '#ff6b6b', 14);
      } else {
        this.nextAttack = time + 400;
        this.scene.combat.fireTier3(this);
      }
    }

    // [궁극기 필살기] R 키: 군주의 영토 : 육익 섬멸진
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      if (this.characterClass === 'shadow_lord') {
        if (this.jobTier < 3) {
          this.scene.combat.floatText(this.x, this.y - 45, '필살기는 3차 전직(3번 키) 후 사용 가능합니다!', '#ff6b6b', 14);
          return;
        }
        if (time < this.shadowUltCooldownUntil) {
          const remainingSec = ((this.shadowUltCooldownUntil - time) / 1000).toFixed(1);
          this.scene.combat.floatText(this.x, this.y - 45, `필살기 쿨타임: ${remainingSec}초 남음`, '#ff9f43', 14);
          return;
        }
        this.shadowUltCooldownUntil = time + 45000;
        this.nextAttack = time + 3800;
        this.scene.combat.fireShadowUltimate(this);
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

    // 30레벨 2차 전직, 70레벨 3차 풍마대장군 전직 적용
    if (level >= 70 && this.jobTier < 3) {
      this.setJobTier(3);
      if (this.scene && this.scene.combat) {
        this.scene.combat.floatText(this.x, this.y - 70, '★ 축하합니다! 70레벨 달성 - 【3차 풍마대장군】 전직! ★', '#ff4757', 20);
      }
    } else if (level >= 30 && this.jobTier < 2) {
      this.setJobTier(2);
      if (this.scene && this.scene.combat) {
        this.scene.combat.floatText(this.x, this.y - 70, '★ 축하합니다! 30레벨 달성 - 【2차 듀얼시노비】 전직! ★', '#feca57', 20);
      }
    }
  }

  destroy(fromScene) {
    if (this.orbitShurikens) {
      this.orbitShurikens.forEach(s => {
        if (s && s.destroy) s.destroy();
      });
      this.orbitShurikens = [];
    }
    if (this.nameTag) {
      this.nameTag.destroy();
      this.nameTag = null;
    }
    if (this.titleTag) {
      this.titleTag.destroy();
      this.titleTag = null;
    }
    super.destroy(fromScene);
  }
}
