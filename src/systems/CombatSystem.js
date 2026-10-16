import Projectile from '../entities/Projectile.js';
import { MONSTER } from '../config/gameConfig.js';

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

  fireShuriken(player) {
    return this.fireTier1(player);
  }

  // 1차 공격 (Ctrl): 표창만 가능, 최대 2명 이하 타격
  fireTier1(player) {
    const p = new Projectile(this.scene, player.x + player.facing * 32, player.y - 8, 'shuriken', {
      tier: 1,
      maxHits: 2,           // 1차: 2명 이하 타격
      canPin: false
    });
    this.projectiles.add(p);
    p.launch(player.facing, player.damage);
    this.floatText(player.x, player.y - 45, '1차: 표창 투척 (2명 관통 타격)', '#00d2d3', 14);
    return [p];
  }

  // 2차 기본 공격: 쿠나이와 표창 가능, 최대 3명 이하 타격, 몬스터에 꽂힘 가능
  fireTier2(player, weaponType = null) {
    const weapon = weaponType || player.selectedWeapon || 'shuriken';
    const suspended = this.getSuspendedWeapon(weapon);
    if (suspended) {
      this.relaunchWeapons(player.facing);
      this.floatText(player.x, player.y - 45, `2차: ${suspended.cfg.name} 재발사!`, '#feca57', 15);
      return this.getActiveWeapons();
    }

    const baseAngle = player.facing > 0 ? 0 : Math.PI;
    const p = new Projectile(this.scene, player.x + player.facing * 30, player.y - 10, weapon, {
      tier: 2,
      maxHits: 3,           // 2차 기본: 3명 이하 타격
      canPin: true          // 몬스터에 꽂힌 표창 회수 가능
    });
    this.projectiles.add(p);
    p.launchAngle(baseAngle, player.damage, player.facing);

    const name = weapon === 'kunai' ? '쿠나이' : '표창';
    this.floatText(player.x, player.y - 45, `2차: ${name} 투척 (최대 3명 타격, 꽂힘 가능)`, '#feca57', 14);
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

  // 무기 전탄 회수 (몬스터에 꽂힌 표창 + 공중 대기 무기)
  recallWeapons(player) {
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

    // [2차 기본 공격: 몬스터에 꽂힌 표창 회수 가능 & 3명 이하 타격]
    if (proj.canPin && !monster.isDead && proj.hitCount <= (proj.maxHits || 3)) {
      proj.pinTo(monster);
      this.floatText(monster.x, monster.y - 30, `꽂힘! (회수: Z)`, '#ffd32a', 13);
      return;
    }

    // [1차 공격: 표창만 2명 이하 타격]
    if (proj.tier === 1) {
      if (proj.hitCount >= 2) {
        proj.safeDestroy();
      }
      // 1명째 맞았을 때는 관통하여 계속 날아감 (최대 2명 타격)
    } else {
      // 3차 또는 기타 무기
      if (proj.hitCount >= (proj.maxHits || 3)) {
        proj.suspend();
      }
    }

    if (monster.isDead) {
      this.scene.cameras.main.shake(100, 0.005);
      this.scene.events.emit('monster-killed', monster);
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

    // 바람 속성 참격 또는 일반 슬래시
    const texName = isWind ? 'wind_slash' : 'hit_slash';
    const slash = s.add.sprite(x, y, texName).setDepth(22);
    slash.setScale(isWind ? 1.4 : (isCrit ? 1.3 : 0.95));
    slash.setAngle(dir > 0 ? (isWind ? 45 : 25) : (isWind ? -135 : -155));
    s.tweens.add({
      targets: slash,
      scaleX: slash.scaleX * 1.3,
      scaleY: slash.scaleY * 1.3,
      alpha: 0,
      duration: isWind ? 180 : 130,
      onComplete: () => slash.destroy()
    });

    // 스파크 파티클
    this.sparkEmitter.explode(isCrit ? 12 : 6, x, y);

    // 가벼운 화면 흔들림
    s.cameras.main.shake(isCrit ? 80 : 45, isCrit ? 0.0045 : 0.002);

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
}
