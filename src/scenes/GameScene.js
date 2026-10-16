import Phaser from 'phaser';
import { GAME, MONSTER, POTION } from '../config/gameConfig.js';
import { START_MAP } from '../config/maps.js';
import Player from '../entities/Player.js';
import Monster from '../entities/Monster.js';
import CombatSystem from '../systems/CombatSystem.js';
import ExperienceSystem from '../systems/ExperienceSystem.js';
import MapManager from '../systems/MapManager.js';
import HUD from '../ui/HUD.js';

// 하나의 GameScene을 맵 데이터로 재시작(restart)하여 5개 맵을 공용으로 처리한다.
export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create(data = {}) {
    const GY = GAME.groundY;
    this.physics.resume();

    // 맵 구성 (배경 + 지면/발판 + 포탈)
    this.maps = new MapManager(this, data.mapId || START_MAP);
    const map = this.maps.map;
    this.solids = this.maps.build();
    this.spawnX = data.spawnX ?? map.spawn.x;

    this.player = new Player(this, this.spawnX, GY - 70);
    this.combat = new CombatSystem(this);
    this.xp = new ExperienceSystem();
    this.kills = 0;
    this.respawnTimer = null;

    // 퀘스트 1 상태 초기화 (맵 1 / 초록 숲의 몬스터 30명 처치)
    this.quest = {
      id: 'quest1',
      title: '초록 숲 몬스터 30마리 처치',
      status: 'NOT_STARTED', // 'NOT_STARTED' | 'IN_PROGRESS' | 'READY_TO_COMPLETE' | 'COMPLETED'
      kills: 0,
      targetCount: 30,
      targetMap: 'map02'
    };

    this.maps.restoreState();                 // 이전 맵의 레벨/경험치/HP/MP/처치 수/차수/퀘스트 복원

    // 맵별 몬스터 배치 (마을에는 몬스터 없음, 나머지 4개 맵만 배치)
    this.monsters = this.physics.add.group({ runChildUpdate: true });
    if (map.monsters && map.monsters.length > 0) {
      map.monsters.forEach(m => this.monsters.add(new Monster(this, m.x, m.y ?? GY - 40, this.player)));
    }

    // 마을 NPC 생성 (장로 타키)
    this.setupNPC(map);

    this.potions = this.physics.add.group({ allowGravity: true });

    this.solids.forEach(s => {
      this.physics.add.collider(this.player, s);
      this.physics.add.collider(this.monsters, s);
      this.physics.add.collider(this.potions, s);
    });
    this.combat.setup(this.player, this.monsters);
    this.physics.add.overlap(this.player, this.potions, (p, pot) => this.collectPotion(p, pot));

    // 씬 재시작 시 Scene 이벤트 리스너가 누적되지 않도록 정리
    this.events.off('monster-killed');
    this.events.once('shutdown', () => this.events.off('monster-killed'));
    this.events.on('monster-killed', m => {
      this.kills++;
      this.xp.addExp(m.exp);
      this.combat.floatText(m.x, m.y - 30, `+${m.exp} EXP`, '#7ec8ff', 14);
      this.spawnPotions(m.x, m.y);
      this.time.delayedCall(MONSTER.respawnMs, () => m.respawn());

      // [퀘스트 1]: 맵 1(초록 숲/map02)의 몬스터 30마리 처치 카운트
      if (this.maps.map.id === 'map02' && this.quest.status === 'IN_PROGRESS') {
        this.quest.kills = Math.min(this.quest.targetCount, this.quest.kills + 1);
        if (this.quest.kills >= this.quest.targetCount) {
          this.quest.status = 'READY_TO_COMPLETE';
          this.combat.floatText(this.player.x, this.player.y - 65, '★ [퀘스트 1 완료 가능] 마을의 장로 타키에게 보고하세요! ★', '#ffd32a', 18);
          this.cameras.main.flash(200, 255, 230, 100);
        } else {
          this.combat.floatText(m.x, m.y - 45, `퀘스트1: 초록 숲 몬스터 처치 (${this.quest.kills}/${this.quest.targetCount})`, '#1dd1a1', 14);
        }
      }
    });

    this.xp.on('levelup', lv => {
      this.player.applyLevelUp(lv);
      this.combat.floatText(this.player.x, this.player.y - 50, `LEVEL UP! Lv.${lv}`, '#ffe14d', 22);
      if (window.saveGameDataToServer) window.saveGameDataToServer(false);
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.hud = new HUD(this, map.name);

    // 로그인된 유저 데이터가 있으면 즉시 로드
    if (window.currentUser) {
      this.loadUserData(window.currentUser, false);
    }

    // 서버 DB 자동/수동 저장 인터페이스 등록
    window.saveGameDataToServer = async (showNotice = false) => {
      if (!window.currentUser || window.currentUser.username === 'guest') return false;
      const payload = {
        username: window.currentUser.username,
        level: this.xp.level,
        exp: this.xp.exp,
        hp: this.player.hp,
        mp: this.player.mp,
        job_tier: this.player.jobTier,
        kills: this.kills,
        quest_status: this.quest.status,
        quest_kills: this.quest.kills
      };
      try {
        const res = await fetch('http://127.0.0.1:8000/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          if (showNotice && this.combat) {
            this.combat.floatText(this.player.x, this.player.y - 45, 'DB 저장 완료!', '#1dd1a1', 16);
          }
          const userNickDisplay = document.getElementById('userNickDisplay');
          if (userNickDisplay) {
            userNickDisplay.innerText = `${window.currentUser.nickname} (Lv.${this.xp.level})`;
          }
          return true;
        }
      } catch (e) {
        console.error('Save to server error', e);
      }
      return false;
    };

    this.maps.enter();
  }

  loadUserData(user, showNotice = true) {
    if (!user) return;
    this.xp.level = user.level || 1;
    this.xp.exp = user.exp || 0;
    this.player.applyLevelUp(this.xp.level);
    if (user.job_tier) this.player.setJobTier(user.job_tier);
    this.player.hp = Phaser.Math.Clamp(user.hp || this.player.maxHp, 1, this.player.maxHp);
    this.player.mp = Phaser.Math.Clamp(user.mp || this.player.maxMp, 0, this.player.maxMp);
    this.kills = user.kills || 0;
    if (user.quest_status) this.quest.status = user.quest_status;
    if (user.quest_kills !== undefined) this.quest.kills = user.quest_kills;

    this.updateQuestBubble();
    if (showNotice && this.combat) {
      this.combat.floatText(this.player.x, this.player.y - 60, `환영합니다! [${user.nickname}]님 (Lv.${this.xp.level})`, '#ffd32a', 18);
    }
  }

  // 마을 NPC 및 퀘스트 대화 인터랙션 설정
  setupNPC(map) {
    this.npc = null;
    this.npcPrompt = null;
    this.questDialogUI = null;
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    if (map.npcs && map.npcs.length > 0) {
      const npcData = map.npcs[0];
      const GY = GAME.groundY;

      // NPC 스프라이트
      const npcSprite = this.add.sprite(npcData.x, GY - 36, 'npc_elder').setDepth(9);
      npcSprite.setInteractive({ cursor: 'pointer' });
      npcSprite.on('pointerdown', () => this.interactWithNPC());

      // NPC 이름표
      this.add.text(npcData.x, GY - 78, `[장로] ${npcData.name}`, {
        fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px',
        color: '#ffeaa7', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(10);

      // 머리 위 퀘스트 말풍선 아이콘
      this.questBubble = this.add.sprite(npcData.x, GY - 98, 'quest_icon_start').setDepth(11);
      this.tweens.add({
        targets: this.questBubble,
        y: GY - 105,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // 대화 상호작용 안내 텍스트
      this.npcPrompt = this.add.text(npcData.x, GY - 128, 'Space: 대화하기', {
        fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px',
        color: '#ffffff', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(12).setVisible(false);

      this.npc = { x: npcData.x, name: npcData.name, sprite: npcSprite };
      this.updateQuestBubble();
    }
  }

  updateQuestBubble() {
    if (!this.questBubble) return;
    if (this.quest.status === 'NOT_STARTED') {
      this.questBubble.setTexture('quest_icon_start').setVisible(true).setTint(0xffffff);
    } else if (this.quest.status === 'IN_PROGRESS') {
      this.questBubble.setTexture('quest_icon_ing').setVisible(true).setTint(0xffffff);
    } else if (this.quest.status === 'READY_TO_COMPLETE') {
      this.questBubble.setTexture('quest_icon_ready').setVisible(true).setTint(0xffd32a);
    } else {
      this.questBubble.setVisible(false); // 완료 후 숨김
    }
  }

  interactWithNPC() {
    if (this.questDialogUI) {
      // 대화창이 열려있을 때 누르면 확인/수락/완료 진행
      this.advanceQuestDialog();
      return;
    }
    this.openQuestDialog();
  }

  openQuestDialog() {
    if (this.questDialogUI) return;
    const s = this;
    const width = 540, height = 220;
    const cx = GAME.width / 2, cy = GAME.height / 2;

    const container = s.add.container(0, 0).setScrollFactor(0).setDepth(200);

    // 반투명 배경 패널
    const bg = s.add.rectangle(cx, cy, width, height, 0x111625, 0.92)
      .setStrokeStyle(3, 0xf1c40f)
      .setInteractive();

    // NPC 일러스트/아이콘 박스
    const portraitBg = s.add.rectangle(cx - 190, cy, 90, 150, 0x222f3e, 0.8).setStrokeStyle(2, 0x747d8c);
    const portrait = s.add.sprite(cx - 190, cy + 10, 'npc_elder').setScale(1.3);
    const nameLabel = s.add.text(cx - 190, cy - 65, '장로 타키', {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#ffd166', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    // 퀘스트 대화 텍스트
    let titleStr = '';
    let bodyStr = '';
    let btnStr = '';

    if (this.quest.status === 'NOT_STARTED') {
      titleStr = '📜 [퀘스트 1] 초록 숲 정화 요청';
      bodyStr = '안녕하신가, 시노비여!\n마을 밖 [초록 숲](맵 1)에 몬스터들이 급증하여\n마을 주민들이 큰 불안에 떨고 있네.\n\n초록 숲으로 가서 몬스터 30마리를 처치해주겠는가?';
      btnStr = '[Space 또는 클릭]: 퀘스트 수락';
    } else if (this.quest.status === 'IN_PROGRESS') {
      titleStr = '📜 [퀘스트 1] 초록 숲 정화 진행 중';
      bodyStr = `아직 초록 숲에 몬스터들이 남아있네.\n\n현재 처치 상황: (${this.quest.kills} / ${this.quest.targetCount} 마리)\n초록 숲(오른쪽 포탈)으로 가서 30마리를 모두 소탕해주게나!`;
      btnStr = '[Space 또는 클릭]: 확인';
    } else if (this.quest.status === 'READY_TO_COMPLETE') {
      titleStr = '🎉 [퀘스트 1] 초록 숲 정화 완료!';
      bodyStr = '오오! 초록 숲의 몬스터 30마리를 모두 소탕해주었군!\n자네의 눈부신 활약 덕분에 마을에 평화가 찾아왔네.\n\n★ 보상: 경험치 +350 EXP, 체력/마나 회복';
      btnStr = '[Space 또는 클릭]: 보상 받기';
    } else {
      titleStr = '📜 [퀘스트 1] 완료됨';
      bodyStr = '자네의 헌신적인 활약은 마을의 전설이 될 걸세.\n수련을 계속하여 더욱 강한 시노비가 되어주게나!';
      btnStr = '[Space 또는 클릭]: 닫기';
    }

    const titleText = s.add.text(cx - 120, cy - 80, titleStr, {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#ffd32a', stroke: '#000', strokeThickness: 3
    });

    const bodyText = s.add.text(cx - 120, cy - 50, bodyStr, {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px', color: '#ffffff', stroke: '#000', strokeThickness: 2, lineSpacing: 5
    });

    const btnText = s.add.text(cx + 60, cy + 75, btnStr, {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#55efc4', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    container.add([bg, portraitBg, portrait, nameLabel, titleText, bodyText, btnText]);

    bg.on('pointerdown', () => this.advanceQuestDialog());
    this.questDialogUI = container;
  }

  advanceQuestDialog() {
    if (!this.questDialogUI) return;

    if (this.quest.status === 'NOT_STARTED') {
      this.quest.status = 'IN_PROGRESS';
      this.quest.kills = 0;
      this.combat.floatText(this.player.x, this.player.y - 50, '★ 퀘스트 수락: 초록 숲 몬스터 30마리 처치! ★', '#1dd1a1', 16);
      this.soundSpark(this.player.x, this.player.y);
      if (window.saveGameDataToServer) window.saveGameDataToServer(false);
    } else if (this.quest.status === 'READY_TO_COMPLETE') {
      this.quest.status = 'COMPLETED';
      // 보상 지급: 350 EXP, 체력/마나 완충
      this.xp.addExp(350);
      this.player.healHp(this.player.maxHp);
      this.player.healMp(this.player.maxMp);
      this.combat.floatText(this.player.x, this.player.y - 50, '★ 퀘스트 1 완료! (+350 EXP & HP/MP 회복) ★', '#ffd32a', 18);
      this.cameras.main.flash(300, 255, 215, 0);
      this.soundSpark(this.player.x, this.player.y);
      if (window.saveGameDataToServer) window.saveGameDataToServer(false);
    }

    this.updateQuestBubble();
    this.closeQuestDialog();
  }

  closeQuestDialog() {
    if (this.questDialogUI) {
      this.questDialogUI.destroy();
      this.questDialogUI = null;
    }
  }

  soundSpark(x, y) {
    const em = this.add.particles(x, y, 'spark', {
      speed: { min: 80, max: 200 }, lifespan: 250, scale: { start: 1.2, end: 0 },
      quantity: 12, emitting: false
    }).setDepth(210);
    em.explode(12);
    this.time.delayedCall(300, () => em.destroy());
  }

  spawnPotions(x, y) {
    const drops = [];
    if (Math.random() <= POTION.dropChanceHp) drops.push({ type: 'hp', tex: 'potion_hp' });
    if (Math.random() <= POTION.dropChanceMp) drops.push({ type: 'mp', tex: 'potion_mp' });

    // 둘 다 안 나왔을 경우 최소 1개는 확정 드롭
    if (drops.length === 0) {
      const type = Math.random() < 0.5 ? 'hp' : 'mp';
      drops.push({ type, tex: `potion_${type}` });
    }

    drops.forEach((d, i) => {
      const offsetX = (i - (drops.length - 1) / 2) * 20;
      this.createPotion(x + offsetX, y - 8, d.tex, d.type);
    });
  }

  createPotion(x, y, texture, type) {
    const pot = this.physics.add.sprite(x, y, texture);
    this.potions.add(pot);
    pot.potionType = type;
    pot.setCollideWorldBounds(true);
    pot.setBounce(0.3);
    pot.setDragX(100);
    pot.setVelocity(Phaser.Math.Between(-80, 80), Phaser.Math.Between(-250, -170));
    pot.setDepth(15);

    this.time.delayedCall(12000, () => {
      if (!pot.active) return;
      this.tweens.add({
        targets: pot, alpha: 0, duration: 250, yoyo: true, repeat: 6,
        onComplete: () => { if (pot.active) pot.destroy(); }
      });
    });
  }

  collectPotion(player, potion) {
    if (player.isDead || !potion.active) return;
    const { potionType, x, y } = potion;
    potion.destroy();

    const em = this.add.particles(x, y, 'spark', {
      speed: { min: 40, max: 120 }, lifespan: 200, scale: { start: 1, end: 0 },
      quantity: 6, emitting: false
    }).setDepth(25);
    em.explode(6);
    this.time.delayedCall(300, () => em.destroy());

    if (potionType === 'hp') {
      player.healHp(POTION.hpHeal);
      this.combat.floatText(player.x, player.y - 45, `+${POTION.hpHeal} HP`, '#2ecc71', 15);
    } else if (potionType === 'mp') {
      player.healMp(POTION.mpHeal);
      this.combat.floatText(player.x, player.y - 45, `+${POTION.mpHeal} MP`, '#3498db', 15);
    }
  }

  update(time) {
    const p = this.player;
    if (this.maps.transitioning) { this.hud.update(p, this.xp, this.kills, this.quest); return; }
    p.update(time);

    // NPC 상호작용 체크 (마을)
    if (this.npc && this.npcPrompt) {
      const dist = Math.abs(p.x - this.npc.x);
      const isNear = dist < 70 && !p.isDead;
      this.npcPrompt.setVisible(isNear && !this.questDialogUI);
      if (isNear && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.interactWithNPC();
      }
    } else if (this.questDialogUI && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.advanceQuestDialog();
    }

    if (p.isDead && !this.respawnTimer) {
      this.respawnTimer = this.time.delayedCall(3000, () => {
        p.revive(this.maps.map.spawn.x, GAME.groundY - 70, this.time.now);
        this.combat.floatText(p.x, p.y - 40, '부활했습니다!', '#ffe14d', 18);
        this.respawnTimer = null;
      });
    }

    if (p.y > GAME.height + 50) p.setPosition(p.x, GAME.groundY - 70).setVelocity(0, 0); // 낙하 안전장치
    this.maps.update(p);
    this.hud.update(p, this.xp, this.kills, this.quest);
  }
}
