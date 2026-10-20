import { GAME } from '../config/gameConfig.js';

export default class HUD {
  constructor(scene, mapName = '') {
    const st = { fontFamily: '"Malgun Gothic","Apple SD Gothic Neo",sans-serif', fontSize: '14px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3 };
    const fix = o => o.setScrollFactor(0).setDepth(100);
    const BW = 230;
    this.BW = BW;

    fix(scene.add.rectangle(10, 10, 275, 146, 0x000000, 0.65).setOrigin(0));
    this.tierBadge = fix(scene.add.text(20, 13, '', { ...st, fontSize: '16px', color: '#00d2d3', fontStyle: 'bold' }));
    this.lv = fix(scene.add.text(190, 13, '', { ...st, fontSize: '16px', color: '#ffd166' }));

    // HP Bar
    fix(scene.add.rectangle(20, 38, BW, 13, 0x400000).setOrigin(0));
    this.hpBar = fix(scene.add.rectangle(20, 38, BW, 13, 0xe74c3c).setOrigin(0));
    this.hpText = fix(scene.add.text(24, 38, '', { ...st, fontSize: '10px', strokeThickness: 2 }));

    // MP Bar
    fix(scene.add.rectangle(20, 56, BW, 13, 0x0d2137).setOrigin(0));
    this.mpBar = fix(scene.add.rectangle(20, 56, BW, 13, 0x3498db).setOrigin(0));
    this.mpText = fix(scene.add.text(24, 56, '', { ...st, fontSize: '10px', strokeThickness: 2 }));

    // EXP Bar
    fix(scene.add.rectangle(20, 74, BW, 11, 0x1c2833).setOrigin(0));
    this.expBar = fix(scene.add.rectangle(20, 74, BW, 11, 0x2ecc71).setOrigin(0));
    this.expText = fix(scene.add.text(24, 73, '', { ...st, fontSize: '9px', strokeThickness: 2 }));

    // 스킬 슬롯 및 2차 10초 쿨타임 상태 표시줄
    this.skillStatus = fix(scene.add.text(20, 93, '', { ...st, fontSize: '11px', color: '#ffd32a' }));
    this.weaponStatus = fix(scene.add.text(20, 109, '', { ...st, fontSize: '11px', color: '#7ee8fa' }));
    this.telekenesisBadge = fix(scene.add.text(20, 125, '', { ...st, fontSize: '11px', color: '#ff9f43' }));

    this.kills = fix(scene.add.text(GAME.width - 12, 38, '', st).setOrigin(1, 0));
    fix(scene.add.text(GAME.width - 12, 12, `📍 ${mapName}`, { ...st, fontSize: '16px', color: '#ffe082' }).setOrigin(1, 0));

    // 우측 퀘스트 상태 창
    fix(scene.add.rectangle(GAME.width - 12, 60, 240, 48, 0x000000, 0.65).setOrigin(1, 0));
    this.questTitle = fix(scene.add.text(GAME.width - 20, 64, '', { ...st, fontSize: '11px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(1, 0));
    this.questProgress = fix(scene.add.text(GAME.width - 20, 82, '', { ...st, fontSize: '11px', color: '#55efc4' }).setOrigin(1, 0));
    
    this.guideText = fix(scene.add.text(12, GAME.height - 24, '[1/2/3]: 시노비 전직(1차~3차) | [Ctrl]: 공격 | [C]: 무기전환 | [A]: 바람스킬 | [Space]: 대화', { ...st, fontSize: '12px', color: '#f1f2f6' }));
    
    this.death = fix(scene.add.text(GAME.width / 2, GAME.height / 2, '쓰러졌습니다\n잠시 후 부활합니다',
      { ...st, fontSize: '32px', align: 'center', color: '#ff6b6b' }).setOrigin(0.5)).setVisible(false);
  }

  update(player, xp, kills, quest = null) {
    if (!window.currentUser || !player.scene.isGameActive) {
      this.tierBadge.setText('🔒 로그인 대기 중').setColor('#ff6b6b');
      this.lv.setText('Lv.--');
      this.skillStatus.setText('로그인해야 캐릭터 스킬과 게임이 작동합니다').setColor('#ff9f43');
      this.weaponStatus.setText('회원가입 또는 로그인 후 플레이하세요').setColor('#c8d6e5');
      this.telekenesisBadge.setText('※ 화면 중앙의 창에서 로그인해주세요').setColor('#ffd32a');
      this.questTitle.setText('🔒 로그인 필요').setColor('#ff6b6b');
      this.questProgress.setText('로그인 후 퀘스트 이용 가능').setColor('#dfe6e9');
      return;
    }

    const tier = player.jobTier || 1;
    const isShadow = player.characterClass === 'shadow_lord';

    let tierName = '';
    let tierColor = '#00d2d3';

    if (isShadow) {
      if (tier === 1) {
        tierName = `👑 [견습 그림자 검사] (Lv.1~29, 최대 2인 타격)`;
        tierColor = '#a55eea';
      } else if (tier === 2) {
        tierName = `👑 [1차: 그림자 추적자] (Lv.30~69, 단검+사슬낫, 최대 4인)`;
        tierColor = '#00d2d3';
      } else if (tier === 3) {
        tierName = `👑 [2차: 그림자 지휘관] (Lv.70~109, 대검+창, 최대 5인)`;
        tierColor = '#feca57';
      } else {
        tierName = `👑 [3차: 그림자 군주] (Lv.110~120, 언월도+도끼, 최대 6인)`;
        tierColor = '#ff4757';
      }
    } else {
      if (tier === 1) {
        tierName = `견습 시노비 (Lv.1~29, 최대 2인 타격)`;
        tierColor = '#a4b0be';
      } else if (tier === 2) {
        tierName = `1차: 정식 시노비 (Lv.30~69, 표창+쿠나이, 최대 4인)`;
        tierColor = '#00d2d3';
      } else if (tier === 3) {
        tierName = `2차: 듀얼시노비 (Lv.70~109, 바람스킬, 최대 5인)`;
        tierColor = '#feca57';
      } else {
        tierName = `3차: 풍마대장군 (Lv.110~120, 대형풍마, 최대 6인)`;
        tierColor = '#ff4757';
      }
    }

    this.tierBadge.setText(tierName).setColor(tierColor);

    this.lv.setText(`Lv.${xp.level}`);
    this.hpBar.setSize(this.BW * Math.max(0, player.hp / player.maxHp), 13);
    this.hpText.setText(`HP ${player.hp} / ${player.maxHp}`);
    this.mpBar.setSize(this.BW * Math.max(0, player.mp / player.maxMp), 13);
    this.mpText.setText(`MP ${player.mp} / ${player.maxMp}`);
    const ratio = xp.isMax ? 1 : xp.exp / xp.required;
    this.expBar.setSize(this.BW * ratio, 11);
    this.expText.setText(xp.isMax ? 'EXP MAX' : `EXP ${xp.exp} / ${xp.required}`);
    this.kills.setText(`누적 처치 ${kills}`);
    this.death.setVisible(player.isDead);

    // 퀘스트 상태 표시 (퀘스트 1 & 퀘스트 2)
    if (quest) {
      const st = quest.status;
      if (st === 'NOT_STARTED') {
        this.questTitle.setText('📜 [퀘스트 1] 초록 숲 정화').setColor('#ffd166');
        this.questProgress.setText('마을 [장로 타키]에게 대화 [Space]').setColor('#dfe6e9');
      } else if (st === 'IN_PROGRESS' || st === 'Q1_IN_PROGRESS') {
        this.questTitle.setText('📜 [퀘스트 1] 초록 숲 정화').setColor('#ffd166');
        this.questProgress.setText(`초록 숲 몬스터 처치: [${quest.kills} / ${quest.targetCount || 30}]`).setColor('#1dd1a1');
      } else if (st === 'READY_TO_COMPLETE') {
        this.questTitle.setText('🎉 [퀘스트 1] 30마리 완료!').setColor('#ff9f43');
        this.questProgress.setText('★ 마을 [장로 타키]에게 보고! ★').setColor('#ffd32a');
      } else if (st === 'COMPLETED' || st === 'Q1_COMPLETED' || st === 'Q2_NOT_STARTED') {
        this.questTitle.setText('📜 [퀘스트 2] 버섯 군락지 대기').setColor('#ffd166');
        this.questProgress.setText('마을 [장로 타키]에게 대화 [Space]').setColor('#a29bfe');
      } else if (st === 'Q2_IN_PROGRESS') {
        this.questTitle.setText('📜 [퀘스트 2] 버섯 50마리 처치').setColor('#e056fd');
        this.questProgress.setText(`버섯 처치: [${quest.kills} / 50]`).setColor('#55efc4');
      } else if (st === 'Q2_READY') {
        this.questTitle.setText('🎉 [퀘스트 2] 50마리 완료!').setColor('#ff9f43');
        this.questProgress.setText('★ 마을 [장로 타키]에게 보고! ★').setColor('#ffd32a');
      } else if (st === 'Q2_COMPLETED') {
        this.questTitle.setText('✔ [퀘스트 2] 버섯 퇴치 완료').setColor('#70a1ff');
        this.questProgress.setText('모든 퀘스트 정복 완료 (+800 EXP)').setColor('#a4b0be');
      }
    }

    const now = player.scene.time.now;

    if (isShadow) {
      this.guideText.setText('[1/2/3]: 군주 전직(1~3차) | [Ctrl]: 분신백병전 | [A]: 사슬낫견인 | [S]: 강타 | [R]: 필살기 묵영섬멸진 | [Space]: 대화');
      // 그림자 군주 스킬 및 무기 상태 표출
      let ultCooldownStr = 'READY';
      if (now < player.shadowUltCooldownUntil) {
        const sec = ((player.shadowUltCooldownUntil - now) / 1000).toFixed(0);
        ultCooldownStr = `${sec}s`;
      }

      let aSkillCd = 'READY';
      if (now < player.skill2CooldownUntil) {
        const sec = ((player.skill2CooldownUntil - now) / 1000).toFixed(1);
        aSkillCd = `${sec}s`;
      }

      const cloneCounts = [0, 0, 2, 4, 6][tier] || (tier >= 3 ? 6 : 0);
      const ultColor = ultCooldownStr === 'READY' ? '#ffd32a' : '#ff6b6b';

      this.skillStatus.setText(`[Ctrl] 분신백병전 | [A] 견인스킬: ${aSkillCd} | [S] 강타스킬 | [R] 필살기: ${ultCooldownStr}`).setColor(ultColor);
      this.weaponStatus.setText(`편제: ${cloneCounts}인 분신 협공 | [2채널: 그림자 군주] | 타깃제한: ${[0, 2, 4, 5, 6][tier] || 6}명`).setColor('#e056fd');
      this.telekenesisBadge.setText(`⚔️ [그림자 군주 OS]: 원거리 투사체 배제 · 6종 근접 무기 분신 편제 협공 ([R] 육익 섬멸진)`).setColor('#a55eea').setVisible(true);
    } else {
      this.guideText.setText('[1/2/3]: 시노비 전직(1~3차) | [Ctrl]: 공격 | [C]: 무기전환 | [A]: 바람스킬 | [Space]: 대화');
      // 기존 시노비 모드
      const activeWeapons = player.scene.combat.getActiveWeapons();
      const pinnedWeapons = player.scene.combat.getPinnedWeapons();

      let windCooldownStr = 'READY';
      if (now < player.skill2CooldownUntil) {
        const sec = ((player.skill2CooldownUntil - now) / 1000).toFixed(1);
        windCooldownStr = `${sec}s`;
      }

      if (tier === 1) {
        this.skillStatus.setText('[Ctrl] 1차 표창 (2명 이하 타격) | [1채널: 시노비]').setColor('#00d2d3');
        this.weaponStatus.setText(`무기: [표창 전용] | 공중: ${activeWeapons.length}개 | 회수: Z`).setColor('#7ee8fa');
      } else if (tier === 2) {
        const cdColor = windCooldownStr === 'READY' ? '#1dd1a1' : '#ff6b6b';
        this.skillStatus.setText(`[Ctrl] 3명타격(꽂힘) | [A] 바람스킬(4명): ${windCooldownStr}`).setColor(cdColor);
        const wName = player.selectedWeapon === 'kunai' ? '쿠나이' : '표창';
        this.weaponStatus.setText(`[C] ${wName} | 몬스터 꽂힘: ${pinnedWeapons.length}개 | 회수: Z`).setColor('#feca57');
      } else {
        this.skillStatus.setText('[Ctrl/S] 거대 쿠나이 & 풍마표창 | [A] 바람스킬(쿨10초)').setColor('#ff4757');
        this.weaponStatus.setText(`무기: [3차 거대무기] | 꽂힘: ${pinnedWeapons.length}개 | 회수: Z`).setColor('#ffd32a');
      }

      if (player.isTelekinesisMode) {
        this.telekenesisBadge.setText(`🌀 [염동력 집중: 전 무기 ${activeWeapons.length}기 동시 궤적 제어]`).setColor('#00ffff').setVisible(true);
      } else {
        if (pinnedWeapons.length > 0) {
          this.telekenesisBadge.setText(`몬스터에 무기 ${pinnedWeapons.length}개 꽂힘! (Z 누르면 뽑아서 회수)`).setColor('#ffd32a').setVisible(true);
        } else if (activeWeapons.length > 0) {
          this.telekenesisBadge.setText(`공중 무기 ${activeWeapons.length}기 대기 중 (Shift 누르면 조종, Z 회수)`).setColor('#7ee8fa').setVisible(true);
        } else {
          this.telekenesisBadge.setText('전직: 1차(Lv.30) ➔ 2차(Lv.70) ➔ 3차(Lv.110) [단축키: 1/2/3/4]').setColor('#a4b0be').setVisible(true);
        }
      }
    }
  }
}
