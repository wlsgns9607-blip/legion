import Phaser from 'phaser';
import { GAME } from '../config/gameConfig.js';
import { MAPS, START_MAP } from '../config/maps.js';

const STATE_KEY = 'playerState';   // 맵 전환 간 플레이어 성장 상태 저장 키 (game.registry)
const PORTAL_RANGE = 46;           // 포탈 중심으로부터 상호작용 가능한 가로 거리
const LABEL_STYLE = {
  fontFamily: '"Malgun Gothic","Apple SD Gothic Neo",sans-serif', fontSize: '13px',
  color: '#ffffff', stroke: '#000000', strokeThickness: 3
};

// 장식 그리기 함수 (theme.decor 값으로 선택)
const DECOR = {
  house(g, x, y, i) {
    const roof = [0xe17055, 0x0984e3, 0x00b894][i % 3];
    g.fillStyle(0xf5e6c8).fillRect(x - 50, y - 80, 100, 80);
    g.fillStyle(roof).fillTriangle(x - 62, y - 78, x + 62, y - 78, x, y - 130);
    g.fillStyle(0x8d5a3b).fillRect(x - 12, y - 44, 24, 44);
    g.fillStyle(0x9fd8ff).fillRect(x - 40, y - 62, 18, 16).fillRect(x + 22, y - 62, 18, 16);
  },
  tree(g, x, y) {
    g.fillStyle(0x7a5230).fillRect(x - 8, y - 70, 16, 70);
    g.fillStyle(0x2e8b57).fillCircle(x, y - 100, 42).fillCircle(x - 30, y - 78, 30).fillCircle(x + 30, y - 78, 30);
    g.fillStyle(0x58c27d, 0.8).fillCircle(x - 12, y - 112, 16);
  },
  mushroom(g, x, y, i) {
    const h = 60 + (i % 3) * 25;
    const cap = [0xe74c3c, 0xff9f43, 0xa55eea][i % 3];
    g.fillStyle(0xfff3e0).fillRect(x - 10, y - h, 20, h);
    g.fillStyle(cap).fillEllipse(x, y - h, 92, 50);
    g.fillStyle(0xffffff, 0.9).fillCircle(x - 20, y - h - 8, 6).fillCircle(x + 14, y - h - 12, 5).fillCircle(x + 4, y - h + 6, 4);
  },
  pillar(g, x, y, i) {
    const h = [150, 100, 170, 70][i % 4];
    g.fillStyle(0xbfae94).fillRect(x - 20, y - h, 40, h);
    g.fillStyle(0xa89880).fillRect(x - 28, y - h - 12, 56, 12).fillRect(x - 28, y - 12, 56, 12);
    g.lineStyle(2, 0x8a7a64).lineBetween(x - 6, y - h + 20, x + 4, y - h + 50);
  },
  deadtree(g, x, y) {
    g.fillStyle(0x1e1830).fillRect(x - 7, y - 120, 14, 120);
    g.lineStyle(6, 0x1e1830)
      .lineBetween(x, y - 90, x - 40, y - 130)
      .lineBetween(x, y - 70, x + 45, y - 110)
      .lineBetween(x - 25, y - 112, x - 40, y - 150);
    g.fillStyle(0xb8a9ff, 0.25).fillCircle(x + 30, y - 170, 14);
  }
};

// 모든 맵이 공유하는 맵 구성/포탈/전환/상태 유지 관리자.
export default class MapManager {
  constructor(scene, mapId) {
    this.scene = scene;
    this.map = MAPS[mapId] || MAPS[START_MAP];
    this.transitioning = false;
    this.portals = [];
  }

  // 배경·지형·포탈을 생성하고 충돌용 지형 목록을 반환한다.
  build() {
    const s = this.scene, W = this.map.width, H = GAME.height, GY = GAME.groundY;
    s.physics.world.setBounds(0, 0, W, H);
    s.cameras.main.setBounds(0, 0, W, H);

    this.drawBackground();
    this.drawDecor();

    const solids = [this.addSolid(W / 2, GY + 30, W, 60, false)];
    this.map.platforms.forEach(([x, y, w]) => solids.push(this.addSolid(x, y, w, 20, true)));

    this.map.portals.forEach(cfg => this.portals.push(this.createPortal(cfg)));
    this.prompt = s.add.text(0, 0, '', { ...LABEL_STYLE, fontSize: '14px', backgroundColor: '#00000088', padding: { x: 8, y: 4 } })
      .setOrigin(0.5).setDepth(41).setVisible(false);
    this.upKey = s.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    return solids;
  }

  addSolid(x, y, w, h, oneWay) {
    const s = this.scene.add.tileSprite(x, y, w, h, 'ground').setTint(this.map.theme.groundTint);
    this.scene.physics.add.existing(s, true);
    if (oneWay) Object.assign(s.body.checkCollision, { down: false, left: false, right: false });
    return s;
  }

  drawBackground() {
    const s = this.scene, t = this.map.theme, W = this.map.width, H = GAME.height, GY = GAME.groundY, VW = GAME.width;
    const span = f => (W - VW) * f + VW;     // 패럴랙스 계수 f에서 필요한 가로 길이

    s.cameras.main.setBackgroundColor(t.skyBottom);
    s.add.graphics().setScrollFactor(0).setDepth(-100)
      .fillGradientStyle(t.skyTop, t.skyTop, t.skyBottom, t.skyBottom, 1)
      .fillRect(0, 0, VW, H);

    for (let i = 0, x = 60; x < span(0.2) + 120; i++, x += 240) {
      s.add.ellipse(x, 50 + (i % 3) * 35, 120, 34, t.cloud, t.dark ? 0.25 : 0.8).setScrollFactor(0.2).setDepth(-90);
    }

    const hills = s.add.graphics().setScrollFactor(0.45).setDepth(-80);
    hills.fillStyle(t.hill, t.dark ? 0.9 : 0.75);
    for (let i = 0, x = 0; x < span(0.45) + 200; i++, x += 180) hills.fillCircle(x, GY + 40, 120 + (i % 3) * 40);
  }

  drawDecor() {
    const t = this.map.theme, draw = DECOR[t.decor];
    if (!draw) return;
    const g = this.scene.add.graphics().setDepth(-50);
    const avoid = this.map.portals.map(p => p.x);
    for (let i = 0, x = 220; x < this.map.width - 150; i++, x += t.decorGap) {
      if (avoid.some(px => Math.abs(px - x) < 120)) continue;
      draw(g, x, GAME.groundY, i);
    }
  }

  createPortal(cfg) {
    const s = this.scene, y = GAME.groundY - 50;
    const target = cfg.to && MAPS[cfg.to.map] ? cfg.to : null;   // 연결 대상이 없으면 비활성
    const color = target ? 0x7ee8fa : 0x8a8a8a;
    const glow = s.add.ellipse(cfg.x, y, 70, 110, color, target ? 0.25 : 0.12).setDepth(-5);
    s.add.ellipse(cfg.x, y, 44, 90, color, target ? 0.6 : 0.3).setDepth(-4).setStrokeStyle(3, 0xffffff, target ? 0.9 : 0.4);
    if (target) {
      s.tweens.add({ targets: glow, scaleX: 1.15, scaleY: 1.08, alpha: 0.45, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    s.add.text(cfg.x, y - 72, cfg.label, { ...LABEL_STYLE, color: target ? '#ffffff' : '#bbbbbb' }).setOrigin(0.5).setDepth(40);
    return { x: cfg.x, target };
  }

  // 매 프레임: 포탈 범위 검사, 안내 표시, ↑ 키 입력 시 전환
  update(player) {
    if (this.transitioning) return;
    const onGround = Math.abs(player.body.bottom - GAME.groundY) < 30;
    const near = (!player.isDead && onGround) ? this.portals.find(p => Math.abs(player.x - p.x) < PORTAL_RANGE) : null;

    if (!near) { this.prompt.setVisible(false); return; }
    const text = near.target ? `↑  ${MAPS[near.target.map].name}(으)로 이동` : '지금은 갈 수 없는 길입니다';
    this.prompt.setPosition(near.x, GAME.groundY - 150).setText(text).setColor(near.target ? '#ffffff' : '#bbbbbb').setVisible(true);
    if (near.target && Phaser.Input.Keyboard.JustDown(this.upKey)) this.travel(near.target);
  }

  travel(to) {
    if (this.transitioning || !to || !MAPS[to.map]) return;   // 중복 전환 방지
    this.transitioning = true;
    const s = this.scene;
    this.prompt.setVisible(false);
    if (s.combat) s.combat.clearWeapons();
    this.saveState();
    if (window.saveGameDataToServer) window.saveGameDataToServer(false);
    s.physics.pause();                                          // 전환 중 피격/이동 차단
    s.cameras.main.fadeOut(250, 0, 0, 0);
    s.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      s.scene.restart({ mapId: to.map, spawnX: to.x });
    });
  }

  // 새 맵 진입 연출 (페이드 인 + 맵 이름 배너)
  enter() {
    const s = this.scene;
    s.cameras.main.fadeIn(300, 0, 0, 0);
    const banner = s.add.text(GAME.width / 2, 130, this.map.name, {
      ...LABEL_STYLE, fontSize: '30px', fontStyle: 'bold', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(120).setAlpha(0);
    s.tweens.add({
      targets: banner, alpha: 1, y: 115, duration: 350, hold: 1100, yoyo: true,
      onComplete: () => banner.destroy()
    });
  }

  saveState() {
    const s = this.scene;
    s.registry.set(STATE_KEY, {
      level: s.xp.level, exp: s.xp.exp, hp: s.player.hp, mp: s.player.mp, kills: s.kills,
      jobTier: s.player.jobTier,
      quest: s.quest
    });
  }

  restoreState() {
    const s = this.scene, st = s.registry.get(STATE_KEY);
    if (!st) return;
    s.xp.level = st.level;
    s.xp.exp = st.exp;
    s.kills = st.kills;
    if (st.jobTier) s.player.jobTier = st.jobTier;
    if (st.level > 1) s.player.applyLevelUp(st.level);        // 레벨 기반 최대 HP/MP/공격력 재계산
    s.player.hp = Phaser.Math.Clamp(st.hp, 1, s.player.maxHp);
    s.player.mp = Phaser.Math.Clamp(st.mp, 0, s.player.maxMp);
    if (st.quest) s.quest = st.quest;
  }
}
