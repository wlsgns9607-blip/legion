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
    id: 'map02', name: '초록 숲', width: 2400, spawn: { x: 170 },
    theme: { skyTop: 0x7fd8c9, skyBottom: 0xe3fff2, hill: 0x4caf50, cloud: 0xf2fff6, groundTint: 0xffffff, decor: 'tree', decorGap: 260 },
    platforms: [[500, 380, 200], [900, 360, 200], [1400, 390, 220], [1900, 360, 200]],
    monsters: [{ x: 600 }, { x: 900 }, { x: 1300 }, { x: 1700 }, { x: 2050 }],
    portals: [
      { x: 70, label: '시작 마을', to: { map: 'map01', x: 1630 } },
      { x: 2330, label: '버섯 군락지', to: { map: 'map03', x: 170 } }
    ]
  },
  map03: {
    id: 'map03', name: '버섯 군락지', width: 2600, spawn: { x: 170 },
    theme: { skyTop: 0xf7b2d9, skyBottom: 0xfff0e0, hill: 0xc58fd6, cloud: 0xfff4fb, groundTint: 0xe6c9ff, decor: 'mushroom', decorGap: 300 },
    platforms: [[550, 370, 220], [1050, 390, 200], [1500, 360, 240], [2100, 380, 200]],
    monsters: [{ x: 550 }, { x: 900 }, { x: 1250 }, { x: 1500, y: 300 }, { x: 1800 }, { x: 2250 }],
    portals: [
      { x: 70, label: '초록 숲', to: { map: 'map02', x: 2230 } },
      { x: 2530, label: '잊힌 유적', to: { map: 'map04', x: 170 } }
    ]
  },
  map04: {
    id: 'map04', name: '잊힌 유적', width: 2800, spawn: { x: 170 },
    theme: { skyTop: 0xe8b77a, skyBottom: 0xfbe7c6, hill: 0xb08d63, cloud: 0xfff2dc, groundTint: 0xc9bca6, decor: 'pillar', decorGap: 340 },
    platforms: [[600, 380, 200], [1000, 350, 180], [1500, 390, 260], [2000, 360, 200], [2400, 380, 180]],
    monsters: [{ x: 600 }, { x: 950 }, { x: 1300 }, { x: 1600 }, { x: 2000, y: 290 }, { x: 2200 }, { x: 2500 }],
    portals: [
      { x: 70, label: '버섯 군락지', to: { map: 'map03', x: 2430 } },
      { x: 2730, label: '망령의 숲', to: { map: 'map05', x: 170 } }
    ]
  },
  map05: {
    id: 'map05', name: '망령의 숲', width: 3000, spawn: { x: 170 },
    theme: { skyTop: 0x2b2344, skyBottom: 0x5b4a7a, hill: 0x3a3152, cloud: 0x8f86b0, groundTint: 0x8c84a8, decor: 'deadtree', decorGap: 280, dark: true },
    platforms: [[550, 380, 200], [1000, 360, 200], [1500, 390, 220], [2000, 360, 220], [2500, 380, 200]],
    monsters: [{ x: 550 }, { x: 850 }, { x: 1200 }, { x: 1500 }, { x: 1800 }, { x: 2100 }, { x: 2400 }, { x: 2700 }],
    portals: [
      { x: 70, label: '잊힌 유적', to: { map: 'map04', x: 2630 } },
      { x: 2930, label: '봉인된 길 (미개방)', to: null }
    ]
  }
};
