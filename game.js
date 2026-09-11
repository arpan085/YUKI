import { fighterDefinitions, createFighter } from './fighters.js';
import { EffectsManager } from './effects.js';
import { AudioManager } from './audio.js';
import { InputHandler } from './input.js';
import { AIManager } from './ai.js';
import { UIManager } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = new UIManager();
const audio = new AudioManager();
const input = new InputHandler();
const ai = new AIManager();
const effects = new EffectsManager();

const SETTINGS_KEY = 'ringFurySettings';
const STATS_KEY = 'ringFuryStats';

const defaultSettings = {
  master: 0.8,
  sfx: 0.8,
  music: 0.5,
  difficulty: 'normal',
  screenShake: true,
  particles: true,
  performanceMode: false
};

const defaultStats = {
  wins: 0,
  losses: 0,
  kos: 0,
  knockdowns: 0,
  bestCombo: 0,
  totalFights: 0
};

const fighterArtCache = new Map();

const state = {
  settings: { ...defaultSettings },
  stats: { ...defaultStats },
  selectedFighter: 'rookie',
  enemyDefinition: 'heavy',
  timer: 90,
  battleActive: false,
  resultOutcome: null,
  player: null,
  enemy: null,
  lastTimestamp: 0,
  gameOver: false,
  shakeAmount: 0
};

const attackMap = {
  jab: { damage: 9, range: 82, cost: 8, hitWindow: 0.18, label: 'JAB' },
  cross: { damage: 14, range: 92, cost: 12, hitWindow: 0.2, label: 'CROSS' },
  hook: { damage: 18, range: 102, cost: 16, hitWindow: 0.23, label: 'HOOK' },
  uppercut: { damage: 22, range: 108, cost: 18, hitWindow: 0.26, label: 'UPPERCUT' }
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    state.settings = { ...defaultSettings, ...saved };
  } catch {
    state.settings = { ...defaultSettings };
  }

  try {
    const savedStats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    state.stats = { ...defaultStats, ...savedStats };
  } catch {
    state.stats = { ...defaultStats };
  }
}

function getArtForDefinition(definition) {
  if (!definition || !definition.artPath) {
    return null;
  }

  if (!fighterArtCache.has(definition.id)) {
    const image = new Image();
    image.src = definition.artPath;
    fighterArtCache.set(definition.id, image);
  }

  return fighterArtCache.get(definition.id);
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function saveStats() {
  localStorage.setItem(STATS_KEY, JSON.stringify(state.stats));
}

function isTouchDevice() {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return coarse || 'ontouchstart' in window;
}

function initControls() {
  document.querySelectorAll('[data-screen]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.screen;
      if (target === 'fighterSelect') {
        showFighterSelect();
      } else if (target === 'settings') {
        showSettingsScreen();
      } else if (target === 'stats') {
        showStatsScreen();
      } else {
        showScreen(target);
      }
    });
  });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      switch (action) {
        case 'resume':
          resumeBattle();
          break;
        case 'restart':
          startBattle(state.selectedFighter);
          break;
        case 'settings':
          showSettingsScreen();
          break;
        case 'menu':
          returnToMenu();
          break;
        default:
          break;
      }
    });
  });

  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.close;
      if (target === 'fighterSelect' || target === 'howTo' || target === 'settings' || target === 'stats') {
        showScreen('menuOverlay');
      }
    });
  });

  document.getElementById('masterVolume').addEventListener('input', (event) => {
    state.settings.master = Number(event.target.value) / 100;
    applyAudioSettings();
  });

  document.getElementById('sfxVolume').addEventListener('input', (event) => {
    state.settings.sfx = Number(event.target.value) / 100;
    applyAudioSettings();
  });

  document.getElementById('musicVolume').addEventListener('input', (event) => {
    state.settings.music = Number(event.target.value) / 100;
    applyAudioSettings();
  });

  document.getElementById('difficultySelect').addEventListener('change', (event) => {
    state.settings.difficulty = event.target.value;
    ai.setDifficulty(state.settings.difficulty);
    saveSettings();
  });

  document.getElementById('screenShakeToggle').addEventListener('change', (event) => {
    state.settings.screenShake = event.target.checked;
    saveSettings();
  });

  document.getElementById('particlesToggle').addEventListener('change', (event) => {
    state.settings.particles = event.target.checked;
    saveSettings();
  });

  document.getElementById('performanceToggle').addEventListener('change', (event) => {
    state.settings.performanceMode = event.target.checked;
    saveSettings();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.battleActive) {
      event.preventDefault();
      showScreen('pauseScreen');
      state.battleActive = false;
      ui.showHUD(false);
      ui.showToast('Paused');
    }
  });
}

function applyAudioSettings() {
  audio.applySettings({
    master: state.settings.master,
    sfx: state.settings.sfx,
    music: state.settings.music
  });
  saveSettings();
}

function syncSettingsControls() {
  document.getElementById('masterVolume').value = Math.round(state.settings.master * 100);
  document.getElementById('sfxVolume').value = Math.round(state.settings.sfx * 100);
  document.getElementById('musicVolume').value = Math.round(state.settings.music * 100);
  document.getElementById('difficultySelect').value = state.settings.difficulty;
  document.getElementById('screenShakeToggle').checked = state.settings.screenShake;
  document.getElementById('particlesToggle').checked = state.settings.particles;
  document.getElementById('performanceToggle').checked = state.settings.performanceMode;
}

function showScreen(screenId) {
  const screens = [
    'menuOverlay',
    'fighterSelectScreen',
    'howToScreen',
    'settingsScreen',
    'statsScreen',
    'pauseScreen',
    'resultScreen'
  ];

  screens.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.classList.toggle('hidden', id !== screenId);
  });

  if (screenId !== 'pauseScreen' && screenId !== 'resultScreen') {
    ui.showHUD(false);
  }
}

function showFighterSelect() {
  renderFighterCards();
  showScreen('fighterSelectScreen');
}

function showSettingsScreen() {
  syncSettingsControls();
  showScreen('settingsScreen');
}

function showStatsScreen() {
  ui.renderStats();
  showScreen('statsScreen');
}

function returnToMenu() {
  state.battleActive = false;
  state.gameOver = false;
  ui.showHUD(false);
  showScreen('menuOverlay');
}

function resumeBattle() {
  state.battleActive = true;
  ui.showHUD(true);
  showScreen(null);
}

function renderFighterCards() {
  const fighterGrid = document.getElementById('fighterGrid');
  const selectableFighters = fighterDefinitions.filter((fighter) => fighter.role !== 'opponent');

  fighterGrid.innerHTML = selectableFighters
    .map((fighter) => {
      const portraitStyle = fighter.artPath
        ? `background-image: url('${fighter.artPath}'); background-size: cover; background-position: center;`
        : `background: linear-gradient(135deg, ${fighter.colors.primary}, ${fighter.colors.secondary});`;

      return `
        <button class="fighter-card ${fighter.id === state.selectedFighter ? 'active' : ''}" data-fighter="${fighter.id}" type="button">
          <div class="fighter-card-header">
            <h3>${fighter.name}</h3>
            <span class="tag">${fighter.tag}</span>
          </div>
          <div class="portrait" style="${portraitStyle}"></div>
            <div><strong>Speed</strong>${fighter.stats.speed.toFixed(2)}x</div>
            <div><strong>Defense</strong>${fighter.stats.defense.toFixed(2)}x</div>
            <div><strong>Stamina</strong>${fighter.stats.stamina.toFixed(2)}x</div>
          </div>
        </button>
      `;
    })
    .join('');

  fighterGrid.querySelectorAll('.fighter-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedFighter = card.dataset.fighter;
      renderFighterCards();
      startBattle(state.selectedFighter);
    });
  });
}

function startBattle(selectedFighterId) {
  const playerDefinition = fighterDefinitions.find((fighter) => fighter.id === selectedFighterId) || fighterDefinitions[0];
  const enemyCandidates = fighterDefinitions.filter((fighter) => fighter.role === 'opponent');
  const rareEnemy = enemyCandidates.find((fighter) => fighter.id === 'villain6');
  const regularEnemies = enemyCandidates.filter((fighter) => fighter.id !== 'villain6');
  const enemyDefinition = Math.random() < 0.18 && rareEnemy
    ? rareEnemy
    : regularEnemies[Math.floor(Math.random() * regularEnemies.length)] || rareEnemy || fighterDefinitions.find((fighter) => fighter.id === 'villain1');

  state.player = createFighter(playerDefinition, 'player', 300);
  state.enemy = createFighter(enemyDefinition, 'enemy', 980);
  state.player.image = getArtForDefinition(playerDefinition);
  state.enemy.image = getArtForDefinition(enemyDefinition);
  state.playerName = playerDefinition.name;
  state.enemyName = enemyDefinition.name;
  state.battleActive = true;
  state.gameOver = false;
  state.resultOutcome = null;
  state.timer = 90;
  state.shakeAmount = 0;

  ai.setDifficulty(state.settings.difficulty);
  ui.setNames(playerDefinition.name, enemyDefinition.name);
  ui.showHUD(true);
  ui.setTouchVisible(isTouchDevice());
  audio.ensure();
  audio.playSfx('bell');
  showScreen(null);
}

function resetBattleState() {
  state.player = null;
  state.enemy = null;
  state.battleActive = false;
  state.gameOver = false;
  state.timer = 90;
}

function attemptAttack(attacker, defender, attackType) {
  if (!state.battleActive || attacker.isKO || defender.isKO || attacker.attack || attacker.downTimer > 0 || defender.downTimer > 0) {
    return false;
  }

  const attackData = attackMap[attackType];
  if (!attackData) return false;

  const distance = Math.abs(attacker.x - defender.x);
  if (distance > attackData.range + 20) {
    return false;
  }

  if (attacker.stamina < attackData.cost) {
    ui.showToast('Low stamina');
    return false;
  }

  attacker.stamina = Math.max(0, attacker.stamina - attackData.cost);
  attacker.attack = {
    type: attackType,
    timer: attackData.hitWindow,
    damage: attackData.damage,
    range: attackData.range
  };
  attacker.state = attackType;
  attacker.attackCooldown = attackData.hitWindow;

  let blocked = defender.guard && distance < 110;
  let dodgeSuccess = defender.dodgeTimer > 0 && distance < 120;

  if (dodgeSuccess) {
    defender.dodgeTimer = 0;
    effects.spawnText(defender.x, defender.y - 36, 'DODGE!', '#9ae6ff');
    audio.playSfx('dodge');
    defender.x += attacker.facing > 0 ? -42 : 42;
    return true;
  }

  let damage = attackData.damage * attacker.stats.power * (attackData.type === 'uppercut' ? 1.08 : 1);
  if (blocked) {
    const reduction = defender.stats.defense * (attackType === 'uppercut' ? 0.45 : 0.65);
    damage *= Math.max(0.18, 1 - reduction * 0.35);
    audio.playSfx('block');
    effects.spawnText(defender.x, defender.y - 54, 'BLOCK!', '#f7d97d');
  }

  damage *= (1 + (Math.random() * 0.18 - 0.09));
  damage = Math.max(2, Math.round(damage));

  defender.hp = Math.max(0, defender.hp - damage);
  defender.damageFlash = 0.15;
  defender.stunned = Math.max(defender.stunned, 0.12);
  defender.combo = 1;

  if (attacker === state.player) {
    attacker.combo = Math.min(9, attacker.combo + 1);
    attacker.comboTimer = 1.25;
    state.stats.bestCombo = Math.max(state.stats.bestCombo, attacker.combo);
  }

  effects.spawnParticles(defender.x, defender.y - 28, blocked ? '#9ac5ff' : '#ffcf73', blocked ? 10 : 18);
  effects.spawnText(defender.x, defender.y - 60, `-${damage}`, blocked ? '#8ec5ff' : '#ffd77b');

  audio.playSfx(attackType);
  audio.playSfx('hit');

  if (defender.hp <= 0) {
    defender.isKO = true;
    attacker.combo = 1;
    endBattle(attacker === state.player ? 'player' : 'enemy', 'KO');
  }

  return true;
}

function handleInput(dt) {
  if (!state.battleActive || !state.player || !state.enemy) return;

  const player = state.player;
  const enemy = state.enemy;

  if (input.consume('pause')) {
    state.battleActive = false;
    ui.showHUD(false);
    showScreen('pauseScreen');
    return;
  }

  const moveDir = (input.isHeld('left') ? -1 : 0) + (input.isHeld('right') ? 1 : 0);
  if (moveDir !== 0 && !player.isKO) {
    player.x += moveDir * 172 * dt;
  }

  player.guard = input.isHeld('block');
  if (input.consume('dodge')) {
    player.dodgeTimer = 0.4;
    player.x += player.facing > 0 ? -44 : 44;
    audio.playSfx('dodge');
  }

  if (input.consume('jab')) attemptAttack(player, enemy, 'jab');
  if (input.consume('cross')) attemptAttack(player, enemy, 'cross');
  if (input.consume('hook')) attemptAttack(player, enemy, 'hook');
  if (input.consume('uppercut')) attemptAttack(player, enemy, 'uppercut');

  player.x = Math.max(210, Math.min(1060, player.x));
  state.enemy.x = Math.max(210, Math.min(1060, state.enemy.x));
}

function updateEnemy(dt) {
  const enemy = state.enemy;
  const player = state.player;

  if (!enemy || !player || !state.battleActive) return;

  if (enemy.isKO) return;

  const moveChoice = ai.update(dt, player, enemy);
  if (moveChoice) {
    attemptAttack(enemy, player, moveChoice);
  }

  if (enemy.attack) {
    enemy.attack.timer -= dt;
    if (enemy.attack.timer <= 0) {
      enemy.attack = null;
    }
  }

  if (enemy.comboTimer > 0) {
    enemy.comboTimer -= dt;
    if (enemy.comboTimer <= 0) enemy.combo = 1;
  }
}

function updateFighter(dt, fighter) {
  if (!fighter) return;

  fighter.stamina = Math.min(fighter.maxStamina, fighter.stamina + dt * 10);
  fighter.damageFlash = Math.max(0, fighter.damageFlash - dt);
  fighter.dodgeTimer = Math.max(0, fighter.dodgeTimer - dt);
  fighter.stunned = Math.max(0, fighter.stunned - dt);
  fighter.invulnerable = Math.max(0, fighter.invulnerable - dt);
  fighter.comboTimer = Math.max(0, fighter.comboTimer - dt);
  fighter.attackCooldown = Math.max(0, fighter.attackCooldown - dt);

  if (fighter.comboTimer <= 0) {
    fighter.combo = 1;
  }

  if (fighter.attack) {
    fighter.attack.timer -= dt;
    if (fighter.attack.timer <= 0) {
      fighter.attack = null;
    }
  }

  if (fighter.guard && fighter.stamina <= 0) {
    fighter.guard = false;
  }

  if (fighter.downTimer > 0) {
    fighter.downTimer -= dt;
    if (fighter.downTimer <= 0) {
      fighter.guard = false;
      fighter.state = 'idle';
    }
  }
}

function updateBattle(dt) {
  if (!state.battleActive || !state.player || !state.enemy) return;

  state.timer = Math.max(0, state.timer - dt);

  handleInput(dt);

  updateFighter(dt, state.player);
  updateEnemy(dt);
  updateFighter(dt, state.enemy);

  if (state.settings.particles) {
    effects.update(dt);
  }

  ui.update(
    state.player,
    state.enemy,
    1,
    state.timer,
    state.player.combo,
    state.player.hp > state.enemy.hp ? 'PRESSURE' : 'FIGHT'
  );

  if (state.timer <= 0) {
    if (state.player.hp === state.enemy.hp) {
      endBattle('draw', 'Draw');
    } else {
      endBattle(state.player.hp > state.enemy.hp ? 'player' : 'enemy', 'Time');
    }
  }
}

function endBattle(winner, reason) {
  if (state.gameOver) return;
  state.gameOver = true;
  state.battleActive = false;
  state.resultOutcome = winner;

  if (winner === 'player') {
    state.stats.wins += 1;
    state.stats.totalFights += 1;
    ui.showToast('Victory');
    audio.playSfx('win');
    document.getElementById('resultTitle').textContent = 'PLAYER WINS';
    document.getElementById('resultText').textContent = reason === 'KO' ? 'You finished the fight with a decisive knockout.' : 'You won on points after the final bell.';
  } else if (winner === 'enemy') {
    state.stats.losses += 1;
    state.stats.totalFights += 1;
    ui.showToast('Defeat');
    audio.playSfx('loss');
    document.getElementById('resultTitle').textContent = 'PLAYER LOSES';
    document.getElementById('resultText').textContent = reason === 'KO' ? 'The opponent took the fight by knockout.' : 'The timer expired and the decision went against you.';
  } else {
    state.stats.totalFights += 1;
    ui.showToast('Draw');
    document.getElementById('resultTitle').textContent = 'DRAW';
    document.getElementById('resultText').textContent = 'The fight ended even after the full time limit.';
  }

  if (winner === 'player' && state.player.hp > 0) {
    state.stats.kos += state.enemy.hp <= 0 ? 1 : 0;
  }

  if (winner === 'player') {
    state.stats.knockdowns += state.enemy.hp <= 0 ? 1 : 0;
  }

  saveStats();
  ui.renderStats();
  showScreen('resultScreen');
  ui.showHUD(false);
}

function update(dt) {
  if (state.settings.particles) {
    effects.update(dt);
  }

  updateBattle(dt);

  if (!state.battleActive && !state.gameOver) {
    if (state.settings.particles) {
      effects.update(dt * 0.5);
    }
  }
}

function drawBackground() {
  const w = canvas.width;
  const h = canvas.height;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0d1930');
  sky.addColorStop(0.38, '#162844');
  sky.addColorStop(1, '#0f1c2e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 20; i++) {
    const x = (i * 77) % w;
    const y = 40 + (i % 6) * 18;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = '#5f4a33';
  ctx.fillRect(0, 420, w, 20);

  ctx.fillStyle = '#8d5f2a';
  ctx.fillRect(0, 440, w, 140);

  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(110, 460);
  ctx.lineTo(w - 110, 460);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(140, 500);
  ctx.lineTo(w - 140, 500);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(170, 540);
  ctx.lineTo(w - 170, 540);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 30; i++) {
    const x = (i * 52) % w;
    const y = 230 + (i % 4) * 30;
    ctx.fillRect(x, y, 56, 10);
  }
}

function drawFighter(fighter) {
  if (!fighter) return;

  const x = fighter.x;
  const y = fighter.y;
  const facing = fighter.facing;
  const shadowX = x;

  ctx.save();
  ctx.translate(shadowX, y + 16);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 56, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  if (fighter.image && fighter.image.complete) {
    ctx.drawImage(fighter.image, -82, -150, 164, 250);
  } else {
    if (fighter.damageFlash > 0) {
      ctx.fillStyle = `rgba(255, 180, 180, ${fighter.damageFlash * 1.5})`;
      ctx.fillRect(-60, -90, 120, 150);
    }

    ctx.strokeStyle = fighter.colors.glove;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.lineTo(-18, 52);
    ctx.moveTo(0, 26);
    ctx.lineTo(18, 52);
    ctx.stroke();

    ctx.fillStyle = fighter.colors.primary;
    ctx.fillRect(-24, -18, 48, 72);

    ctx.fillStyle = fighter.colors.secondary;
    ctx.fillRect(-22, -60, 44, 42);

    ctx.fillStyle = fighter.colors.accent;
    ctx.beginPath();
    ctx.arc(0, -76, 23, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(-28, 54, 16, 48);
    ctx.fillRect(12, 54, 16, 48);

    ctx.fillStyle = fighter.colors.glove;
    ctx.fillRect(-38, 90, 18, 12);
    ctx.fillRect(20, 90, 18, 12);
  }

  if (fighter.guard) {
    ctx.strokeStyle = '#9be0ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -12, 42, Math.PI * 0.17, Math.PI * 0.83);
    ctx.stroke();
  }

  if (fighter.attack) {
    ctx.fillStyle = '#ffe3a0';
    ctx.fillRect((facing > 0 ? 18 : -48), 6, 30, 16);
  }

  if (fighter.aura) {
    ctx.strokeStyle = fighter.aura;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -12, 54, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (state.player) drawFighter(state.player);
  if (state.enemy) drawFighter(state.enemy);

  effects.draw(ctx);

  ctx.fillStyle = 'rgba(10, 17, 28, 0.7)';
  ctx.fillRect(28, 28, 200, 54);
  ctx.fillStyle = '#f9d77a';
  ctx.font = '900 22px Arial';
  ctx.fillText(`ROUND 1`, 46, 62);

  ctx.fillStyle = 'rgba(10, 17, 28, 0.7)';
  ctx.fillRect(canvas.width - 230, 28, 200, 54);
  ctx.fillStyle = '#7ec7ff';
  ctx.font = '900 22px Arial';
  ctx.fillText(`TIME ${Math.ceil(state.timer)}`, canvas.width - 196, 62);
}

function loop(timestamp) {
  const dt = Math.min(0.033, (timestamp - state.lastTimestamp || 16) / 1000);
  state.lastTimestamp = timestamp;

  update(dt);
  render();

  requestAnimationFrame(loop);
}

function init() {
  loadSettings();
  applyAudioSettings();
  syncSettingsControls();
  ui.renderStats();
  ui.setTouchVisible(isTouchDevice());
  renderFighterCards();
  initControls();
  showScreen('menuOverlay');
  resetBattleState();
  requestAnimationFrame(loop);
}

init();
