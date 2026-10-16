import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    const tex = (key, w, h, draw) => { gfx.clear(); draw(gfx); gfx.generateTexture(key, w, h); };

    // 메이플스토리 스타일 SD 플레이어 (56 x 72)
    tex('player', 56, 72, g => {
      // 망토 / 스카프 뒷자락
      g.fillStyle(0xd63031).fillTriangle(14, 38, 4, 62, 22, 54);

      // 다리 & 신발
      g.fillStyle(0x2d3436).fillRoundedRect(16, 56, 10, 14, 3);
      g.fillStyle(0x2d3436).fillRoundedRect(30, 56, 10, 14, 3);
      g.fillStyle(0x636e72).fillRect(14, 66, 13, 5).fillRect(29, 66, 13, 5);

      // 상체 몸통 & 옷
      g.fillStyle(0x2c3e50).fillRoundedRect(16, 36, 24, 23, 4);
      // 벨트 & 버클
      g.fillStyle(0x8395a7).fillRect(16, 52, 24, 4);
      g.fillStyle(0xf1c40f).fillRect(26, 51, 5, 6);

      // 머리카락 (뒷머리)
      g.fillStyle(0x2c2c54).fillCircle(28, 22, 21);

      // 얼굴 (피부)
      g.fillStyle(0xffdfba).fillRoundedRect(11, 14, 34, 25, 9);
      // 볼터치
      g.fillStyle(0xff7675, 0.4).fillCircle(16, 27, 4).fillCircle(40, 27, 4);

      // 눈 (메이플 스타일 크고 맑은 눈)
      g.fillStyle(0x1e272e).fillRoundedRect(19, 21, 6, 8, 2);
      g.fillStyle(0x1e272e).fillRoundedRect(32, 21, 6, 8, 2);
      // 눈동자 하이라이트 (초롱초롱)
      g.fillStyle(0xffffff).fillCircle(21, 23, 1.8).fillCircle(34, 23, 1.8);
      g.fillStyle(0x00d2d3).fillRect(20, 26, 4, 2).fillRect(33, 26, 4, 2);

      // 앞머리 & 도적 헤어밴드
      g.fillStyle(0x341f97).fillRoundedRect(10, 8, 36, 10, 3);
      g.fillStyle(0xff4757).fillRect(10, 13, 36, 3); // 붉은 띠
      g.fillStyle(0xf1c40f).fillCircle(28, 14, 3);   // 중앙 금빛 장식
      g.fillStyle(0x2c2c54).fillTriangle(13, 15, 18, 24, 22, 16);
      g.fillStyle(0x2c2c54).fillTriangle(24, 16, 29, 23, 34, 16);
      g.fillStyle(0x2c2c54).fillTriangle(35, 16, 40, 24, 44, 15);

      // 앞쪽 펄럭이는 붉은 머플러/스카프
      g.fillStyle(0xff4757).fillRoundedRect(14, 33, 28, 8, 4);
      g.fillStyle(0xd63031).fillTriangle(34, 37, 46, 48, 38, 52);
    });

    // 메이플 몬스터 스타일 젤리/버섯 몬스터 (62 x 54)
    tex('monster', 62, 54, g => {
      // 그림자
      g.fillStyle(0x000000, 0.25).fillEllipse(31, 50, 48, 8);
      // 몬스터 본체 (귀여운 포동포동 슬라임/몬스터)
      g.fillStyle(0x8e44ad).fillRoundedRect(5, 10, 52, 40, { tl: 26, tr: 26, bl: 14, br: 14 });
      g.fillStyle(0x9b59b6).fillRoundedRect(8, 13, 46, 34, { tl: 22, tr: 22, bl: 10, br: 10 });
      // 광택 하이라이트
      g.fillStyle(0xffffff, 0.4).fillCircle(20, 18, 5).fillCircle(15, 23, 2.5);

      // 크고 귀여운 눈
      g.fillStyle(0xffffff).fillCircle(22, 28, 8).fillCircle(40, 28, 8);
      g.fillStyle(0x2c3e50).fillCircle(23, 28, 4.5).fillCircle(39, 28, 4.5);
      g.fillStyle(0xffffff).fillCircle(22, 26, 2).fillCircle(38, 26, 2);
      // 앙증맞은 볼터치
      g.fillStyle(0xf368e0, 0.6).fillCircle(15, 36, 4).fillCircle(47, 36, 4);
      // 입
      g.fillStyle(0x2c2c54).fillCircle(31, 35, 3);
      g.fillStyle(0xff6b81).fillCircle(31, 36, 2);
      // 이마 뿔 장식
      g.fillStyle(0xf1c40f).fillTriangle(31, 1, 26, 12, 36, 12);
    });

    // 메이플스토리 뇌전/일비 표창 스타일 (44 x 44)
    tex('shuriken', 44, 44, g => {
      const cx = 22, cy = 22;
      // 푸른 번개 오라 글로우 (바깥쪽)
      g.fillStyle(0x00d2d3, 0.35).fillCircle(cx, cy, 21);
      g.fillStyle(0x54a0ff, 0.55).fillCircle(cx, cy, 17);

      // 날카로운 4날 표창 블레이드 (메탈릭 다크 실버)
      g.fillStyle(0x10ac84).fillPoints([
        { x: cx, y: 1 }, { x: cx + 7, y: cy - 7 },
        { x: 43, y: cy }, { x: cx + 7, y: cy + 7 },
        { x: cx, y: 43 }, { x: cx - 7, y: cy + 7 },
        { x: 1, y: cy }, { x: cx - 7, y: cy - 7 }
      ], true);

      // 내부 날카로운 실버 칼날
      g.fillStyle(0xf5f6fa).fillPoints([
        { x: cx, y: 4 }, { x: cx + 4, y: cy - 4 },
        { x: 40, y: cy }, { x: cx + 4, y: cy + 4 },
        { x: cx, y: 40 }, { x: cx - 4, y: cy + 4 },
        { x: 4, y: cy }, { x: cx - 4, y: cy - 4 }
      ], true);

      // 중앙 엠블럼 코어 (골드 + 시안 코어)
      g.fillStyle(0xf1c40f).fillCircle(cx, cy, 7);
      g.fillStyle(0x00cec9).fillCircle(cx, cy, 4.5);
      g.fillStyle(0xffffff).fillCircle(cx - 1, cy - 1, 2);
    });

    // 묵직한 닌자 쿠나이 단검 (48 x 48)
    tex('kunai', 48, 48, g => {
      const cx = 24, cy = 24;
      // 붉은 염동력 오라 글로우
      g.fillStyle(0xff4757, 0.35).fillCircle(cx, cy, 22);

      // 손잡이 고리 (링)
      g.lineStyle(3, 0x747d8c).strokeCircle(8, cy, 5);

      // 손잡이 그립 (붕대 감긴 느낌)
      g.fillStyle(0xdcdde1).fillRect(12, cy - 3, 10, 6);
      g.fillStyle(0x2f3542).fillRect(14, cy - 3, 2, 6).fillRect(18, cy - 3, 2, 6);

      // 가드 (코등이)
      g.fillStyle(0xffa502).fillRect(22, cy - 6, 3, 12);

      // 양날 단검 블레이드 (마름모꼴 칼날)
      g.fillStyle(0x57606f).fillPoints([
        { x: 25, y: cy - 7 },
        { x: 44, y: cy },
        { x: 25, y: cy + 7 }
      ], true);

      // 칼날 중앙 하이라이트 및 능선
      g.fillStyle(0xf1f2f6).fillPoints([
        { x: 25, y: cy - 3 },
        { x: 42, y: cy },
        { x: 25, y: cy + 3 }
      ], true);
      g.lineStyle(1.5, 0xffffff, 0.9).lineBetween(25, cy, 43, cy);
    });

    // 염동력 조종 인디케이터 오라 링 (32 x 32)
    tex('aura_ring', 32, 32, g => {
      g.lineStyle(2, 0x00ffff, 0.8).strokeCircle(16, 16, 14);
      g.fillStyle(0x00d2d3, 0.25).fillCircle(16, 16, 12);
    });

    // 표창 꼬리 잔상용 트레일 파티클 (16 x 16)
    tex('shuriken_trail', 16, 16, g => {
      g.fillStyle(0x00d2d3, 0.5).fillCircle(8, 8, 8);
      g.fillStyle(0x54a0ff, 0.8).fillCircle(8, 8, 5);
      g.fillStyle(0xffffff).fillCircle(8, 8, 2.5);
    });

    // 화려한 타격 스파크 (16 x 16)
    tex('spark', 16, 16, g => {
      g.fillStyle(0xfff200).fillRect(6, 0, 4, 16).fillRect(0, 6, 16, 4);
      g.fillStyle(0xffffff).fillCircle(8, 8, 4);
    });

    // 타격 슬래시 이펙트 (44 x 44)
    tex('hit_slash', 44, 44, g => {
      g.lineStyle(5, 0xffd32a, 0.9).beginPath().arc(22, 22, 18, -0.6, 1.8).strokePath();
      g.lineStyle(2.5, 0xffffff, 1.0).beginPath().arc(22, 22, 18, -0.4, 1.6).strokePath();
    });

    // 2차 스킬 바람 속성 표창 (52 x 52)
    tex('wind_shuriken', 52, 52, g => {
      const cx = 26, cy = 26;
      // 청록/에메랄드빛 바람 돌풍 오라
      g.fillStyle(0x1dd1a1, 0.4).fillCircle(cx, cy, 25);
      g.fillStyle(0x10ac84, 0.6).fillCircle(cx, cy, 20);

      // 바람 칼날 4날 (돌풍 형태)
      g.fillStyle(0x00d2d3).fillPoints([
        { x: cx, y: 2 }, { x: cx + 9, y: cy - 9 },
        { x: 50, y: cy }, { x: cx + 9, y: cy + 9 },
        { x: cx, y: 50 }, { x: cx - 9, y: cy + 9 },
        { x: 2, y: cy }, { x: cx - 9, y: cy - 9 }
      ], true);

      // 내부 순백 칼날
      g.fillStyle(0xffffff).fillPoints([
        { x: cx, y: 6 }, { x: cx + 5, y: cy - 5 },
        { x: 46, y: cy }, { x: cx + 5, y: cy + 5 },
        { x: cx, y: 46 }, { x: cx - 5, y: cy + 5 },
        { x: 6, y: cy }, { x: cx - 5, y: cy - 5 }
      ], true);

      // 풍둔 코어 (발광 에메랄드)
      g.fillStyle(0x55efc4).fillCircle(cx, cy, 8);
      g.fillStyle(0xffffff).fillCircle(cx - 1, cy - 1, 3.5);
    });

    // 2차 스킬 바람 속성 쿠나이 (56 x 56)
    tex('wind_kunai', 56, 56, g => {
      const cx = 28, cy = 28;
      // 질풍의 기운 오라
      g.fillStyle(0x1dd1a1, 0.45).fillCircle(cx, cy, 26);
      g.lineStyle(3, 0x10ac84, 0.9).strokeCircle(10, cy, 6);
      // 손잡이
      g.fillStyle(0xdcdde1).fillRect(15, cy - 4, 11, 8);
      g.fillStyle(0x10ac84).fillRect(17, cy - 4, 2, 8).fillRect(22, cy - 4, 2, 8);
      // 코등이
      g.fillStyle(0x55efc4).fillRect(26, cy - 8, 4, 16);
      // 바람 칼날 (에메랄드빛 양날)
      g.fillStyle(0x00b894).fillPoints([
        { x: 30, y: cy - 9 },
        { x: 52, y: cy },
        { x: 30, y: cy + 9 }
      ], true);
      g.fillStyle(0xffffff).fillPoints([
        { x: 30, y: cy - 4 },
        { x: 49, y: cy },
        { x: 30, y: cy + 4 }
      ], true);
      g.lineStyle(2, 0x55efc4, 1).lineBetween(30, cy, 50, cy);
    });

    // 바람 속성 참격 / 회오리 슬래시 (64 x 64)
    tex('wind_slash', 64, 64, g => {
      g.lineStyle(6, 0x1dd1a1, 0.95).beginPath().arc(32, 32, 26, -0.8, 2.2).strokePath();
      g.lineStyle(3.5, 0x55efc4, 1.0).beginPath().arc(32, 32, 26, -0.6, 2.0).strokePath();
      g.lineStyle(1.5, 0xffffff, 1.0).beginPath().arc(32, 32, 26, -0.4, 1.8).strokePath();
    });

    // 3차 대형 풍마표창 (72 x 72)
    tex('big_shuriken', 72, 72, g => {
      const cx = 36, cy = 36;
      // 대형 황금/붉은 오라 글로우
      g.fillStyle(0xff9f43, 0.4).fillCircle(cx, cy, 35);
      g.fillStyle(0xee5253, 0.5).fillCircle(cx, cy, 28);

      // 외각 대형 블레이드 4날
      g.fillStyle(0x222f3e).fillPoints([
        { x: cx, y: 2 }, { x: cx + 13, y: cy - 13 },
        { x: 70, y: cy }, { x: cx + 13, y: cy + 13 },
        { x: cx, y: 70 }, { x: cx - 13, y: cy + 13 },
        { x: 2, y: cy }, { x: cx - 13, y: cy - 13 }
      ], true);

      // 내부 날카로운 황금빛 칼날
      g.fillStyle(0xfeca57).fillPoints([
        { x: cx, y: 8 }, { x: cx + 8, y: cy - 8 },
        { x: 64, y: cy }, { x: cx + 8, y: cy + 8 },
        { x: cx, y: 64 }, { x: cx - 8, y: cy + 8 },
        { x: 8, y: cy }, { x: cx - 8, y: cy - 8 }
      ], true);

      // 보조 4날 (총 8방향 블레이드)
      g.fillStyle(0xff6b6b).fillPoints([
        { x: 12, y: 12 }, { x: cx, y: cy - 7 },
        { x: 60, y: 12 }, { x: cx + 7, y: cy },
        { x: 60, y: 60 }, { x: cx, y: cy + 7 },
        { x: 12, y: 60 }, { x: cx - 7, y: cy }
      ], true);

      // 대형 중앙 코어
      g.fillStyle(0xff3838).fillCircle(cx, cy, 12);
      g.fillStyle(0xffd32a).fillCircle(cx, cy, 8);
      g.fillStyle(0xffffff).fillCircle(cx - 2, cy - 2, 4);
    });

    // 3차 거대 쿠나이 (80 x 80)
    tex('big_kunai', 80, 80, g => {
      const cx = 40, cy = 40;
      // 거대 진홍빛 화염/어검 오라
      g.fillStyle(0xff5252, 0.4).fillCircle(cx, cy, 38);

      // 손잡이 대형 고리
      g.lineStyle(5, 0x57606f).strokeCircle(14, cy, 9);
      // 손잡이 그립
      g.fillStyle(0x2f3542).fillRect(23, cy - 6, 17, 12);
      g.fillStyle(0xff4757).fillRect(26, cy - 6, 3, 12).fillRect(32, cy - 6, 3, 12);
      // 대형 가드
      g.fillStyle(0xffa502).fillRect(40, cy - 14, 6, 28);
      g.fillStyle(0xffffff).fillRect(42, cy - 11, 2, 22);

      // 거대 양날 블레이드
      g.fillStyle(0x2f3542).fillPoints([
        { x: 46, y: cy - 14 },
        { x: 76, y: cy },
        { x: 46, y: cy + 14 }
      ], true);

      // 칼날 내부 실버+레드 라인
      g.fillStyle(0xff6b81).fillPoints([
        { x: 46, y: cy - 8 },
        { x: 72, y: cy },
        { x: 46, y: cy + 8 }
      ], true);
      g.fillStyle(0xffffff).fillPoints([
        { x: 46, y: cy - 4 },
        { x: 68, y: cy },
        { x: 46, y: cy + 4 }
      ], true);
      g.lineStyle(3, 0xffffff, 0.9).lineBetween(46, cy, 70, cy);
    });

    tex('ground', 64, 64, g => {
      g.fillStyle(0x7a5230).fillRect(0, 0, 64, 64);
      g.fillStyle(0x58b947).fillRect(0, 0, 64, 14);
      g.fillStyle(0x44a133).fillRect(0, 10, 64, 4);
      g.fillStyle(0x6b4527).fillRect(10, 30, 8, 6).fillRect(40, 46, 10, 6);
    });

    tex('potion_hp', 24, 28, g => {
      g.fillStyle(0xb37d4e).fillRoundedRect(8, 1, 8, 4, 1);
      g.fillStyle(0xffffff, 0.7).fillRect(8, 5, 8, 4);
      g.fillStyle(0x222222, 0.4).fillRoundedRect(3, 8, 18, 19, 6);
      g.fillStyle(0xff4757).fillRoundedRect(4, 12, 16, 14, { bl: 5, br: 5, tl: 2, tr: 2 });
      g.fillStyle(0xffffff, 0.85).fillCircle(7, 15, 2).fillCircle(7, 20, 1.5);
      g.fillStyle(0xffffff).fillRect(9, 17, 6, 3).fillRect(10.5, 15.5, 3, 6);
    });

    tex('potion_mp', 24, 28, g => {
      g.fillStyle(0xb37d4e).fillRoundedRect(8, 1, 8, 4, 1);
      g.fillStyle(0xffffff, 0.7).fillRect(8, 5, 8, 4);
      g.fillStyle(0x222222, 0.4).fillRoundedRect(3, 8, 18, 19, 6);
      g.fillStyle(0x2e86de).fillRoundedRect(4, 12, 16, 14, { bl: 5, br: 5, tl: 2, tr: 2 });
      g.fillStyle(0xffffff, 0.85).fillCircle(7, 15, 2).fillCircle(7, 20, 1.5);
      g.fillStyle(0x48dbfb).fillCircle(13, 18, 3.5);
    });

    // 메이플스토리 스타일 마을 NPC [장로 타키] (56 x 72)
    tex('npc_elder', 56, 72, g => {
      // 그림자
      g.fillStyle(0x000000, 0.25).fillEllipse(28, 68, 44, 8);
      // 도포 하의 / 신발
      g.fillStyle(0x2c3e50).fillRoundedRect(16, 54, 24, 15, 3);
      // 긴 청색 도포 (상/하체)
      g.fillStyle(0x34495e).fillRoundedRect(14, 34, 28, 26, 4);
      g.fillStyle(0x2980b9).fillRect(16, 36, 24, 22);
      // 황금색 허리띠
      g.fillStyle(0xf1c40f).fillRect(14, 46, 28, 4);

      // 얼굴 피부
      g.fillStyle(0xffdfba).fillRoundedRect(13, 16, 30, 24, 8);
      // 흰 수염 (장로의 풍성한 수염)
      g.fillStyle(0xecf0f1).fillTriangle(14, 28, 42, 28, 28, 48);
      g.fillStyle(0xdcdde1).fillCircle(28, 44, 5);

      // 눈 (인자하고 친근한 표정)
      g.fillStyle(0x2d3436).fillRoundedRect(18, 22, 5, 4, 2);
      g.fillStyle(0x2d3436).fillRoundedRect(33, 22, 5, 4, 2);
      // 볼터치
      g.fillStyle(0xff7675, 0.35).fillCircle(17, 26, 3).fillCircle(39, 26, 3);

      // 삿갓 / 모자
      g.fillStyle(0x8a6240).fillTriangle(2, 20, 54, 20, 28, 4);
      g.fillStyle(0xa0754c).fillTriangle(6, 19, 50, 19, 28, 6);
      g.fillStyle(0xf1c40f).fillCircle(28, 6, 2.5);

      // 지팡이
      g.fillStyle(0x5c3d2e).fillRect(43, 26, 4, 42);
      g.fillStyle(0xf39c12).fillCircle(45, 24, 5);
    });

    // 퀘스트 시작 가능 느낌표 말풍선 [!] (32 x 32)
    tex('quest_icon_start', 32, 32, g => {
      // 둥근 전구/말풍선 배경
      g.fillStyle(0xf39c12).fillCircle(16, 16, 14);
      g.fillStyle(0xf1c40f).fillCircle(16, 16, 12);
      // 느낌표 !
      g.fillStyle(0x2d3436).fillRoundedRect(14, 6, 4, 11, 2);
      g.fillStyle(0x2d3436).fillCircle(16, 22, 2.5);
    });

    // 퀘스트 완료 가능 물음표 말풍선 [?] (32 x 32)
    tex('quest_icon_ready', 32, 32, g => {
      // 반짝이는 황금빛 완료 배경
      g.fillStyle(0xe67e22).fillCircle(16, 16, 15);
      g.fillStyle(0xffd32a).fillCircle(16, 16, 13);
      g.fillStyle(0xffffff, 0.6).fillCircle(12, 10, 4);
      // 물음표 ?
      g.fillStyle(0x2c2c54).beginPath().arc(16, 11, 4.5, -Math.PI * 0.8, Math.PI * 0.2).strokePath();
      g.fillStyle(0x2c2c54).fillRoundedRect(14.5, 12, 3, 5, 1);
      g.fillStyle(0x2c2c54).fillCircle(16, 22, 2.5);
    });

    // 퀘스트 진행 중 말풍선 [...] (32 x 32)
    tex('quest_icon_ing', 32, 32, g => {
      g.fillStyle(0x7f8c8d).fillCircle(16, 16, 14);
      g.fillStyle(0xbdc3c7).fillCircle(16, 16, 12);
      g.fillStyle(0x2c3e50).fillCircle(10, 16, 2).fillCircle(16, 16, 2).fillCircle(22, 16, 2);
    });

    gfx.destroy();
    this.scene.start('GameScene');
  }
}
