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
      g.fillStyle(0xf368e0, 0.6).fillCircle(15, 36, 4).fillCircle(47, 36, 4);
      g.fillStyle(0x2c2c54).fillCircle(31, 35, 3);
      g.fillStyle(0xff6b81).fillCircle(31, 36, 2);
      g.fillStyle(0xf1c40f).fillTriangle(31, 1, 26, 12, 36, 12);
    });

    // 버섯 포자몬 (64 x 56)
    tex('monster_mushroom', 64, 56, g => {
      g.fillStyle(0x000000, 0.25).fillEllipse(32, 52, 48, 8);
      // 기둥 몸통
      g.fillStyle(0xfff3e0).fillRoundedRect(16, 26, 32, 26, 10);
      // 붉은 주황 버섯 갓
      g.fillStyle(0xe67e22).fillEllipse(32, 22, 58, 36);
      g.fillStyle(0xd35400).fillEllipse(32, 24, 52, 30);
      g.fillStyle(0xffffff, 0.85).fillCircle(20, 16, 5).fillCircle(44, 16, 6).fillCircle(32, 10, 4);
      // 귀여운 눈
      g.fillStyle(0x2c3e50).fillEllipse(26, 38, 5, 8).fillEllipse(38, 38, 5, 8);
      g.fillStyle(0xffffff).fillCircle(25, 36, 2).fillCircle(37, 36, 2);
      g.fillStyle(0xff7675, 0.7).fillCircle(19, 42, 3.5).fillCircle(45, 42, 3.5);
    });

    // 유적 망령 (60 x 60)
    tex('monster_ghost', 60, 60, g => {
      g.fillStyle(0x000000, 0.2).fillEllipse(30, 56, 40, 6);
      g.fillStyle(0x6c5ce7, 0.3).fillCircle(30, 28, 26);
      g.fillStyle(0xa29bfe).fillRoundedRect(10, 8, 40, 44, { tl: 20, tr: 20, bl: 6, br: 6 });
      g.fillStyle(0x6c5ce7).fillTriangle(14, 50, 22, 58, 28, 50);
      g.fillStyle(0x6c5ce7).fillTriangle(32, 50, 38, 58, 44, 50);
      // 신비로운 푸른 눈
      g.fillStyle(0x00cec9).fillCircle(22, 26, 6).fillCircle(38, 26, 6);
      g.fillStyle(0xffffff).fillCircle(22, 24, 2.5).fillCircle(38, 24, 2.5);
    });

    // 그림자 야수 (66 x 56)
    tex('monster_shadow', 66, 56, g => {
      g.fillStyle(0x000000, 0.3).fillEllipse(33, 52, 52, 8);
      g.fillStyle(0x2d3436).fillRoundedRect(8, 14, 50, 38, 14);
      // 늑대 귀
      g.fillStyle(0x636e72).fillTriangle(14, 16, 8, 2, 24, 12);
      g.fillStyle(0x636e72).fillTriangle(52, 16, 58, 2, 42, 12);
      // 붉은 안광
      g.fillStyle(0xff4757).fillEllipse(22, 28, 7, 5).fillEllipse(44, 28, 7, 5);
      g.fillStyle(0xffffff).fillCircle(22, 28, 2).fillCircle(44, 28, 2);
      // 송곳니
      g.fillStyle(0xffffff).fillTriangle(28, 38, 31, 45, 34, 38).fillTriangle(32, 38, 35, 45, 38, 38);
    });

    // [보스] 토끼 장군 (84 x 92)
    tex('monster_boss_rabbit', 84, 92, g => {
      // 보스 금빛 오라
      g.fillStyle(0xf1c40f, 0.25).fillCircle(42, 46, 42);
      g.fillStyle(0x000000, 0.35).fillEllipse(42, 86, 64, 10);
      // 토끼 귀 (장군 투구 장식)
      g.fillStyle(0xffffff).fillRoundedRect(22, 2, 12, 34, 6).fillRoundedRect(50, 2, 12, 34, 6);
      g.fillStyle(0xff7675).fillRoundedRect(25, 8, 6, 24, 3).fillRoundedRect(53, 8, 6, 24, 3);
      // 장군 황금 투구
      g.fillStyle(0xf39c12).fillRoundedRect(18, 26, 48, 22, 8);
      g.fillStyle(0xe74c3c).fillCircle(42, 28, 7); // 이마 루비 보석
      // 얼굴 & 볼
      g.fillStyle(0xffffff).fillRoundedRect(16, 40, 52, 36, 16);
      g.fillStyle(0xff7675, 0.5).fillCircle(24, 60, 6).fillCircle(60, 60, 6);
      // 결연한 눈 & 눈썹
      g.fillStyle(0x2c3e50).fillCircle(30, 52, 5).fillCircle(54, 52, 5);
      g.fillStyle(0xffffff).fillCircle(29, 50, 2).fillCircle(53, 50, 2);
      g.lineStyle(2, 0xd63031).lineBetween(24, 46, 35, 49).lineBetween(60, 46, 49, 49);
      // 장군 갑주
      g.fillStyle(0xd63031).fillRoundedRect(20, 68, 44, 20, 4);
      g.fillStyle(0xf1c40f).fillRect(20, 76, 44, 4);
      // 당근 대검 장식
      g.fillStyle(0xe67e22).fillTriangle(70, 42, 82, 80, 74, 80);
      g.fillStyle(0x2ecc71).fillRect(74, 34, 6, 10);
    });

    // 고대 토우 병사 (64 x 68)
    tex('monster_clay_soldier', 64, 68, g => {
      g.fillStyle(0x000000, 0.3).fillEllipse(32, 64, 46, 8);
      // 점토 갑옷
      g.fillStyle(0x795548).fillRoundedRect(16, 24, 32, 38, 6);
      g.fillStyle(0x8d6e63).fillRoundedRect(14, 10, 36, 22, 6);
      // 고대 투구 챙
      g.fillStyle(0x5d4037).fillRect(10, 22, 44, 6);
      // 형광빛 눈 (침식에 깨어난 영혼)
      g.fillStyle(0x00e676).fillRect(22, 18, 6, 4).fillRect(36, 18, 6, 4);
      // 청동 창
      g.fillStyle(0xa1887f).fillRect(50, 10, 4, 54);
      g.fillStyle(0x26a69a).fillTriangle(52, 0, 47, 14, 57, 14);
    });

    // 유적 박쥐 (68 x 48)
    tex('monster_ruin_bat', 68, 48, g => {
      // 박쥐 날개
      g.fillStyle(0x4a148c).fillTriangle(2, 24, 24, 6, 26, 36);
      g.fillStyle(0x4a148c).fillTriangle(66, 24, 44, 6, 42, 36);
      g.fillStyle(0x6a1b9a).fillCircle(14, 22, 10).fillCircle(54, 22, 10);
      // 몸통 & 귀
      g.fillStyle(0x311b92).fillEllipse(34, 26, 22, 26);
      g.fillStyle(0xb388ff).fillTriangle(27, 14, 23, 2, 31, 12).fillTriangle(41, 14, 45, 2, 37, 12);
      // 붉은 눈
      g.fillStyle(0xff1744).fillCircle(30, 24, 3).fillCircle(38, 24, 3);
    });

    // 침식 껍질 달팽이 (74 x 62)
    tex('monster_shell_snail', 74, 62, g => {
      g.fillStyle(0x000000, 0.3).fillEllipse(37, 58, 60, 8);
      // 바닥 연체 몸통
      g.fillStyle(0xa5d6a7).fillRoundedRect(8, 42, 54, 16, 8);
      // 더듬이 & 눈
      g.lineStyle(2, 0x81c784).lineBetween(54, 44, 64, 32).lineBetween(58, 46, 68, 38);
      g.fillStyle(0x1b5e20).fillCircle(65, 32, 4).fillCircle(69, 38, 4);
      // 거대 소라 껍질 (침식된 보랏빛 고대 껍질)
      g.fillStyle(0x4a148c).fillCircle(30, 32, 24);
      g.fillStyle(0x7b1fa2).fillCircle(30, 32, 18);
      g.fillStyle(0xba68c8).fillCircle(30, 32, 11);
      g.fillStyle(0x00e5ff, 0.8).fillCircle(30, 32, 5); // 껍질 중앙 룬 코어
    });

    // 침식 진흙괴 (68 x 56)
    tex('monster_mud_spitter', 68, 56, g => {
      g.fillStyle(0x000000, 0.3).fillEllipse(34, 52, 56, 8);
      // 끈적이는 진흙 몸체
      g.fillStyle(0x3e2723).fillRoundedRect(6, 16, 56, 36, { tl: 22, tr: 26, bl: 10, br: 10 });
      g.fillStyle(0x4e342e).fillCircle(20, 24, 14).fillCircle(48, 24, 16);
      // 독액 거품
      g.fillStyle(0x76ff03, 0.8).fillCircle(16, 12, 6).fillCircle(50, 10, 8).fillCircle(34, 6, 5);
      // 맹독 눈 & 큰 입
      g.fillStyle(0xccff90).fillCircle(24, 28, 6).fillCircle(44, 28, 6);
      g.fillStyle(0x1b5e20).fillCircle(24, 28, 3).fillCircle(44, 28, 3);
      g.fillStyle(0x00e676).fillEllipse(34, 40, 18, 8); // 진흙 뿜는 입
    });

    // [정예] 고대 석상 골렘 (88 x 96)
    tex('monster_golem_elite', 88, 96, g => {
      g.fillStyle(0x000000, 0.4).fillEllipse(44, 90, 72, 12);
      // 웅장한 바위 몸체
      g.fillStyle(0x37474f).fillRoundedRect(14, 26, 60, 60, 10);
      g.fillStyle(0x455a64).fillRoundedRect(10, 14, 68, 24, 8); // 거대 어깨
      // 바위 팔
      g.fillStyle(0x263238).fillRoundedRect(4, 34, 16, 44, 6).fillRoundedRect(68, 34, 16, 44, 6);
      // 가슴의 신비로운 에인션트 룬 코어
      g.fillStyle(0x00bcd4).fillCircle(44, 54, 12);
      g.fillStyle(0xe0f7fa).fillCircle(44, 54, 6);
      // 붉은 안광
      g.fillStyle(0xff1744).fillRect(30, 24, 8, 4).fillRect(50, 24, 8, 4);
    });

    // [대보스] 달팽이 사오정 장군 (110 x 110)
    tex('monster_boss_saojung', 110, 110, g => {
      // 대보스 암흑 폭풍 오라
      g.fillStyle(0x4a148c, 0.35).fillCircle(55, 55, 54);
      g.fillStyle(0x000000, 0.5).fillEllipse(55, 102, 90, 14);
      // 거대한 고대 침식 달팽이 소라 껍질 (가시 달린 외골격)
      g.fillStyle(0x1a237e).fillCircle(42, 48, 38);
      g.fillStyle(0x311b92).fillCircle(42, 48, 28);
      g.fillStyle(0x7b1fa2).fillCircle(42, 48, 18);
      // 황금 가시 돌기
      g.fillStyle(0xffd700).fillTriangle(20, 16, 8, 2, 28, 12);
      g.fillStyle(0xffd700).fillTriangle(50, 12, 54, 0, 62, 14);
      g.fillStyle(0xffd700).fillTriangle(8, 44, 0, 36, 12, 54);
      // 사오정 본체 (장군 투구 & 해골 염주 목걸이)
      g.fillStyle(0x26a69a).fillRoundedRect(52, 42, 46, 52, 14);
      // 사오정 해골 염주 (목걸이 구슬들)
      for (let i = 0; i < 5; i++) {
        g.fillStyle(0xffffff).fillCircle(62 + i * 7, 72, 4);
        g.fillStyle(0x000000).fillCircle(62 + i * 7, 72, 1.5);
      }
      // 삼지창 / 무기
      g.fillStyle(0x78909c).fillRect(96, 12, 6, 88);
      g.fillStyle(0xffd700).fillTriangle(99, 0, 92, 18, 106, 18);
      // 형광빛 보스 안광
      g.fillStyle(0xffeb3b).fillEllipse(70, 56, 8, 6).fillEllipse(86, 56, 8, 6);
      g.fillStyle(0xd50000).fillCircle(70, 56, 3).fillCircle(86, 56, 3);
      // 사오정 특유의 입
      g.fillStyle(0x004d40).fillEllipse(78, 66, 12, 5);
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

    // ==============================================================
    // 직업 [그림자 군주] 2.5등신 동양풍 다크 판타지 SD 스프라이트 & 6대 무기
    // ==============================================================

    // [그림자 군주 본체] 2.5등신 SD (64 x 64) - 검은 삿갓, 붉은 안광, 털장식 경번갑, 도포자락, 흑도
    tex('player_shadow_lord', 64, 64, g => {
      // 펄럭이는 칠흑 도포 자락 (#1E2338, #1A1A24)
      g.fillStyle(0x1a1a24).fillTriangle(18, 38, 4, 62, 28, 56);
      g.fillStyle(0x1e2338).fillTriangle(46, 38, 36, 56, 60, 62);

      // 다리 & 신발 (흑철 혜)
      g.fillStyle(0x111118).fillRect(20, 52, 9, 12).fillRect(35, 52, 9, 12);
      g.fillStyle(0xd4af37).fillRect(20, 62, 9, 2).fillRect(35, 62, 9, 2);

      // 동양식 흑철 경번갑 몸통 & 황동 띠 (#D4AF37)
      g.fillStyle(0x22273d).fillRoundedRect(18, 32, 28, 22, 3);
      g.fillStyle(0x1a1a24).fillRect(22, 34, 20, 16);
      g.fillStyle(0xd4af37).fillRect(18, 48, 28, 4); // 황동 복대
      g.fillStyle(0xff3344).fillCircle(32, 50, 2); // 붉은 영력 보석

      // 어깨 늑대 털 장식 (회백색 #dfe4ea)
      g.fillStyle(0xdfe4ea).fillCircle(17, 33, 6).fillCircle(47, 33, 6);
      g.fillStyle(0xb2bec3).fillCircle(19, 35, 4).fillCircle(45, 35, 4);

      // 허리춤 초심자용 흑도 (Black Katana)
      g.fillStyle(0x0a0a0f).fillRect(12, 45, 14, 3);
      g.fillStyle(0xd4af37).fillCircle(14, 46, 2); // 황동 쯔바

      // 얼굴 (창백한 피부)
      g.fillStyle(0xf1e7fe).fillRoundedRect(18, 14, 28, 20, 6);

      // 붉게 번뜩이는 도깨비불 마안 (#FF3344)
      g.fillStyle(0xff3344).fillRoundedRect(22, 20, 6, 7, 2).fillRoundedRect(36, 20, 6, 7, 2);
      g.fillStyle(0xffffff).fillCircle(24, 22, 1.5).fillCircle(38, 22, 1.5);

      // 삿갓 챙 그늘 & 휘날리는 흑발
      g.fillStyle(0x0f0f17).fillTriangle(14, 18, 8, 36, 20, 26);
      g.fillStyle(0x0f0f17).fillTriangle(50, 18, 44, 26, 56, 36);

      // 동양식 검은 삿갓 (Black Satgat)
      g.fillStyle(0x1a1a24).fillTriangle(32, 4, 4, 20, 60, 20);
      g.fillStyle(0x0d0d13).fillRect(2, 19, 60, 3);
      g.fillStyle(0xd4af37).fillCircle(32, 6, 3); // 삿갓 꼭지 황동 장식

      // 바람에 휘날리는 붉은/검은 갓끈
      g.fillStyle(0xff3344).fillPoints([{ x: 20, y: 22 }, { x: 12, y: 34 }, { x: 16, y: 40 }], true);
    });

    // 그림자 분신 공통 베이스 (56 x 72) - 반투명 수묵 먹물 실루엣 (Alpha 75%)
    tex('shadow_clone', 56, 72, g => {
      // 먹물 오라 외곽 흩날림 (Alpha 0.45)
      g.fillStyle(0x0f0c1b, 0.45).fillCircle(28, 36, 30);
      g.fillStyle(0x1a152e, 0.65).fillCircle(28, 36, 24);

      // 먹물 도포 실루엣
      g.fillStyle(0x0a0814, 0.85).fillTriangle(14, 38, 2, 64, 22, 54);

      // 다리 & 몸체 (칠흑 먹물)
      g.fillStyle(0x120e20, 0.9).fillRoundedRect(16, 56, 10, 14, 3);
      g.fillStyle(0x120e20, 0.9).fillRoundedRect(30, 56, 10, 14, 3);
      g.fillStyle(0x0a0814, 0.95).fillRoundedRect(16, 36, 24, 23, 4);

      // 머리 & 얼굴 (수묵 덩어리)
      g.fillStyle(0x080612, 0.95).fillCircle(28, 22, 18);

      // 은은한 심연 보랏빛 안광
      g.fillStyle(0xa333ff).fillRoundedRect(20, 20, 5, 6, 2);
      g.fillStyle(0xa333ff).fillRoundedRect(31, 20, 5, 6, 2);
      g.fillStyle(0xffffff).fillCircle(22, 22, 1.5).fillCircle(33, 22, 1.5);

      // 흩날리는 먹물 띠 자락
      g.fillStyle(0x341f97, 0.8).fillRoundedRect(14, 33, 28, 7, 3);
    });

    // 0. 본체 흑도 (Shadow Blade / 평타용, 46 x 14) - 흑요석 블랙 + 황동 골드
    tex('shadow_blade', 46, 14, g => {
      g.fillStyle(0x1a1a24, 0.5).fillRoundedRect(0, 2, 46, 10, 4);
      g.fillStyle(0x0f0f17).fillPoints([{ x: 8, y: 7 }, { x: 44, y: 3 }, { x: 44, y: 11 }], true);
      g.fillStyle(0xd4af37).fillRect(8, 5, 4, 4); // 황동 쯔바
      g.fillStyle(0xffffff).fillRect(14, 6, 26, 2); // 칼날 하이라이트
      g.fillStyle(0xff3344).fillCircle(40, 7, 2); // 붉은 검기 끝단
    });

    // 1. 단검 (분신 1호 역수 쌍단검, 32 x 16) - 비취색 독기 발광 (#00FF99)
    tex('shadow_dagger', 32, 16, g => {
      // 비취색 네온 오라 글로우
      g.fillStyle(0x00ff99, 0.45).fillCircle(18, 8, 12);
      // 역수 흑철 칼날
      g.fillStyle(0x1e272e).fillPoints([{ x: 6, y: 8 }, { x: 30, y: 3 }, { x: 26, y: 13 }], true);
      // 독기 서린 비취 칼날 코어 (#00FF99)
      g.fillStyle(0x00ff99).fillRect(10, 7, 18, 2);
      g.fillStyle(0xffffff).fillRect(16, 7, 8, 1);
      g.fillStyle(0x2f3640).fillRect(0, 6, 7, 4); // 손잡이
    });

    // 2. 사슬낫 (분신 2호 Kusarigama, 48 x 40) - 핏빛 자색 발광 (#A333FF)
    tex('shadow_kusarigama', 48, 40, g => {
      // 핏빛 자색 오라 글로우
      g.fillStyle(0xa333ff, 0.35).fillCircle(24, 20, 22);
      // 낫 칼날
      g.fillStyle(0x130f40).beginPath().arc(24, 16, 18, -Math.PI * 0.75, 0).strokePath();
      g.fillStyle(0xa333ff).fillTriangle(18, 2, 44, 10, 28, 22);
      g.fillStyle(0xffffff).fillTriangle(22, 5, 40, 10, 28, 17);
      // 자루 & 뱀 형태 사슬과 분동
      g.fillStyle(0x2f3542).fillRect(18, 16, 6, 22);
      g.fillStyle(0xa333ff).fillCircle(8, 34, 6); // 자색 분동
      g.lineStyle(2, 0xa333ff).lineBetween(21, 36, 8, 34);
    });

    // 3. 대검 (분신 3호 Greatsword, 68 x 26) - 청백색 서리 발광 (#33CCFF)
    tex('shadow_greatsword', 68, 26, g => {
      // 청백색 서리 오라 글로우
      g.fillStyle(0x33ccff, 0.4).fillRoundedRect(0, 1, 68, 24, 4);
      // 묵직한 거대 흑철 칼날
      g.fillStyle(0x0c2461).fillRect(12, 4, 48, 18);
      g.fillStyle(0x33ccff).fillRect(14, 7, 44, 12); // 서리 발광 코어
      g.fillStyle(0xffffff).fillRect(18, 12, 36, 2);
      // 칼끝 사선 경사
      g.fillStyle(0x0c2461).fillTriangle(60, 4, 68, 13, 60, 22);
      g.fillStyle(0xd4af37).fillRect(6, 2, 6, 22); // 황동 가드
      g.fillStyle(0x1e272e).fillRect(0, 10, 6, 6); // 손잡이
    });

    // 4. 창 (분신 4호 Spiral Lance, 76 x 18) - 진홍색 화염 발광 (#FF3300)
    tex('shadow_lance', 76, 18, g => {
      // 진홍 화염 오라 글로우
      g.fillStyle(0xff3300, 0.4).fillRoundedRect(0, 3, 76, 12, 4);
      // 긴 흑철 자루
      g.fillStyle(0x2c3e50).fillRect(0, 8, 52, 3);
      // 붉은 술 장식 (#FF3300)
      g.fillStyle(0xff3300).fillTriangle(48, 4, 54, 9, 48, 14);
      // 원뿔형 창날 & 회전 링
      g.fillStyle(0xb33939).fillTriangle(52, 2, 74, 9, 52, 16);
      g.fillStyle(0xffffff).fillTriangle(56, 5, 72, 9, 56, 13);
      g.fillStyle(0xff3300).fillCircle(52, 9, 4);
    });

    // 5. 언월도 (분신 5호 Guandao, 66 x 28) - 금빛 섬광 발광 (#FFCC00)
    tex('shadow_glaive', 66, 28, g => {
      // 금빛 섬광 오라 글로우
      g.fillStyle(0xffcc00, 0.35).fillCircle(38, 14, 22);
      // 긴 장병 봉
      g.fillStyle(0x1e272e).fillRect(0, 12, 42, 4);
      // 초승달 대형 곡도 날붙이
      g.fillStyle(0xcd6133).fillPoints([
        { x: 40, y: 14 }, { x: 46, y: 2 }, { x: 64, y: 4 },
        { x: 66, y: 13 }, { x: 56, y: 26 }, { x: 44, y: 20 }
      ], true);
      // 금빛 칼날 코어 (#FFCC00)
      g.fillStyle(0xffcc00).fillRect(44, 11, 20, 4);
      g.fillStyle(0xffffff).fillRect(46, 12, 14, 2);
      g.fillStyle(0xd4af37).fillCircle(40, 14, 5); // 용머리 황동 연결부
    });

    // 6. 도끼 (분신 6호 Battle Axe, 54 x 42) - 흑철 & 용암 균열 주황 (#111111 + #FF6600)
    tex('shadow_axe', 54, 42, g => {
      // 용암 균열 오라 글로우
      g.fillStyle(0xff6600, 0.4).fillCircle(27, 21, 22);
      // 단단한 흑철 자루
      g.fillStyle(0x111111).fillRect(24, 0, 6, 42);
      // 넓은 양날 도끼 머리
      g.fillStyle(0x1e272e).fillTriangle(6, 2, 26, 14, 10, 28);
      g.fillStyle(0x1e272e).fillTriangle(48, 2, 28, 14, 44, 28);
      // 칼날 용암 균열 발광선 (#FF6600)
      g.fillStyle(0xff6600).fillRect(6, 5, 4, 22).fillRect(44, 5, 4, 22);
      g.fillStyle(0xffdd59).fillRect(8, 8, 2, 16).fillRect(44, 8, 2, 16);
      g.fillStyle(0xd4af37).fillCircle(27, 15, 5); // 중앙 황동 코어
    });

    // 먹물 참격 이펙트 (Ink Splatter Slash, 130 x 85) - 붓 터치 농담 및 무기 발광선
    tex('shadow_slash', 130, 85, g => {
      g.fillStyle(0x0f0c1b, 0.55).fillEllipse(65, 42, 120, 70);
      g.fillStyle(0xa333ff, 0.85).beginPath().arc(65, 42, 52, -Math.PI * 0.8, Math.PI * 0.25).strokePath();
      g.fillStyle(0x00ff99, 0.9).beginPath().arc(65, 42, 46, -Math.PI * 0.75, Math.PI * 0.2).strokePath();
      g.fillStyle(0xffffff).fillCircle(92, 20, 5).fillCircle(102, 40, 6);
    });

    gfx.destroy();
    this.scene.start('GameScene');
  }
}
