export class AIManager {
  constructor() {
    this.difficulty = 'normal';
    this.patternTimer = 0;
    this.pattern = 'press';
  }

  setDifficulty(level) {
    this.difficulty = level || 'normal';
    this.patternTimer = 0;
    this.pattern = 'press';
  }

  update(dt, player, enemy) {
    if (!enemy || enemy.isKO || enemy.stunned > 0 || enemy.downTimer > 0 || enemy.attack) {
      enemy.guard = false;
      return null;
    }

    const distance = Math.abs(player.x - enemy.x);
    const dir = player.x >= enemy.x ? 1 : -1;
    const aggression = { easy: 0.7, normal: 1, hard: 1.28 }[this.difficulty] || 1;
    const moveSpeed = { easy: 52, normal: 72, hard: 88 }[this.difficulty] || 72;

    enemy.aiTimer -= dt;
    this.patternTimer -= dt;

    if (this.patternTimer <= 0) {
      this.pattern = Math.random() < 0.45 ? 'press' : Math.random() < 0.5 ? 'box' : 'circle';
      this.patternTimer = 1.2 + Math.random() * 1.1;
    }

    if (distance > 180) {
      enemy.x += dir * moveSpeed * dt * 1.15;
      enemy.state = 'moving';
      enemy.guard = false;
    } else if (distance < 70) {
      enemy.x -= dir * moveSpeed * dt * 0.7;
      enemy.state = 'moving';
      enemy.guard = false;
    } else if (distance <= 120 && player.attack && Math.random() < 0.35 + aggression * 0.18) {
      enemy.guard = true;
      enemy.state = 'guard';
    } else {
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

    if (distance <= 110 && Math.random() < (this.difficulty === 'easy' ? 0.22 : this.difficulty === 'hard' ? 0.52 : 0.38) * aggression) {
      enemy.guard = true;
      enemy.aiTimer = 0.22 + Math.random() * 0.22;
      return null;
    }

    if (enemy.hp / enemy.maxHp < 0.3) {
      if (distance <= 110) {
        choice = Math.random() < 0.52 ? 'hook' : Math.random() < 0.82 ? 'special' : 'uppercut';
      } else {
        choice = Math.random() < 0.7 ? 'cross' : 'jab';
      }
    } else if (this.pattern === 'press' && distance <= 110) {
      choice = Math.random() < 0.55 ? 'jab' : Math.random() < 0.8 ? 'cross' : 'hook';
    } else if (this.pattern === 'box' && distance <= 118) {
      choice = Math.random() < 0.4 ? 'hook' : 'uppercut';
    } else if (this.pattern === 'circle' && distance > 82) {
      choice = Math.random() < 0.68 ? 'cross' : 'jab';
    } else if (distance <= 72) {
      choice = Math.random() < 0.48 ? 'jab' : Math.random() < 0.72 ? 'cross' : 'hook';
    } else if (distance <= 118) {
      choice = Math.random() < 0.54 ? 'hook' : 'uppercut';
    } else {
      choice = Math.random() < 0.6 ? 'cross' : 'jab';
    }

    if (enemy.stamina < 18) {
      enemy.guard = true;
      enemy.aiTimer = 0.24;
      return null;
    }

    enemy.aiTimer = 0.28 + Math.random() * 0.46;
    enemy.guard = false;
    return choice;
  }
}
