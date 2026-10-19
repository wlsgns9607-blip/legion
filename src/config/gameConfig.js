// 모든 밸런스/수치는 이 파일에서 관리한다.
export const GAME = { width: 960, height: 540, worldWidth: 2400, groundY: 480, gravity: 900 };

export const PLAYER = {
  maxHp: 200, maxMp: 200, speed: 220, jump: -520,
  damage: 15, attackInterval: 360,     // 투척 리듬감을 위한 적정 간격 (ms)
  shurikenMpCost: 0,                   // 1레벨 테스트를 위해 MP 소모 없음
  invulnMs: 1000, stunMs: 250,
  shurikenSpeed: 400, shurikenRange: 520, // 중간 속도로 조율 (너무 빠르지 않음)
  maxActiveWeapons: 4                  // 밸런스 조정: 필드 동시 비행/조정 가능 표창 최대 4개 제한
};

// 시노비 염동력 무기 시스템 설정 (중간 속도 & 부드러운 유선형 제어)
export const PSYCHOKINESIS = {
  shuriken: {
    name: '표창',
    speed: 400,              // 중간 비행 속도 (기존 620에서 하향)
    controlSpeed: 240,       // 중간 조종 속도 (기존 420에서 안정적인 240으로 조율)
    turnRate: 0.08,          // 부드러운 회전 보간 속도
    damageMult: 1.0,         // 데미지 배율
    hitCooldown: 300,        // 동일 대상 재타격 간격 (ms)
    mpCost: 0,
    size: 18,
    scale: 1.0,
    trailTint: 0x00d2d3,
    auraTint: 0x00ffff
  },
  kunai: {
    name: '쿠나이',
    speed: 350,              // 묵직한 중간 속도
    controlSpeed: 210,       // 안정적인 조종 속도
    turnRate: 0.06,
    damageMult: 1.6,         // 묵직하고 강한 공격력
    hitCooldown: 400,
    mpCost: 0,
    size: 22,
    scale: 1.15,
    trailTint: 0xff6b81,
    auraTint: 0xff4757
  },
  wind_shuriken: {
    name: '바람 표창',
    speed: 480,              // 질풍 중간 속도
    controlSpeed: 280,
    turnRate: 0.10,
    damageMult: 3.0,         // 4명 몬스터 섬멸용 강력한 바람 데미지
    hitCooldown: 200,
    mpCost: 0,
    size: 22,
    scale: 1.25,
    trailTint: 0x1dd1a1,
    auraTint: 0x10ac84
  },
  wind_kunai: {
    name: '바람 쿠나이',
    speed: 440,
    controlSpeed: 260,
    turnRate: 0.08,
    damageMult: 3.5,
    hitCooldown: 250,
    mpCost: 0,
    size: 24,
    scale: 1.3,
    trailTint: 0x1dd1a1,
    auraTint: 0x10ac84
  },
  big_shuriken: {
    name: '대형 풍마표창',
    speed: 550,
    controlSpeed: 360,
    turnRate: 0.1,
    damageMult: 4.2,         // 3차 대형 표창
    hitCooldown: 180,
    mpCost: 0,
    size: 38,
    scale: 1.8,
    trailTint: 0xff9f43,
    auraTint: 0xfeca57
  },
  big_kunai: {
    name: '거대 쿠나이',
    speed: 520,
    controlSpeed: 300,
    turnRate: 0.08,
    damageMult: 5.0,         // 3차 거대 쿠나이
    hitCooldown: 220,
    mpCost: 0,
    size: 42,
    scale: 1.9,
    trailTint: 0xff5252,
    auraTint: 0xff793f
  },
  maxSuspendTime: 12000,     // 공중 대기 지속 최대 시간 (ms)
  recallSpeed: 850           // 회수 이동 속도
};

// 1차 / 2차 / 3차 전직 차수별 시스템 설정 (30레벨 2차, 60레벨 3차)
export const TIERS = {
  1: {
    tier: 1,
    reqLevel: 1,
    title: '1차: 시노비 (표창술)',
    allowedWeapons: ['shuriken'],
    maxHits: 2,             // 1차: 표창만 2명이하 타격
    canPinAndRecall: false,
    desc: '1차 (Lv.1~29): 표창만 사용 가능하며 최대 2명 이하를 타격합니다.'
  },
  2: {
    tier: 2,
    reqLevel: 30,           // 30레벨 2차 전직
    title: '2차: 듀얼시노비 (쿠나이+회수)',
    allowedWeapons: ['shuriken', 'kunai'],
    maxHits: 3,             // 2차 기본: 쿠나이와 표창 가능, 3명이하 타격
    canPinAndRecall: true,  // 몬스터에 꽂힌 표창 회수 가능
    skill2: {
      name: '풍둔: 질풍열파',
      key: 'A',
      cooldown: 10000,      // 2차 스킬 추가 쿨타임 10초
      maxHits: 4,           // 표창과 쿠나이에 바람속성을 붙여 4명의 몬스터를 없앤다
      desc: '표창과 쿠나이에 바람속성을 부여하여 최대 4명의 몬스터를 연속 섬멸 (쿨타임 10초)'
    },
    desc: '2차 (Lv.30~59): 표창과 쿠나이 모두 사용, 몬스터에 꽂힌 표창 회수 가능, 3명 이하 타격'
  },
  3: {
    tier: 3,
    reqLevel: 70,           // 70레벨 전직 (최종 대장군)
    title: '3차: 풍마대장군 (거대 쿠나이/대형 풍마표창)',
    allowedWeapons: ['shuriken', 'kunai', 'big_shuriken', 'big_kunai'],
    maxHits: 5,             // 3차: 최대 5인 동시 타격
    canPinAndRecall: true,
    desc: '3차 (Lv.70): 거대한 풍마표창과 쿠나이를 전개하여 최대 5인을 동시 섬멸합니다.'
  }
};

// 퀘스트 시스템 설정
export const QUEST_CONFIG = {
  quest1: {
    id: 'quest1',
    title: '퀘스트 1: 초록 숲 정화',
    targetMap: 'map02',      // 사냥터 1 (초록 숲)
    targetCount: 30,         // 30명 처치
    npcName: '장로 타키',
    rewardExp: 350,
    rewardHpPots: 5,
    rewardMpPots: 5,
    dialogStart: '안녕하신가, 시노비여!\n마을 밖 [초록 숲]에 몬스터들이 급증하여 주민들이 떨고 있네.\n초록 숲으로 가서 몬스터 30마리를 처치해주겠는가?',
    dialogInProgress: '아직 초록 숲의 몬스터가 남아있네.\n목표: 초록 숲 몬스터 30마리 처치',
    dialogComplete: '오오! 30마리를 모두 소탕해주었군!\n자네 덕분에 마을이 평화를 되찾았네.\n약속한 보상(EXP +350, 포션)을 받게!'
  }
};

export const MONSTER = {
  hp: 40, speed: 70, contactDamage: 10, exp: 12,
  aggroRange: 420, stopRange: 24, respawnMs: 4000,
  spawnXs: [500, 800, 1200, 1600, 2000]
};

// Lv.1 ~ Lv.70 몬스터별 정량 데이터 시트
export const MONSTER_TYPES = {
  normal: {
    name: '포동 슬라임',
    hp: 40, speed: 70, contactDamage: 10, exp: 12,
    texture: 'monster', scale: 1.0, respawnMs: 4000
  },
  mushroom: {
    name: '버섯 포자몬',
    hp: 85, speed: 75, contactDamage: 14, exp: 22,
    texture: 'monster_mushroom', scale: 1.05, respawnMs: 4200
  },
  ruin_ghost: {
    name: '유적 망령',
    hp: 150, speed: 80, contactDamage: 18, exp: 35,
    texture: 'monster_ghost', scale: 1.1, respawnMs: 4500
  },
  shadow_beast: {
    name: '그림자 야수',
    hp: 240, speed: 95, contactDamage: 24, exp: 50,
    texture: 'monster_shadow', scale: 1.15, respawnMs: 4800
  },
  boss_rabbit: {
    name: '[보스] 토끼 장군',
    hp: 3500, speed: 110, contactDamage: 40, exp: 1200,
    texture: 'monster_boss_rabbit', scale: 1.6, respawnMs: 15000,
    isBoss: true, title: '달빛 제단의 수호자'
  },
  clay_soldier: {
    name: '고대 토우 병사',
    hp: 360, speed: 80, contactDamage: 28, exp: 75,
    texture: 'monster_clay_soldier', scale: 1.1, respawnMs: 4200
  },
  ruin_bat: {
    name: '유적 동굴 박쥐',
    hp: 260, speed: 125, contactDamage: 32, exp: 85,
    texture: 'monster_ruin_bat', scale: 1.0, fly: true, respawnMs: 4000
  },
  shell_snail: {
    name: '침식 껍질 달팽이',
    hp: 750, speed: 65, contactDamage: 36, exp: 160,
    texture: 'monster_shell_snail', scale: 1.25, respawnMs: 4500
  },
  mud_spitter: {
    name: '침식 진흙괴',
    hp: 580, speed: 85, contactDamage: 42, exp: 180,
    texture: 'monster_mud_spitter', scale: 1.2, respawnMs: 4500
  },
  golem_elite: {
    name: '[정예] 고대 석상 골렘',
    hp: 1800, speed: 60, contactDamage: 55, exp: 500,
    texture: 'monster_golem_elite', scale: 1.5, respawnMs: 8000,
    isElite: true
  },
  boss_saojung: {
    name: '[대보스] 달팽이 사오정 장군',
    hp: 15000, speed: 95, contactDamage: 75, exp: 8000,
    texture: 'monster_boss_saojung', scale: 2.1, respawnMs: 25000,
    isBoss: true, title: '침식의 군주'
  }
};

export const POTION = {
  hpHeal: 50,
  mpHeal: 40,
  dropChanceHp: 0.7,
  dropChanceMp: 0.7
};

export const LEVEL = {
  maxLevel: 70,                        // 최대 70레벨 확장 (Lv.70 결전 및 대장군 전직)
  baseExp: 18, growth: 1.45,           // 70레벨까지 호쾌하고 몰입감 있는 레벨업 곡선
  hpPerLevel: 14, mpPerLevel: 10, damagePerLevel: 3
};

