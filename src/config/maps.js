// 맵 설정 데이터. 맵 추가/수정은 이 파일만 고치면 된다.
// - width: 맵 가로 길이(px, 화면 960보다 넓게)  /  높이와 지면 Y는 GAME.height, GAME.groundY 공통
// - spawn: 기본 등장/부활 X 좌표
// - platforms: [x, y, w] 일방향 발판 (점프 최대 높이 약 150px → 지면 480 기준 y 340 이상 권장)
// - monsters: { x, y? } 맵별 몬스터 배치 (y 생략 시 지면)
// - portals: { x, label, to: { map, x } | null }  to가 없거나 대상 맵이 없으면 작동하지 않는다.
// - theme: 배경/지형 색상과 장식 타입

export const START_MAP = 'map01';

export const MAPS = {
  map01: {
    id: 'map01', name: '시작 마을', width: 1800, spawn: { x: 220 },
    theme: { skyTop: 0x6ec6f5, skyBottom: 0xd8f1ff, hill: 0x9bd68a, cloud: 0xffffff, groundTint: 0xffffff, decor: 'house', decorGap: 380 },
    platforms: [[620, 380, 200], [1100, 370, 220]],
    monsters: [], // 마을에는 몬스터 없음 (평화로운 안전지대)
    npcs: [{ id: 'elder', x: 820, name: '장로 타키' }],
    portals: [
      { x: 70, label: '마을 밖 (봉쇄됨)', to: null },
      { x: 1730, label: '초록 숲', to: { map: 'map02', x: 170 } }
    ]
  },
  map02: {
    id: 'map02', name: '초록 숲 (Lv.2~8)', width: 2400, spawn: { x: 170 },
    theme: { skyTop: 0x7fd8c9, skyBottom: 0xe3fff2, hill: 0x4caf50, cloud: 0xf2fff6, groundTint: 0xffffff, decor: 'tree', decorGap: 260 },
    platforms: [[500, 380, 200], [900, 360, 200], [1400, 390, 220], [1900, 360, 200]],
    monsters: [
      { x: 500, type: 'normal' }, { x: 750, type: 'normal' },
      { x: 1100, type: 'normal' }, { x: 1400, type: 'normal' },
      { x: 1800, type: 'normal' }, { x: 2100, type: 'normal' }
    ],
    portals: [
      { x: 70, label: '시작 마을', to: { map: 'map01', x: 1630 } },
      { x: 2330, label: '버섯 군락지', to: { map: 'map03', x: 170 } }
    ]
  },
  map03: {
    id: 'map03', name: '버섯 군락지 (Lv.9~16)', width: 2600, spawn: { x: 170 },
    theme: { skyTop: 0xf7b2d9, skyBottom: 0xfff0e0, hill: 0xc58fd6, cloud: 0xfff4fb, groundTint: 0xe6c9ff, decor: 'mushroom', decorGap: 300 },
    platforms: [[550, 370, 220], [1050, 390, 200], [1500, 360, 240], [2100, 380, 200]],
    monsters: [
      { x: 550, type: 'mushroom' }, { x: 900, type: 'mushroom' },
      { x: 1250, type: 'mushroom' }, { x: 1500, y: 300, type: 'mushroom' },
      { x: 1800, type: 'mushroom' }, { x: 2250, type: 'mushroom' }
    ],
    portals: [
      { x: 70, label: '초록 숲', to: { map: 'map02', x: 2230 } },
      { x: 2530, label: '잊힌 유적', to: { map: 'map04', x: 170 } }
    ]
  },
  map04: {
    id: 'map04', name: '잊힌 유적 (Lv.17~23)', width: 2800, spawn: { x: 170 },
    theme: { skyTop: 0xe8b77a, skyBottom: 0xfbe7c6, hill: 0xb08d63, cloud: 0xfff2dc, groundTint: 0xc9bca6, decor: 'pillar', decorGap: 340 },
    platforms: [[600, 380, 200], [1000, 350, 180], [1500, 390, 260], [2000, 360, 200], [2400, 380, 180]],
    monsters: [
      { x: 600, type: 'ruin_ghost' }, { x: 950, type: 'ruin_ghost' },
      { x: 1300, type: 'ruin_ghost' }, { x: 1600, type: 'ruin_ghost' },
      { x: 2000, y: 290, type: 'ruin_ghost' }, { x: 2250, type: 'ruin_ghost' },
      { x: 2500, type: 'ruin_ghost' }
    ],
    portals: [
      { x: 70, label: '버섯 군락지', to: { map: 'map03', x: 2430 } },
      { x: 2730, label: '망령의 숲', to: { map: 'map05', x: 170 } }
    ]
  },
  map05: {
    id: 'map05', name: '망령의 숲 (Lv.24~29)', width: 3000, spawn: { x: 170 },
    theme: { skyTop: 0x2b2344, skyBottom: 0x5b4a7a, hill: 0x3a3152, cloud: 0x8f86b0, groundTint: 0x8c84a8, decor: 'deadtree', decorGap: 280, dark: true },
    platforms: [[550, 380, 200], [1000, 360, 200], [1500, 390, 220], [2000, 360, 220], [2500, 380, 200]],
    monsters: [
      { x: 550, type: 'shadow_beast' }, { x: 850, type: 'shadow_beast' },
      { x: 1200, type: 'shadow_beast' }, { x: 1500, type: 'shadow_beast' },
      { x: 1800, type: 'shadow_beast' }, { x: 2100, type: 'shadow_beast' },
      { x: 2450, type: 'shadow_beast' }, { x: 2750, type: 'shadow_beast' }
    ],
    portals: [
      { x: 70, label: '잊힌 유적', to: { map: 'map04', x: 2630 } },
      { x: 2930, label: '달빛 능선 외곽', to: { map: 'map06', x: 170 } }
    ]
  },
  map06: {
    id: 'map06', name: '달빛 능선 외곽 (Lv.29~30)', width: 2600, spawn: { x: 170 },
    theme: { skyTop: 0x1b1435, skyBottom: 0x3b2a60, hill: 0x251c44, cloud: 0x6f6498, groundTint: 0x6e6888, decor: 'deadtree', decorGap: 260, dark: true },
    platforms: [[500, 370, 220], [1000, 350, 240], [1550, 380, 220], [2050, 360, 240]],
    monsters: [
      { x: 500, type: 'shadow_beast' }, { x: 750, type: 'shadow_beast' },
      { x: 1100, type: 'shadow_beast' }, { x: 1450, type: 'shadow_beast' },
      { x: 1800, type: 'shadow_beast' }, { x: 2200, type: 'shadow_beast' }
    ],
    portals: [
      { x: 70, label: '망령의 숲', to: { map: 'map05', x: 2830 } },
      { x: 2530, label: '결전의 달빛 제단 (1차 보스)', to: { map: 'map07', x: 170 } }
    ]
  },
  map07: {
    id: 'map07', name: '결전의 달빛 제단 (Lv.30 결전지)', width: 2200, spawn: { x: 170 },
    theme: { skyTop: 0x0f0b24, skyBottom: 0x2f1f54, hill: 0x1d1338, cloud: 0x8a72b8, groundTint: 0x5a4a75, decor: 'altar', decorGap: 360, dark: true },
    platforms: [[450, 370, 180], [800, 340, 260], [1300, 340, 260], [1750, 370, 180]],
    monsters: [
      { x: 600, type: 'shadow_beast' },
      { x: 1100, y: 440, type: 'boss_rabbit' },   // Lv.30 1차 전직 관문 보스: 토끼 장군
      { x: 1550, type: 'shadow_beast' }
    ],
    portals: [
      { x: 70, label: '달빛 능선 외곽', to: { map: 'map06', x: 2430 } },
      { x: 2130, label: '유적 발굴지 외곽 (Lv.31~)', to: { map: 'map08', x: 170 } }
    ]
  },
  map08: {
    id: 'map08', name: '유적 발굴지 외곽 (Lv.31~40)', width: 3200, spawn: { x: 170 },
    theme: { skyTop: 0x8d6e63, skyBottom: 0xd7ccc8, hill: 0x6d4c41, cloud: 0xefebe9, groundTint: 0xbcaaa4, decor: 'pillar', decorGap: 240 },
    platforms: [
      [500, 380, 220], [900, 360, 240], [1350, 380, 220],
      [1800, 350, 260], [2250, 380, 220], [2700, 360, 220]
    ],
    // 3~4마리 팩 스폰 (1차 전직 후 4인 동시 타격 광역기 활용)
    monsters: [
      { x: 500, type: 'clay_soldier' }, { x: 580, type: 'clay_soldier' }, { x: 660, type: 'clay_soldier' },
      { x: 950, type: 'ruin_bat' }, { x: 1050, type: 'clay_soldier' }, { x: 1150, type: 'clay_soldier' },
      { x: 1400, type: 'clay_soldier' }, { x: 1480, type: 'clay_soldier' }, { x: 1560, type: 'ruin_bat' },
      { x: 1850, type: 'ruin_bat' }, { x: 1950, type: 'clay_soldier' }, { x: 2050, type: 'clay_soldier' },
      { x: 2350, type: 'clay_soldier' }, { x: 2430, type: 'clay_soldier' }, { x: 2510, type: 'ruin_bat' },
      { x: 2750, type: 'clay_soldier' }, { x: 2850, type: 'clay_soldier' }
    ],
    portals: [
      { x: 70, label: '결전의 달빛 제단', to: { map: 'map07', x: 2030 } },
      { x: 3130, label: '무너진 지하 회랑', to: { map: 'map09', x: 170 } }
    ]
  },
  map09: {
    id: 'map09', name: '무너진 지하 회랑 (Lv.41~52)', width: 3200, spawn: { x: 170 },
    theme: { skyTop: 0x1b2826, skyBottom: 0x2e473b, hill: 0x1d362d, cloud: 0x486b59, groundTint: 0x3d5a49, decor: 'slime_shrine', decorGap: 260, dark: true },
    platforms: [
      [550, 380, 240], [1000, 360, 260], [1500, 390, 240],
      [1950, 360, 260], [2450, 380, 240], [2850, 360, 200]
    ],
    monsters: [
      { x: 500, type: 'shell_snail' }, { x: 600, type: 'shell_snail' }, { x: 700, type: 'mud_spitter' },
      { x: 1000, type: 'mud_spitter' }, { x: 1080, type: 'mud_spitter' }, { x: 1180, type: 'shell_snail' },
      { x: 1450, type: 'shell_snail' }, { x: 1550, type: 'shell_snail' }, { x: 1650, type: 'mud_spitter' },
      { x: 1950, type: 'mud_spitter' }, { x: 2050, type: 'shell_snail' }, { x: 2150, type: 'shell_snail' },
      { x: 2450, type: 'shell_snail' }, { x: 2550, type: 'mud_spitter' }, { x: 2650, type: 'shell_snail' }
    ],
    portals: [
      { x: 70, label: '유적 발굴지 외곽', to: { map: 'map08', x: 3030 } },
      { x: 3130, label: '침식된 고대 제단', to: { map: 'map10', x: 170 } }
    ]
  },
  map10: {
    id: 'map10', name: '침식된 고대 제단 (Lv.53~69)', width: 3400, spawn: { x: 170 },
    theme: { skyTop: 0x22132e, skyBottom: 0x472458, hill: 0x351745, cloud: 0x6e4383, groundTint: 0x5a316b, decor: 'altar', decorGap: 280, dark: true },
    platforms: [
      [500, 380, 240], [900, 350, 260], [1350, 370, 280],
      [1800, 340, 300], [2300, 370, 280], [2800, 350, 260]
    ],
    // 정예 골렘과 침식 잡몹 편대
    monsters: [
      { x: 550, type: 'shell_snail' }, { x: 650, type: 'mud_spitter' }, { x: 750, type: 'shell_snail' },
      { x: 1100, y: 430, type: 'golem_elite' }, { x: 1250, type: 'mud_spitter' },
      { x: 1550, type: 'mud_spitter' }, { x: 1650, type: 'mud_spitter' }, { x: 1750, type: 'shell_snail' },
      { x: 2050, y: 430, type: 'golem_elite' }, { x: 2200, type: 'shell_snail' },
      { x: 2550, type: 'shell_snail' }, { x: 2650, type: 'mud_spitter' }, { x: 2750, type: 'golem_elite' }
    ],
    portals: [
      { x: 70, label: '무너진 지하 회랑', to: { map: 'map09', x: 3030 } },
      { x: 3330, label: '침식의 누각 (Lv.70 대보스)', to: { map: 'map11', x: 170 } }
    ]
  },
  map11: {
    id: 'map11', name: '침식의 누각 아레나 (Lv.70 결전지)', width: 2400, spawn: { x: 170 },
    theme: { skyTop: 0x14051a, skyBottom: 0x360d45, hill: 0x22052b, cloud: 0x6a1f82, groundTint: 0x481157, decor: 'boss_throne', decorGap: 380, dark: true },
    platforms: [
      [450, 370, 200], [800, 330, 240], [1400, 330, 240], [1800, 370, 200]
    ],
    monsters: [
      { x: 600, type: 'mud_spitter' },
      { x: 1150, y: 410, type: 'boss_saojung' },  // Lv.70 최종 결전 대보스: 달팽이 사오정 장군
      { x: 1600, type: 'shell_snail' }
    ],
    portals: [
      { x: 70, label: '침식된 고대 제단', to: { map: 'map10', x: 3230 } },
      { x: 2330, label: '봉인된 차원문 (최종 토벌 완료)', to: null }
    ]
  }
};
