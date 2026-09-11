export class AIManager {
  constructor() {
    this.difficulty = 'normal';
  }

  setDifficulty(level) {
    this.difficulty = level || 'normal';
  }

  update(dt, player, enemy) {
    if (!enemy || enemy.isKO || enemy.stunned > 0 || enemy.downTimer > 0 || enemy.attack) {
      enemy.guard = false;
      return null;
    }

    const distance = Math.abs(player.x - enemy.x);
    const dir = player.x >= enemy.x ? 1 : -1;
    const moveSpeed = { easy: 52, normal: 70, hard: 82 }[this.difficulty] || 70;

    enemy.aiTimer -= dt;

    if (distance > 150) {
      enemy.x += dir * moveSpeed * dt;
      enemy.state = 'moving';
      enemy.guard = false;
    } else if (distance < 80) {
      enemy.x -= dir * moveSpeed * dt * 0.45;
      enemy.state = 'moving';
      enemy.guard = false;
    }

    enemy.x = Math.max(210, Math.min(1060, enemy.x));

    if (enemy.aiTimer > 0) {
      if (distance <= 115 && player.attack) {
        enemy.guard = true;
      } else {
        enemy.guard = false;
      }
      return null;
    }

    let choice = null;

    if (distance <= 110 && Math.random() < (this.difficulty === 'easy' ? 0.22 : this.difficulty === 'hard' ? 0.46 : 0.34)) {
      enemy.guard = true;
      enemy.aiTimer = 0.18;
      return null;
    }

    if (distance <= 72) {
      choice = Math.random() < 0.45 ? 'jab' : Math.random() < 0.7 ? 'cross' : 'hook';
    } else if (distance <= 118) {
      choice = Math.random() < 0.58 ? 'hook' : 'uppercut';
    } else {
      choice = Math.random() < 0.52 ? 'cross' : 'jab';
    }

    if (enemy.stamina < 18) {
      enemy.guard = true;
      enemy.aiTimer = 0.22;
      return null;
    }

    enemy.aiTimer = 0.34 + Math.random() * 0.45;
    enemy.guard = false;
    return choice;
  }
}
