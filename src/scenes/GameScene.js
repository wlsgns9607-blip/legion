import Phaser from 'phaser';
import { GAME, LEVEL, MONSTER, POTION } from '../config/gameConfig.js';
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

    // 로그인 상태 확인: 로그인 전이면 물리/조작 정지 및 키보드 입력 비활성화(회원가입 폼 키 입력 보장)
    this.isGameActive = !!window.currentUser;
    if (this.isGameActive) {
      this.physics.resume();
      if (this.input.keyboard) this.input.keyboard.enabled = true;
    } else {
      this.physics.pause();
      if (this.input.keyboard) this.input.keyboard.enabled = false;
    }
    if (this.input.keyboard) {
      this.input.keyboard.preventDefault = false;
      this.input.keyboard.clearCaptures();
    }

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

    // 맵별 몬스터 배치 (마을에는 몬스터 없음, 나머지 맵별 배치)
    this.monsters = this.physics.add.group({ runChildUpdate: true });
    if (map.monsters && map.monsters.length > 0) {
      map.monsters.forEach(m => this.monsters.add(new Monster(this, m.x, m.y ?? GY - 40, this.player, m.type)));
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
      const mLevel = (m.cfg && m.cfg.level) ? m.cfg.level : 1;
      const gapMod = LEVEL.getLevelGapModifier ? LEVEL.getLevelGapModifier(this.xp.level, mLevel) : 1.0;
      const finalExp = Math.max(1, Math.round(m.exp * gapMod));
      this.xp.addExp(finalExp);

      const bonusLabel = (gapMod > 1.0) ? ' [도전 보너스!]' : (gapMod < 0.3 ? ' [저레벨 감쇄]' : '');
      this.combat.floatText(m.x, m.y - 30, `+${finalExp} EXP${bonusLabel}`, '#7ec8ff', 14);
      this.spawnPotions(m.x, m.y);

      // 보스 처치 특별 연출
      if (m.isBoss) {
        this.cameras.main.flash(400, 255, 215, 0);
        this.combat.floatText(this.player.x, this.player.y - 80, `★ [보스 토벌 성공] ${m.cfg.name}! ★`, '#ffd700', 22);
      }

      const respawnTime = m.cfg?.respawnMs || MONSTER.respawnMs;
      this.time.delayedCall(respawnTime, () => m.respawn());

      // [퀘스트 1]: 맵 1(초록 숲/map02)의 몬스터 30마리 처치 카운트
      if (this.maps.map.id === 'map02' && (this.quest.status === 'IN_PROGRESS' || this.quest.status === 'Q1_IN_PROGRESS')) {
        this.quest.kills = Math.min(this.quest.targetCount, this.quest.kills + 1);
        if (this.quest.kills >= this.quest.targetCount) {
          this.quest.status = 'READY_TO_COMPLETE';
          this.combat.floatText(this.player.x, this.player.y - 65, '★ [퀘스트 1 완료 가능] 마을의 장로 타키에게 보고하세요! ★', '#ffd32a', 18);
          this.cameras.main.flash(200, 255, 230, 100);
        } else {
          this.combat.floatText(m.x, m.y - 45, `퀘스트1: 초록 숲 몬스터 처치 (${this.quest.kills}/${this.quest.targetCount})`, '#1dd1a1', 14);
        }
      }

      // [퀘스트 2]: 버섯 50마리 처치 카운트 (버섯 군락지/map03 또는 몬스터 type === 'mushroom')
      if (this.quest.status === 'Q2_IN_PROGRESS') {
        const isMushroom = (m.type === 'mushroom' || this.maps.map.id === 'map03');
        if (isMushroom) {
          this.quest.kills = Math.min(this.quest.targetCount, this.quest.kills + 1);
          if (this.quest.kills >= this.quest.targetCount) {
            this.quest.status = 'Q2_READY';
            this.combat.floatText(this.player.x, this.player.y - 65, '★ [퀘스트 2 완료 가능] 장로 타키에게 보고하세요! ★', '#ffd32a', 18);
            this.cameras.main.flash(250, 255, 215, 0);
          } else {
            this.combat.floatText(m.x, m.y - 45, `퀘스트2: 버섯 처치 (${this.quest.kills}/${this.quest.targetCount})`, '#e056fd', 15);
          }
        }
      }
    });

    this.xp.on('levelup', lv => {
      this.player.applyLevelUp(lv);
      this.combat.floatText(this.player.x, this.player.y - 50, `★ LEVEL UP! Lv.${lv} ★`, '#ffe14d', 24);
      this.cameras.main.flash(200, 255, 230, 100);
      this.soundSpark(this.player.x, this.player.y);

      // 상단 바 및 현재 유저 세션 실시간 갱신
      if (window.currentUser) {
        window.currentUser.level = lv;
        const userNickDisplay = document.getElementById('userNickDisplay');
        if (userNickDisplay) {
          const titleStr = window.currentUser.title ? `[${window.currentUser.title}] ` : '';
          const classStr = this.player.characterClass === 'shadow_lord' ? ' (그림자군주)' : ' (시노비)';
          userNickDisplay.innerText = `${titleStr}${window.currentUser.nickname}${classStr} Lv.${lv}`;
        }
      }
      if (window.saveGameDataToServer) window.saveGameDataToServer(false);
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.hud = new HUD(this, map.name);

    // 로그인된 유저 데이터 처리: 첫 진입 시에만 loadUserData를 실행하고, 맵 전환 시에는 현재 세션(restoreState) 유지
    if (window.currentUser) {
      if (!this.registry.get('playerState')) {
        this.loadUserData(window.currentUser, false);
      } else {
        this.isGameActive = true;
        this.physics.resume();
        if (this.input.keyboard) this.input.keyboard.enabled = true;
      }
    }

    // 서버 DB 자동/수동 저장 인터페이스 등록
    window.saveGameDataToServer = async (showNotice = false) => {
      if (!window.currentUser || window.currentUser.username === 'guest') return false;
      const isChannel2 = (typeof window !== 'undefined' && window.currentChannel === 2);
      const charClass = isChannel2 ? 'shadow_lord' : (this.player.characterClass || 'shinobi');
      const payload = {
        username: window.currentUser.username,
        level: this.xp.level,
        exp: this.xp.exp,
        hp: this.player.hp,
        mp: this.player.mp,
        job_tier: this.player.jobTier,
        kills: this.kills,
        quest_status: this.quest.status,
        quest_kills: this.quest.kills,
        character_class: charClass
      };
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiBase = (typeof window.API_URL === 'string') ? window.API_URL : (isLocal ? 'http://127.0.0.1:8000' : '');
      // 서버 전송과 동시에 브라우저 로컬스토리지에도 이중 영구 보관 (Vercel 서버리스 초기화 완벽 대비)
      if (window.syncLocalProgress) {
        window.syncLocalProgress(payload);
      }
      try {
        const res = await fetch(`${apiBase}/api/save`, {
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
            const titleStr = window.currentUser.title ? `[${window.currentUser.title}] ` : '';
            const classStr = (charClass === 'shadow_lord') ? ' (그림자군주)' : ' (시노비)';
            userNickDisplay.innerText = `${titleStr}${window.currentUser.nickname}${classStr} Lv.${this.xp.level}`;
          }
          return true;
        }
      } catch (e) {
        console.error('Save to server error', e);
      }
      // 서버 전송이 일시 지연되더라도 로컬스토리지 백업이 성공했으므로 true 처리 가능
      if (showNotice && this.combat) {
        this.combat.floatText(this.player.x, this.player.y - 45, '로컬 안전 저장 완료!', '#1dd1a1', 16);
      }
      return true;

      return false;
    };

    this.maps.enter();
  }

  loadUserData(user, showNotice = true) {
    if (!user) return;
    this.isGameActive = true;
    this.physics.resume();
    if (this.input.keyboard) {
      this.input.keyboard.enabled = true;
      this.input.keyboard.preventDefault = false;
      this.input.keyboard.clearCaptures();
    }

    this.xp.level = user.level || 1;
    this.xp.exp = user.exp || 0;
    this.player.applyLevelUp(this.xp.level);
    // 채널 1: 시노비, 채널 2: 그림자 군주
    const isChannel2 = (typeof window !== 'undefined' && window.currentChannel === 2);
    const targetClass = isChannel2 ? 'shadow_lord' : 'shinobi';
    this.player.characterClass = targetClass;
    if (user.job_tier) this.player.setJobTier(user.job_tier);
    this.player.hp = Phaser.Math.Clamp(user.hp || this.player.maxHp, 1, this.player.maxHp);
    this.player.mp = Phaser.Math.Clamp(user.mp || this.player.maxMp, 0, this.player.maxMp);
    if (user.quest_status) this.quest.status = user.quest_status;
    if (user.quest_kills !== undefined) this.quest.kills = user.quest_kills;
    if (this.quest.status && this.quest.status.startsWith('Q2_')) {
      this.quest.id = 'quest2';
      this.quest.title = '버섯 50마리 처치';
      this.quest.targetCount = 50;
      this.quest.targetMap = 'map03';
    } else {
      this.quest.id = 'quest1';
      this.quest.title = '초록 숲 몬스터 30마리 처치';
      this.quest.targetCount = 30;
      this.quest.targetMap = 'map02';
    }

    // 메이플 감성 커스텀 외형 (닉네임, 칭호, 도복 색상, 주무기, 직업) 적용
    if (this.player && this.player.setCustomAppearance) {
      this.player.setCustomAppearance(
        user.nickname,
        user.title,
        user.color_theme || user.colorTheme || (targetClass === 'shadow_lord' ? 'purple' : 'default'),
        targetClass === 'shadow_lord' ? 'shadow_armory' : (user.selected_weapon || 'shuriken'),
        targetClass
      );
    }

    this.updateQuestBubble();
    if (showNotice && this.combat) {
      const titleStr = user.title ? `[${user.title}] ` : '';
      this.combat.floatText(this.player.x, this.player.y - 65, `★ ${titleStr}${user.nickname} 접속 완료! ★`, '#ffd32a', 20);
    }
    // 퀘스트 1 오픈 안내
    if (this.quest.status === 'NOT_STARTED' && this.combat) {
      this.time.delayedCall(800, () => {
        if (this.combat && this.player) {
          this.combat.floatText(this.player.x, this.player.y - 50, '★ [퀘스트 1 오픈!] 마을 좌측의 [장로 타키]에게 대화하세요! ★', '#55efc4', 16);
        }
      });
    }
  }

  // 마을 NPC 및 퀘스트 대화 인터랙션 설정 (복수 NPC 지원)
  setupNPC(map) {
    this.npcs = [];
    this.currentDialogNPC = null;
    this.questDialogUI = null;
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (this.input.keyboard) {
      this.input.keyboard.preventDefault = false;
      this.input.keyboard.clearCaptures();
    }

    if (map.npcs && map.npcs.length > 0) {
      const GY = GAME.groundY;

      map.npcs.forEach(npcData => {
        const texKey = npcData.texture || (npcData.id === 'researcher' ? 'npc_researcher' : 'npc_elder');

        // NPC 스프라이트
        const npcSprite = this.add.sprite(npcData.x, GY - 36, texKey).setDepth(9);
        npcSprite.setInteractive({ cursor: 'pointer' });

        // NPC 정보 객체
        const npcObj = {
          id: npcData.id,
          name: npcData.name,
          title: npcData.title || (npcData.id === 'researcher' ? '버섯 연구원' : '마을 장로'),
          role: npcData.role || (npcData.id === 'researcher' ? 'quest2' : 'quest1'),
          texture: texKey,
          x: npcData.x,
          sprite: npcSprite,
          bubble: null,
          prompt: null
        };

        npcSprite.on('pointerdown', () => this.interactWithNPC(npcObj));

        // NPC 이름표
        this.add.text(npcData.x, GY - 78, `[${npcObj.title}] ${npcData.name}`, {
          fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px',
          color: npcObj.id === 'researcher' ? '#55efc4' : '#ffeaa7',
          stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);

        // 머리 위 퀘스트 말풍선 아이콘
        const bubble = this.add.sprite(npcData.x, GY - 98, 'quest_icon_start').setDepth(11);
        this.tweens.add({
          targets: bubble,
          y: GY - 105,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        npcObj.bubble = bubble;

        // 대화 상호작용 안내 텍스트
        const prompt = this.add.text(npcData.x, GY - 128, 'Space: 대화하기', {
          fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px',
          color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(12).setVisible(false);
        npcObj.prompt = prompt;

        this.npcs.push(npcObj);
      });

      this.updateQuestBubble();
    }
  }

  updateQuestBubble() {
    if (!this.npcs || this.npcs.length === 0) return;
    const st = this.quest.status;

    this.npcs.forEach(npc => {
      if (!npc.bubble) return;
      if (npc.role === 'quest1') {
        // [장로 타키]: 퀘스트 1 담당
        if (st === 'NOT_STARTED') {
          npc.bubble.setTexture('quest_icon_start').setVisible(true).setTint(0xffffff);
        } else if (st === 'IN_PROGRESS' || st === 'Q1_IN_PROGRESS') {
          npc.bubble.setTexture('quest_icon_ing').setVisible(true).setTint(0xffffff);
        } else if (st === 'READY_TO_COMPLETE') {
          npc.bubble.setTexture('quest_icon_ready').setVisible(true).setTint(0xffd32a);
        } else {
          // 퀘스트 1 완료 후에는 타키 머리 위 아이콘 숨김
          npc.bubble.setVisible(false);
        }
      } else if (npc.role === 'quest2') {
        // [학자 포포]: 퀘스트 2 담당
        if (st === 'COMPLETED' || st === 'Q1_COMPLETED' || st === 'Q2_NOT_STARTED') {
          // 퀘스트 1을 깬 뒤 퀘스트 2 시작 가능 느낌표!
          npc.bubble.setTexture('quest_icon_start').setVisible(true).setTint(0xffffff);
        } else if (st === 'Q2_IN_PROGRESS') {
          npc.bubble.setTexture('quest_icon_ing').setVisible(true).setTint(0xffffff);
        } else if (st === 'Q2_READY') {
          npc.bubble.setTexture('quest_icon_ready').setVisible(true).setTint(0xffd32a);
        } else {
          // 퀘스트 1 이전이거나 퀘스트 2 완료 후에는 숨김
          npc.bubble.setVisible(false);
        }
      }
    });
  }

  interactWithNPC(targetNpc = null) {
    if (this.questDialogUI) {
      this.advanceQuestDialog();
      return;
    }
    const npc = targetNpc || (this.npcs && this.npcs[0]);
    if (npc) this.openQuestDialog(npc);
  }

  openQuestDialog(npc) {
    if (this.questDialogUI) return;
    this.currentDialogNPC = npc;
    const s = this;
    const width = 560, height = 230;
    const cx = GAME.width / 2, cy = GAME.height / 2;

    const container = s.add.container(0, 0).setScrollFactor(0).setDepth(200);

    // 반투명 배경 패널
    const bg = s.add.rectangle(cx, cy, width, height, 0x111625, 0.94)
      .setStrokeStyle(3, npc.id === 'researcher' ? 0x1dd1a1 : 0xf1c40f)
      .setInteractive();

    // NPC 일러스트/아이콘 박스
    const portraitBg = s.add.rectangle(cx - 195, cy, 96, 156, 0x222f3e, 0.85).setStrokeStyle(2, 0x747d8c);
    const portrait = s.add.sprite(cx - 195, cy + 10, npc.texture || 'npc_elder').setScale(1.3);
    const nameLabel = s.add.text(cx - 195, cy - 65, npc.name, {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px', fontStyle: 'bold',
      color: npc.id === 'researcher' ? '#55efc4' : '#ffd166',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    // 퀘스트 대화 텍스트 생성
    let titleStr = '';
    let bodyStr = '';
    let btnStr = '';

    const st = this.quest.status;

    if (npc.role === 'quest1') {
      // ==========================================
      // [NPC 1: 장로 타키] - 퀘스트 1 전담
      // ==========================================
      if (st === 'NOT_STARTED') {
        titleStr = '📜 [퀘스트 1] 초록 숲 정화 요청';
        bodyStr = '안녕하신가, 모험가여!\n마을 밖 [초록 숲](맵 1)에 몬스터들이 급증하여\n마을 주민들이 큰 불안에 떨고 있네.\n\n초록 숲으로 가서 몬스터 30마리를 처치해주겠는가?';
        btnStr = '[Space 또는 클릭]: 퀘스트 1 수락';
      } else if (st === 'IN_PROGRESS' || st === 'Q1_IN_PROGRESS') {
        titleStr = '📜 [퀘스트 1] 초록 숲 정화 진행 중';
        bodyStr = `아직 초록 숲에 몬스터들이 남아있네.\n\n현재 처치 상황: (${this.quest.kills} / ${this.quest.targetCount} 마리)\n초록 숲(오른쪽 포탈)으로 가서 30마리를 모두 소탕해주게나!`;
        btnStr = '[Space 또는 클릭]: 확인';
      } else if (st === 'READY_TO_COMPLETE') {
        titleStr = '🎉 [퀘스트 1] 초록 숲 정화 완료!';
        bodyStr = '오오! 초록 숲의 몬스터 30마리를 모두 소탕해주었군!\n자네의 눈부신 활약 덕분에 마을에 평화가 찾아왔네.\n\n★ 보상: 경험치 +350 EXP, 체력/마나 회복';
        btnStr = '[Space 또는 클릭]: 보상 받기';
      } else {
        titleStr = '📜 [장로 타키] 감사의 인사';
        bodyStr = '초록 숲을 무사히 지켜주어 고맙네!\n버섯 군락지의 일은 마을 우측에 있는 [학자 포포]에게 가보게나.\n자네의 도움이 절실히 필요한 모양일세!';
        btnStr = '[Space 또는 클릭]: 닫기';
      }
    } else {
      // ==========================================
      // [NPC 2: 학자 포포] - 퀘스트 2 전담
      // ==========================================
      if (st === 'NOT_STARTED' || st === 'IN_PROGRESS' || st === 'Q1_IN_PROGRESS' || st === 'READY_TO_COMPLETE') {
        titleStr = '🔬 [학자 포포] 포자 연구 중';
        bodyStr = '안녕하세요! 저는 버섯 포자를 연구하는 학자 포포예요.\n지금 마을 밖 초록 숲이 소란스러워 위험하답니다.\n먼저 [장로 타키] 님의 초록 숲 정화 의뢰를 완료해 주세요!';
        btnStr = '[Space 또는 클릭]: 알겠습니다';
      } else if (st === 'COMPLETED' || st === 'Q1_COMPLETED' || st === 'Q2_NOT_STARTED') {
        titleStr = '📜 [퀘스트 2] 버섯 군락지 정벌 요청';
        bodyStr = '초록 숲을 구해주신 영웅님이시군요! 정말 감사해요!\n하지만 그 너머 [버섯 군락지](맵 2)에서 거대한 버섯 몬스터들이\n위험한 유독 포자를 마구 뿜어내고 있어요!\n\n버섯 군락지로 가서 버섯 50마리를 퇴치해주시겠어요?';
        btnStr = '[Space 또는 클릭]: 퀘스트 2 수락 (버섯 50마리)';
      } else if (st === 'Q2_IN_PROGRESS') {
        titleStr = '📜 [퀘스트 2] 버섯 50마리 처치 진행 중';
        bodyStr = `버섯 군락지(초록 숲 오른쪽 포탈 너머)에서\n버섯 몬스터 50마리를 소탕해 주세요!\n\n현재 버섯 처치: (${this.quest.kills} / 50 마리)`;
        btnStr = '[Space 또는 클릭]: 확인';
      } else if (st === 'Q2_READY') {
        titleStr = '🎉 [퀘스트 2] 버섯 50마리 처치 완료!';
        bodyStr = '와아! 사나운 버섯 50마리를 전부 소탕해주셨군요!\n덕분에 마음 놓고 포자 표본을 연구할 수 있게 되었어요!\n\n★ 보상: 대량 경험치 +800 EXP, 체력/마나 완충';
        btnStr = '[Space 또는 클릭]: 보상 받기';
      } else {
        titleStr = '🔬 [학자 포포] 연구 성공!';
        bodyStr = '영웅님 덕분에 마을도 안전해지고 연구도 대성공이에요!\n언제든 마을에 들러 쉬어가세요!';
        btnStr = '[Space 또는 클릭]: 닫기';
      }
    }

    const titleText = s.add.text(cx - 125, cy - 85, titleStr, {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '15px', fontStyle: 'bold',
      color: npc.id === 'researcher' ? '#55efc4' : '#ffd32a', stroke: '#000', strokeThickness: 3
    });

    const bodyText = s.add.text(cx - 125, cy - 55, bodyStr, {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '13px', color: '#ffffff', stroke: '#000', strokeThickness: 2, lineSpacing: 5
    });

    const btnText = s.add.text(cx + 60, cy + 78, btnStr, {
      fontFamily: '"Malgun Gothic", sans-serif', fontSize: '14px', fontStyle: 'bold',
      color: npc.id === 'researcher' ? '#1dd1a1' : '#f1c40f', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    container.add([bg, portraitBg, portrait, nameLabel, titleText, bodyText, btnText]);

    bg.on('pointerdown', () => this.advanceQuestDialog());
    this.questDialogUI = container;
  }

  advanceQuestDialog() {
    if (!this.questDialogUI) return;
    const st = this.quest.status;
    const npc = this.currentDialogNPC;

    if (npc && npc.role === 'quest1') {
      // 장로 타키: 퀘스트 1 처리
      if (st === 'NOT_STARTED') {
        this.quest.id = 'quest1';
        this.quest.title = '초록 숲 몬스터 30마리 처치';
        this.quest.status = 'IN_PROGRESS';
        this.quest.targetCount = 30;
        this.quest.targetMap = 'map02';
        this.quest.kills = 0;
        this.combat.floatText(this.player.x, this.player.y - 50, '★ [장로 타키] 퀘스트 1 수락: 초록 숲 30마리 처치! ★', '#1dd1a1', 16);
        this.soundSpark(this.player.x, this.player.y);
        if (window.saveGameDataToServer) window.saveGameDataToServer(false);
      } else if (st === 'READY_TO_COMPLETE') {
        this.quest.status = 'Q2_NOT_STARTED';
        this.quest.kills = 0;
        this.xp.addExp(350);
        this.player.healHp(this.player.maxHp);
        this.player.healMp(this.player.maxMp);
        this.combat.floatText(this.player.x, this.player.y - 50, '★ [퀘스트 1 완료!] +350 EXP ➔ [학자 포포]에게 퀘스트 2를 받으세요! ★', '#ffd32a', 17);
        this.cameras.main.flash(300, 255, 215, 0);
        this.soundSpark(this.player.x, this.player.y);
        if (window.saveGameDataToServer) window.saveGameDataToServer(false);
      }
    } else if (npc && npc.role === 'quest2') {
      // 학자 포포: 퀘스트 2 처리
      if (st === 'COMPLETED' || st === 'Q1_COMPLETED' || st === 'Q2_NOT_STARTED') {
        this.quest.id = 'quest2';
        this.quest.title = '버섯 50마리 처치';
        this.quest.status = 'Q2_IN_PROGRESS';
        this.quest.targetCount = 50;
        this.quest.targetMap = 'map03';
        this.quest.kills = 0;
        this.combat.floatText(this.player.x, this.player.y - 50, '★ [학자 포포] 퀘스트 2 수락: 버섯 50마리 처치 시작! ★', '#e056fd', 17);
        this.soundSpark(this.player.x, this.player.y);
        if (window.saveGameDataToServer) window.saveGameDataToServer(false);
      } else if (st === 'Q2_READY') {
        this.quest.status = 'Q2_COMPLETED';
        this.xp.addExp(800);
        this.player.healHp(this.player.maxHp);
        this.player.healMp(this.player.maxMp);
        this.combat.floatText(this.player.x, this.player.y - 50, '★ [퀘스트 2 정벌 완료!] +800 EXP & HP/MP 회복 ★', '#ffd32a', 20);
        this.cameras.main.flash(400, 255, 215, 0);
        this.soundSpark(this.player.x, this.player.y);
        if (window.saveGameDataToServer) window.saveGameDataToServer(false);
      }
    }

    this.updateQuestBubble();
    this.closeQuestDialog();
  }

  closeQuestDialog() {
    if (this.questDialogUI) {
      this.questDialogUI.destroy();
      this.questDialogUI = null;
    }
    this.currentDialogNPC = null;
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

    // NPC 상호작용 체크 (마을 복수 NPC 지원)
    if (this.npcs && this.npcs.length > 0) {
      let nearestNpc = null;
      let minDist = 9999;

      this.npcs.forEach(npc => {
        const dist = Math.abs(p.x - npc.x);
        if (dist < 75 && dist < minDist) {
          minDist = dist;
          nearestNpc = npc;
        }
        if (npc.prompt) npc.prompt.setVisible(false);
      });

      if (nearestNpc && !p.isDead) {
        if (nearestNpc.prompt) nearestNpc.prompt.setVisible(!this.questDialogUI);
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.interactWithNPC(nearestNpc);
        }
      } else if (this.questDialogUI && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.advanceQuestDialog();
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
