export const fighterDefinitions = [
  {
    id: 'rookie',
    role: 'playable',
    name: 'ROOKIE',
    tag: 'Balanced',
    colors: { primary: '#d85663', secondary: '#f5d7af', accent: '#ffd883', glove: '#eef1f8' },
    stats: { power: 1, speed: 1, defense: 1, stamina: 1 },
    aura: '#ffd883',
    artPath: null
  },
  {
    id: 'heavy',
    role: 'playable',
    name: 'HEAVY HITTER',
    tag: 'Power',
    colors: { primary: '#8e60ff', secondary: '#ecd6b5', accent: '#9be0ff', glove: '#f3f7ff' },
    stats: { power: 1.35, speed: 0.86, defense: 0.96, stamina: 0.92 },
    aura: '#9be0ff',
    artPath: null
  },
  {
    id: 'speedster',
    role: 'playable',
    name: 'SPEEDSTER',
    tag: 'Speed',
    colors: { primary: '#2ec8a4', secondary: '#f0d9bf', accent: '#96f0be', glove: '#f0f5ff' },
    stats: { power: 0.92, speed: 1.28, defense: 0.9, stamina: 1.1 },
    aura: '#9ef3c7',
    artPath: null
  },
  {
    id: 'tank',
    role: 'playable',
    name: 'TANK',
    tag: 'Defense',
    colors: { primary: '#f09048', secondary: '#e8d1b9', accent: '#ffd28a', glove: '#f5f7fb' },
    stats: { power: 0.98, speed: 0.82, defense: 1.34, stamina: 1.2 },
    aura: '#ffd28a',
    artPath: null
  },
  {
    id: 'heroine',
    role: 'playable',
    name: 'HEROINE',
    tag: 'Hero',
    colors: { primary: '#ff8bbd', secondary: '#f8dfbb', accent: '#ffd0ea', glove: '#f6f4f7' },
    stats: { power: 1.12, speed: 1.08, defense: 1.04, stamina: 1.16 },
    aura: '#ffd0ea',
    artPath: './villain/heroine.png'
  },
  {
    id: 'villain1',
    role: 'opponent',
    name: 'VILLAIN 1',
    tag: 'Rival',
    colors: { primary: '#d95260', secondary: '#f3ddb0', accent: '#ffd98a', glove: '#f1f4fb' },
    stats: { power: 1.18, speed: 1.04, defense: 0.98, stamina: 1 },
    aura: '#ffb1b5',
    artPath: './villain/1.png'
  },
  {
    id: 'villain2',
    role: 'opponent',
    name: 'VILLAIN 2',
    tag: 'Rival',
    colors: { primary: '#6a6cff', secondary: '#f0d9b6', accent: '#9be0ff', glove: '#f4f8ff' },
    stats: { power: 1.12, speed: 1.08, defense: 1.02, stamina: 0.98 },
    aura: '#a8b8ff',
    artPath: './villain/2.png'
  },
  {
    id: 'villain3',
    role: 'opponent',
    name: 'VILLAIN 3',
    tag: 'Rival',
    colors: { primary: '#f08b4d', secondary: '#f4d6b8', accent: '#ffd98a', glove: '#f7f9fd' },
    stats: { power: 1.2, speed: 0.96, defense: 1.12, stamina: 1.02 },
    aura: '#ffcf9f',
    artPath: './villain/3.png'
  },
  {
    id: 'villain4',
    role: 'opponent',
    name: 'VILLAIN 4',
    tag: 'Rival',
    colors: { primary: '#bf59ce', secondary: '#ebd7b7', accent: '#ffd8f0', glove: '#f3f7ff' },
    stats: { power: 1.1, speed: 1.1, defense: 1.1, stamina: 1.02 },
    aura: '#ffccf0',
    artPath: './villain/4.png'
  },
  {
    id: 'villain5',
    role: 'opponent',
    name: 'VILLAIN 5',
    tag: 'Rival',
    colors: { primary: '#3dc78d', secondary: '#e1d1b9', accent: '#bdf9d0', glove: '#f0f5ff' },
    stats: { power: 1.08, speed: 1.14, defense: 0.96, stamina: 1.08 },
    aura: '#b7ffc9',
    artPath: './villain/5.png'
  }
];

export function createFighter(definition, side, x) {
  return {
    side,
    id: definition.id,
    name: definition.name,
    tag: definition.tag,
    colors: { ...definition.colors },
    stats: { ...definition.stats },
    aura: definition.aura,
    artPath: definition.artPath || null,
    image: null,
    x,
    y: 500,
    facing: side === 'player' ? 1 : -1,
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: 100,
    state: 'idle',
    attack: null,
    guard: false,
    dodgeTimer: 0,
    dodgeCooldown: 0,
    combo: 1,
    comboTimer: 0,
    stunned: 0,
    invulnerable: 0,
    isKO: false,
    turn: 0,
    damageFlash: 0,
    downCounter: 0,
    downTimer: 0,
    lastDecision: 0,
    aiTimer: 0
  };
}
