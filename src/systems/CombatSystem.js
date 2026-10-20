import Projectile from '../entities/Projectile.js';
import { MONSTER, PLAYER, SHADOW_LORD } from '../config/gameConfig.js';

// 충돌 판정과 피해 계산은 여기 한 곳에서만 처리한다.
export default class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = scene.physics.add.group({ allowGravity: false, runChildUpdate: true });

    // 단일 공유 파티클 이미터 (메모리 누수 및 렉 방지)
    this.sparkEmitter = scene.add.particles(0, 0, 'spark', {
      speed: { min: 70, max: 220 },
      lifespan: 220,
      scale: { start: 1.2, end: 0 },
      emitting: false
    }).setDepth(20);
  }

  setup(player, monsters) {
    const { physics } = this.scene;
    physics.add.overlap(this.projectiles, monsters, (proj, monster) => this.onProjectileHit(proj, monster));
    physics.add.overlap(player, monsters, (p, monster) => this.onContact(p, monster));
  }

  // 필드에 비행/조정 중인 무기 최대 개수 (최대 4개) 상한선 검증
  canFire(player) {
    const active = this.getActiveWeapons();
    const maxAllowed = PLAYER.maxActiveWeapons || 4;
    return active.length < maxAllowed;
  }

  fireShuriken(player) {
    return this.fireTier1(player);
  }

  // 1차 공격 (Ctrl): 표창만 가능, 최대 2명 이하 타격, 필드 최대 4개 제한
  fireTier1(player) {
    if (!this.canFire(player)) return null;

    const p = new Projectile(this.scene, player.x + player.facing * 28, player.y - 8, 'shuriken', {
      tier: 1,
      maxHits: 2,           // 1차: 2명 이하 타격
      canPin: false
    });
    this.projectiles.add(p);
    p.launch(player.facing, player.damage);
    return [p];
  }

  // 2차 기본 공격: 쿠나이와 표창 가능, 최대 3명 이하 타격, 몬스터에 꽂힘 가능, 필드 최대 4개 제한
  fireTier2(player, weaponType = null) {
    const weapon = weaponType || player.selectedWeapon || 'shuriken';
    const suspended = this.getSuspendedWeapon(weapon);
    if (suspended) {
      this.relaunchWeapons(player.facing);
      return this.getActiveWeapons();
    }

    if (!this.canFire(player)) return null;

    const baseAngle = player.facing > 0 ? 0 : Math.PI;
    const p = new Projectile(this.scene, player.x + player.facing * 28, player.y - 10, weapon, {
      tier: 2,
      maxHits: 3,           // 2차 기본: 3명 이하 타격
      canPin: true          // 몬스터에 꽂힌 표창 회수 가능
    });
    this.projectiles.add(p);
    p.launchAngle(baseAngle, player.damage, player.facing);
    return [p];
  }

  // 2차 스킬 추가 (쿨타임 10초): 표창과 쿠나이에 바람속성을 붙여 4명의 몬스터를 없앤다
  fireWindSkill(player) {
    const baseAngle = player.facing > 0 ? 0 : Math.PI;
    const sign = player.facing > 0 ? 1 : -1;
    const weapons = [];

    // 표창과 쿠나이 4기를 바람 속성으로 감싸 부채꼴로 동시 사출
    const offsets = [-0.22, -0.07, 0.07, 0.22];
    const types = ['wind_shuriken', 'wind_kunai', 'wind_shuriken', 'wind_kunai'];

    types.forEach((type, i) => {
      const angle = baseAngle + sign * offsets[i];
      const yOffset = -20 + i * 10;
      const proj = new Projectile(this.scene, player.x + player.facing * 30, player.y + yOffset, type, {
        tier: 2,
        maxHits: 4,         // 4명의 몬스터를 없앤다
        isWind: true,
        canPin: false       // 바람 속성은 관통 폭풍으로 4명을 쓸어버림
      });
      this.projectiles.add(proj);
      proj.launchAngle(angle, player.damage * 2.2, player.facing, 720);
      weapons.push(proj);
    });

    // 바람 폭풍 사운드 대체 화면 흔들림 및 연출
    this.scene.cameras.main.shake(140, 0.007);
    this.floatText(player.x, player.y - 55, '🌀 2차 스킬: 풍둔 질풍열파! (바람 표창+쿠나이 4명 섬멸)', '#1dd1a1', 17);
    return weapons;
  }

  // 3차 공격 (S): 거대 쿠나이와 대형 풍마표창 공격
  fireTier3(player) {
    const baseAngle = player.facing > 0 ? 0 : Math.PI;
    const sign = player.facing > 0 ? 1 : -1;
    const weapons = [];

    // 거대 쿠나이와 대형 풍마표창을 전방으로 동시 투척
    const bigShuriken = new Projectile(this.scene, player.x + player.facing * 35, player.y - 20, 'big_shuriken', {
      tier: 3,
      maxHits: 6,
      canPin: true
    });
    this.projectiles.add(bigShuriken);
    bigShuriken.launchAngle(baseAngle - sign * 0.1, player.damage * 2.8, player.facing);
    weapons.push(bigShuriken);

    const bigKunai = new Projectile(this.scene, player.x + player.facing * 35, player.y + 10, 'big_kunai', {
      tier: 3,
      maxHits: 6,
      canPin: true
    });
    this.projectiles.add(bigKunai);
    bigKunai.launchAngle(baseAngle + sign * 0.1, player.damage * 3.2, player.facing);
    weapons.push(bigKunai);

    this.scene.cameras.main.shake(160, 0.009);
    this.floatText(player.x, player.y - 60, '🔥 3차: 거대 쿠나이 & 풍마표창 일격!', '#ff4757', 18);
    return weapons;
  }

  getSuspendedWeapon(weaponType = null) {
    const list = this.projectiles.getChildren();
    for (let i = list.length - 1; i >= 0; i--) {
      const w = list[i];
      if (w.active && w.state === 'SUSPENDED' && (!weaponType || w.weaponType === weaponType)) {
        return w;
      }
    }
    return null;
  }

  getPinnedWeapons() {
    return this.projectiles.getChildren().filter(w => w.active && w.state === 'PINNED');
  }

  getActiveWeapons() {
    return this.projectiles.getChildren().filter(w => w.active);
  }

  controlWeapons(dx, dy) {
    const weapons = this.getActiveWeapons();
    weapons.forEach(w => {
      if (w.state !== 'RECALLING' && w.state !== 'PINNED') {
        w.control(dx, dy);
      }
    });
  }

  relaunchWeapons(dir = null) {
    const weapons = this.getActiveWeapons();
    let reloaded = 0;
    weapons.forEach(w => {
      if (w.state === 'SUSPENDED') {
        w.relaunch(dir);
        reloaded++;
      }
    });
    return reloaded;
  }

  // 무기 전탄 회수 (몬스터에 꽂힌 표창 + 공중 대기 무기, 2차 전직부터 가능)
  recallWeapons(player) {
    if (!player || player.jobTier < 2) return 0;
    const weapons = this.getActiveWeapons();
    const pinned = weapons.filter(w => w.state === 'PINNED').length;
    weapons.forEach(w => w.recall(player));

    if (pinned > 0) {
      this.floatText(player.x, player.y - 50, `몬스터에 꽂힌 무기 ${pinned}기 회수!`, '#ffd32a', 16);
    }
    return weapons.length;
  }

  clearWeapons() {
    const weapons = this.projectiles.getChildren().slice();
    weapons.forEach(w => {
      if (w.safeDestroy) w.safeDestroy();
      else if (w.destroy) w.destroy();
    });
  }

  onProjectileHit(proj, monster) {
    if (!proj.active || monster.isDead) return;
    const now = this.scene.time.now;

    // 동일 몬스터 재타격 쿨다운 방어
    if (!proj.canHitMonster(monster, now)) return;
    proj.registerHit(monster, now);
    proj.hitCount = (proj.hitCount || 0) + 1;

    const { y, damage, dir, isWind } = proj;

    // 바람 속성은 80% 크리티컬 & 초강력 섬멸 데미지, 일반은 35% 크리티컬
    const isCrit = isWind ? (Math.random() < 0.8) : (Math.random() < 0.35);
    const finalDamage = isCrit ? Math.round(damage * 1.6) : damage;

    monster.takeDamage(finalDamage, dir || 1, now);
    this.hitEffect(monster.x, y, finalDamage, isCrit, dir || 1, isWind);

    // [바람 속성 (2차 스킬: 4명의 몬스터를 없앤다)]
    if (isWind) {
      this.floatText(monster.x, monster.y - 35, `풍둔 섬멸! (${proj.hitCount}/4)`, '#1dd1a1', 15);
      if (proj.hitCount >= (proj.maxHits || 4)) {
        proj.safeDestroy();
      }
      if (monster.isDead) {
        this.scene.cameras.main.shake(120, 0.007);
        this.scene.events.emit('monster-killed', monster);
      }
      return;
    }

    // [표창 (Shuriken) 타격 메커닉: 1개당 정확히 2마리 관통 타격!]
    if (proj.weaponType.includes('shuriken')) {
      if (monster.isDead) {
        this.scene.cameras.main.shake(100, 0.006);
        this.scene.events.emit('monster-killed', monster);
      }

      // 표창 1개당 2마리 타격 판정: 2마리 달성 시 즉시 소멸하여 플레이어에게 즉시 리필
      if (proj.hitCount >= 2) {
        proj.safeDestroy();
      }
      return;
    }

    // [쿠나이 (Kunai) 타격 메커닉: 2차부터 몬스터 몸에 꽂힘]
    if (!monster.isDead && proj.canPin) {
      proj.pinTo(monster);
      this.scene.cameras.main.shake(70, 0.005);
      this.floatText(monster.x, monster.y - 30, `꽂힘! [Z:회수]`, '#ffd32a', 14);
      return;
    } else {
      // 몬스터 사망 또는 꽂힘 불가 시 소멸
      proj.safeDestroy();
      if (monster.isDead) {
        this.scene.cameras.main.shake(100, 0.006);
        this.scene.events.emit('monster-killed', monster);
      }
    }
  }

  onContact(player, monster) {
    if (monster.isDead) return;
    if (player.takeDamage(MONSTER.contactDamage, this.scene.time.now, monster.x)) {
      this.scene.cameras.main.shake(100, 0.004);
      this.floatText(player.x, player.y - 40, `-${MONSTER.contactDamage}`, '#ff4757', 18);
    }
  }

  hitEffect(x, y, damage, isCrit, dir, isWind = false) {
    const s = this.scene;

    // 표창 꽂힘 순간의 원형 충격파 (임팩트 링)
    const ring = s.add.ellipse(x, y, 20, 20, isWind ? 0x1dd1a1 : (isCrit ? 0xffa502 : 0xffffff), 0.8)
      .setDepth(21)
      .setStrokeStyle(3, 0xffffff, 0.9);
    s.tweens.add({
      targets: ring,
      scaleX: 3.2,
      scaleY: 3.2,
      alpha: 0,
      duration: 160,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });

    // 바람 속성 참격 또는 일반 슬래시
    const texName = isWind ? 'wind_slash' : 'hit_slash';
    const slash = s.add.sprite(x, y, texName).setDepth(22);
    slash.setScale(isWind ? 1.5 : (isCrit ? 1.4 : 1.1));
    slash.setAngle(dir > 0 ? (isWind ? 45 : 25) : (isWind ? -135 : -155));
    s.tweens.add({
      targets: slash,
      scaleX: slash.scaleX * 1.4,
      scaleY: slash.scaleY * 1.4,
      alpha: 0,
      duration: isWind ? 190 : 140,
      onComplete: () => slash.destroy()
    });

    // 스파크 파티클 폭발 (강렬한 타격감)
    this.sparkEmitter.explode(isCrit ? 16 : 10, x, y);

    // 찰진 화면 진동
    s.cameras.main.shake(isCrit ? 90 : 60, isCrit ? 0.006 : 0.0035);

    // 메이플스토리 스타일 데미지 스킨 연출
    this.showDamageSkin(x + Phaser.Math.Between(-8, 8), y - 24, damage, isCrit, isWind);
  }

  showDamageSkin(x, y, damage, isCrit, isWind = false) {
    const s = this.scene;

    if (isCrit || isWind) {
      // 크리티컬 또는 바람 폭풍 마크
      const tagText = isWind ? 'WIND STORM!' : 'CRITICAL!';
      const tagColor = isWind ? '#1dd1a1' : '#ff4757';
      const critText = s.add.text(x, y - 18, tagText, {
        fontFamily: '"Malgun Gothic", Impact, sans-serif',
        fontSize: isWind ? '17px' : '16px',
        fontStyle: 'bold',
        color: tagColor,
        stroke: '#2d3436',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(35).setScale(0.5, 0.5);

      s.tweens.add({
        targets: critText,
        scaleX: 1.15,
        scaleY: 1.15,
        y: y - 28,
        duration: 120,
        yoyo: true,
        hold: 200,
        onComplete: () => {
          s.tweens.add({ targets: critText, alpha: 0, duration: 160, onComplete: () => critText.destroy() });
        }
      });
    }

    // 데미지 숫자
    const dmgColor = isWind ? '#55efc4' : (isCrit ? '#ffa502' : '#ffffff');
    const dmgSize = isWind ? 28 : (isCrit ? 26 : 20);
    const txt = s.add.text(x, y, String(damage), {
      fontFamily: '"Malgun Gothic", Impact, sans-serif',
      fontSize: `${dmgSize}px`,
      fontStyle: 'bold',
      color: dmgColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(34).setScale(0.6, 0.6);

    // 통통 튀어오르며 포물선으로 솟구치는 연출
    s.tweens.add({
      targets: txt,
      scaleX: 1.2,
      scaleY: 1.2,
      y: y - 22,
      duration: 100,
      ease: 'Back.easeOut',
      onComplete: () => {
        s.tweens.add({
          targets: txt,
          scaleX: 0.95,
          scaleY: 0.95,
          y: y - 46,
          alpha: 0,
          duration: 500,
          ease: 'Cubic.easeIn',
          onComplete: () => txt.destroy()
        });
      }
    });
  }

  floatText(x, y, str, color = '#fff', size = 16) {
    const t = this.scene.add.text(x, y, str, {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: `${size}px`, color, stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(30);
    this.scene.tweens.add({ targets: t, y: y - 36, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  // ==============================================================
  // 직업 [그림자 군주] 근접 백병전 및 6인 분신 협공 시스템
  // ==============================================================

  fireShadowMelee(player, skillId = 'SKL_SHD_01') {
    const s = this.scene;
    const skill = SHADOW_LORD.skills[skillId] || SHADOW_LORD.skills.SKL_SHD_01;
    const facing = player.facing;
    const sign = facing > 0 ? 1 : -1;

    // 공격 중심 좌표 및 타격 박스 (Width x Height)
    const attackBox = {
      x: facing > 0 ? player.x : player.x - skill.width,
      y: player.y - skill.height / 2,
      w: skill.width,
      h: skill.height
    };

    // 타깃 정렬 및 제한 (Target Count Limit 엄수: 2 -> 4 -> 5 -> 6)
    const monsters = s.monsters ? s.monsters.getChildren().filter(m => m.active && !m.isDead) : [];
    const inRangeMonsters = monsters.filter(m => {
      return (
        m.x >= attackBox.x &&
        m.x <= attackBox.x + attackBox.w &&
        m.y >= attackBox.y &&
        m.y <= attackBox.y + attackBox.h
      );
    });

    // 1순위 보스, 2순위 거리 순으로 정렬 후 차수별 최대 인원수만큼만 슬라이스
    inRangeMonsters.sort((a, b) => {
      if (b.isBoss !== a.isBoss) return b.isBoss ? 1 : -1;
      return Math.abs(a.x - player.x) - Math.abs(b.x - player.x);
    });
    const hitTargets = inRangeMonsters.slice(0, skill.maxTargets);

    // [스킬 구현 테스트 대시보드] 실시간 검증 로깅
    if (typeof window !== 'undefined' && window.logCombatSkillResult) {
      window.logCombatSkillResult({
        skillName: skill.name,
        skillId: skill.id,
        rawCount: inRangeMonsters.length,
        maxTargets: skill.maxTargets,
        hitCount: hitTargets.length
      });
    }

    // 무기 및 분신 시각 효과 연출 매핑
    const weaponTexMap = {
      SKILL_01: 'shadow_blade',
      SKILL_02: 'shadow_blade',
      SKILL_03: 'shadow_blade',
      SKILL_04: 'shadow_dagger',
      SKILL_05: 'shadow_kusarigama',
      SKILL_06: 'shadow_greatsword',
      SKILL_07: 'shadow_lance',
      SKILL_08: 'shadow_glaive',
      SKILL_09: 'shadow_axe',
      SKILL_10: 'shadow_blade',
      SKL_SHD_01: 'shadow_blade',
      SKL_SHD_02: 'shadow_blade',
      SKL_SHD_11: 'shadow_dagger',
      SKL_SHD_12: 'shadow_kusarigama',
      SKL_SHD_21: 'shadow_greatsword',
      SKL_SHD_22: 'shadow_lance',
      SKL_SHD_31: 'shadow_glaive',
      SKL_SHD_32: 'shadow_axe',
      SKL_SHD_ULT: 'shadow_blade'
    };
    const weaponTex = weaponTexMap[skillId] || 'shadow_blade';

    // 1) 분신 출현 연출 (0체 초과인 경우 분신이 실체화되어 벤다)
    if (skill.id !== 'SKL_SHD_01') {
      const cloneX = player.x + sign * Phaser.Math.Between(30, 80);
      const cloneY = player.y + Phaser.Math.Between(-10, 10);
      const clone = s.add.sprite(cloneX, cloneY, 'shadow_clone')
        .setDepth(26)
        .setAlpha(0.88)
        .setScale(1.0)
        .setFlipX(facing < 0);
      
      const cloneWeapon = s.add.sprite(cloneX + sign * 20, cloneY - 4, weaponTex)
        .setDepth(27)
        .setScale(1.2)
        .setFlipX(facing < 0);

      s.tweens.add({
        targets: [clone, cloneWeapon],
        x: cloneX + sign * 50,
        alpha: 0,
        duration: 260,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          clone.destroy();
          cloneWeapon.destroy();
        }
      });
    }

    // 2) 암흑 참격 이펙트 (Shadow Slash)
    const slashX = player.x + sign * (skill.width * 0.45);
    const slashY = player.y - 6;
    const slash = s.add.sprite(slashX, slashY, 'shadow_slash')
      .setDepth(28)
      .setScale((skill.width / 120) * 1.1, (skill.height / 80) * 1.1)
      .setFlipX(facing < 0)
      .setTint(0x8e44ad);

    s.tweens.add({
      targets: slash,
      scaleX: slash.scaleX * 1.3,
      scaleY: slash.scaleY * 1.3,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => slash.destroy()
    });

    // 3) 피격 처리 및 CC 효과 적용
    const baseDamage = player.damage * skill.damageMult;
    let hitCount = 0;

    hitTargets.forEach((m) => {
      hitCount++;
      const isCrit = Phaser.Math.Between(1, 100) <= 30;
      const finalDmg = Math.round(baseDamage * (isCrit ? 1.5 : 1.0));
      m.takeDamage(finalDmg, facing);

      if (m.isDead) {
        s.cameras.main.shake(100, 0.007);
        s.events.emit('monster-killed', m);
      }

      // 특수 CC 판정
      if (skill.pull) {
        // 사슬 포박: 본체 앞으로 견인
        s.tweens.add({
          targets: m,
          x: player.x + sign * 75,
          duration: 180,
          ease: 'Cubic.easeOut'
        });
      } else if (skill.airborne) {
        // 대검: 에어본 공중 띄우기
        if (m.body) m.body.setVelocityY(-360);
      } else if (skill.stun) {
        // 도끼: 기절 (1.5초)
        m.stunUntil = s.time.now + 1500;
        m.setTint(0xf1c40f);
        s.time.delayedCall(1500, () => { if (m.active && !m.isDead) m.clearTint(); });
      } else if (skill.vacuum) {
        // 언월도: 중심 흡입
        s.tweens.add({
          targets: m,
          x: slashX,
          duration: 200,
          ease: 'Sine.easeOut'
        });
      }

      this.hitShadowEffect(m.x, m.y, finalDmg, isCrit, facing);
    });

    s.cameras.main.shake(skill.airborne ? 120 : 80, 0.006);
    this.floatText(player.x, player.y - 50, `⚔️ ${skill.name} (${hitTargets.length}/${skill.maxTargets}인 타격)`, '#a55eea', 15);
    return hitCount;
  }

  // 6종 무기 연계 필살기: 군주의 영토 : 육익 섬멸진
  fireShadowUltimate(player) {
    const s = this.scene;
    const facing = player.facing;
    const sign = facing > 0 ? 1 : -1;

    // 시전 전 시간 완전 무적 (Invulnerable 3.8초)
    player.invulnUntil = s.time.now + 3800;
    this.floatText(player.x, player.y - 70, '👑 【군주의 영토 : 육익 섬멸진】 발동!', '#e056fd', 22);

    // 카메라 암전 오버레이 (Black Dim 75%)
    const dim = s.add.rectangle(s.cameras.main.scrollX + s.cameras.main.width / 2, s.cameras.main.scrollY + s.cameras.main.height / 2, s.cameras.main.width * 2, s.cameras.main.height * 2, 0x05040a, 0.72)
      .setDepth(150)
      .setScrollFactor(0);

    const cleanupDim = () => {
      s.tweens.add({ targets: dim, alpha: 0, duration: 400, onComplete: () => dim.destroy() });
    };

    // 타깃 대상 (최대 6인 엄격 선별)
    const getTargets = () => {
      const monsters = s.monsters ? s.monsters.getChildren().filter(m => m.active && !m.isDead) : [];
      monsters.sort((a, b) => (b.isBoss ? 1 : -1) - (a.isBoss ? 1 : -1) || Math.abs(a.x - player.x) - Math.abs(b.x - player.x));
      return monsters.slice(0, 6);
    };

    // Phase 1 (0ms ~ 800ms): 사슬낫 몰이 (Kusarigama Pull)
    s.cameras.main.shake(120, 0.008);
    const kClone = s.add.sprite(player.x + sign * 120, player.y - 10, 'shadow_clone').setDepth(160).setScale(1.2).setFlipX(facing < 0);
    const kWeapon = s.add.sprite(player.x + sign * 140, player.y - 10, 'shadow_kusarigama').setDepth(161).setScale(1.8).setFlipX(facing < 0);
    s.tweens.add({
      targets: kWeapon,
      angle: sign * 720,
      duration: 700,
      onComplete: () => { kClone.destroy(); kWeapon.destroy(); }
    });

    const targets = getTargets();
    targets.forEach(m => {
      s.tweens.add({ targets: m, x: player.x + sign * 130, y: player.y - 10, duration: 350, ease: 'Cubic.easeOut' });
      const dmg = Math.round(player.damage * 2.5);
      m.takeDamage(dmg, facing);
      this.hitShadowEffect(m.x, m.y, dmg, true, facing);
    });

    // Phase 2 (800ms ~ 1600ms): 쌍단검 8연타 & 창 돌파 관통
    s.time.delayedCall(800, () => {
      s.cameras.main.shake(150, 0.010);
      this.floatText(player.x + sign * 130, player.y - 80, '제1분신(단검) + 제4분신(창) 교차 관통!', '#ff6b81', 17);

      for (let i = 0; i < 4; i++) {
        s.time.delayedCall(i * 120, () => {
          const slash = s.add.sprite(player.x + sign * 130 + Phaser.Math.Between(-40, 40), player.y + Phaser.Math.Between(-30, 30), 'shadow_slash')
            .setDepth(165)
            .setScale(1.4)
            .setTint(0xff4757);
          s.tweens.add({ targets: slash, alpha: 0, scaleX: 1.8, duration: 150, onComplete: () => slash.destroy() });

          const curTargets = getTargets();
          curTargets.forEach(m => {
            const dmg = Math.round(player.damage * 1.2);
            m.takeDamage(dmg, facing);
            this.hitShadowEffect(m.x, m.y, dmg, false, facing);
          });
        });
      }
    });

    // Phase 3 (1600ms ~ 2500ms): 대검 에어본 횡베기 & 언월도 공중 360도 회전
    s.time.delayedCall(1600, () => {
      s.cameras.main.shake(200, 0.012);
      this.floatText(player.x + sign * 130, player.y - 90, '제3분신(대검) + 제5분신(언월도) 폭풍 난무!', '#00d2d3', 18);

      const curTargets = getTargets();
      curTargets.forEach(m => {
        if (m.body) m.body.setVelocityY(-400);
        const dmg = Math.round(player.damage * 4.5);
        m.takeDamage(dmg, facing);
        this.hitShadowEffect(m.x, m.y, dmg, true, facing);
      });
    });

    // Phase 4 (2500ms ~ 3400ms): 제6분신 도끼 수직 낙하 강타 & 본체 군주검 종결 폭발
    s.time.delayedCall(2500, () => {
      s.cameras.main.shake(450, 0.022); // 강렬한 지진 진동
      s.cameras.main.flash(300, 255, 255, 255); // 섬광
      this.floatText(player.x + sign * 130, player.y - 100, '💥 제6분신(도끼) 단죄의 종결 강타! (방어력 100% 분쇄)', '#ffd32a', 21);

      // 거대 도끼 낙하 연출
      const axe = s.add.sprite(player.x + sign * 130, player.y - 180, 'shadow_axe')
        .setDepth(170)
        .setScale(2.5)
        .setAngle(sign * 45);
      
      s.tweens.add({
        targets: axe,
        y: player.y + 10,
        duration: 150,
        ease: 'Quad.easeIn',
        onComplete: () => {
          axe.destroy();
          // 암흑 폭발
          const burst = s.add.ellipse(player.x + sign * 130, player.y, 300, 150, 0xa55eea, 0.9).setDepth(170);
          s.tweens.add({ targets: burst, scaleX: 2.2, scaleY: 2.2, alpha: 0, duration: 400, onComplete: () => burst.destroy() });
        }
      });

      const finalTargets = getTargets();
      finalTargets.forEach(m => {
        // 트루 대미지 (공격력의 18.0배 폭딜)
        const ultraDmg = Math.round(player.damage * 18.0);
        m.takeDamage(ultraDmg, facing);
        if (m.isDead) s.events.emit('monster-killed', m);
        this.hitShadowEffect(m.x, m.y, ultraDmg, true, facing);
      });

      cleanupDim();
    });
  }

  hitShadowEffect(x, y, damage, isCrit, dir) {
    const s = this.scene;
    // 보랏빛 암흑 링
    const ring = s.add.ellipse(x, y, 26, 26, 0xa55eea, 0.85).setDepth(31).setStrokeStyle(3, 0xffffff, 0.95);
    s.tweens.add({
      targets: ring,
      scaleX: 3.5,
      scaleY: 3.5,
      alpha: 0,
      duration: 180,
      onComplete: () => ring.destroy()
    });

    this.sparkEmitter.explode(isCrit ? 18 : 12, x, y);
    this.showShadowDamage(x + Phaser.Math.Between(-8, 8), y - 24, damage, isCrit);
  }

  showShadowDamage(x, y, damage, isCrit) {
    const s = this.scene;
    const txt = s.add.text(x, y, String(damage), {
      fontFamily: '"Malgun Gothic", Impact, sans-serif',
      fontSize: isCrit ? '29px' : '23px',
      fontStyle: 'bold',
      color: isCrit ? '#feca57' : '#a29bfe',
      stroke: '#130f40',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(36).setScale(0.7);

    s.tweens.add({
      targets: txt,
      scaleX: 1.25,
      scaleY: 1.25,
      y: y - 28,
      duration: 120,
      ease: 'Back.easeOut',
      onComplete: () => {
        s.tweens.add({
          targets: txt,
          scaleX: 0.9,
          scaleY: 0.9,
          y: y - 55,
          alpha: 0,
          duration: 480,
          ease: 'Cubic.easeIn',
          onComplete: () => txt.destroy()
        });
      }
    });
  }
}

