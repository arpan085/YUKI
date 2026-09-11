export class UIManager {
  constructor() {
    this.playerName = document.getElementById('playerName');
    this.enemyName = document.getElementById('enemyName');
    this.roundLabel = document.getElementById('roundLabel');
    this.playerHealthBar = document.getElementById('playerHealthBar');
    this.playerStaminaBar = document.getElementById('playerStaminaBar');
    this.enemyHealthBar = document.getElementById('enemyHealthBar');
    this.enemyStaminaBar = document.getElementById('enemyStaminaBar');
    this.timerLabel = document.getElementById('timerLabel');
    this.comboLabel = document.getElementById('comboLabel');
    this.resultLabel = document.getElementById('resultLabel');
    this.toast = document.getElementById('toast');
    this.touchControls = document.getElementById('touchControls');
    this.hud = document.getElementById('hud');
  }

  setNames(playerName, enemyName) {
    this.playerName.textContent = playerName;
    this.enemyName.textContent = enemyName;
  }

  update(player, opponent, round, timeLeft, combo, resultText = 'FIGHT') {
    this.playerHealthBar.style.width = `${Math.max(0, player.hp)}%`;
    this.playerStaminaBar.style.width = `${Math.max(0, player.stamina)}%`;
    this.enemyHealthBar.style.width = `${Math.max(0, opponent.hp)}%`;
    this.enemyStaminaBar.style.width = `${Math.max(0, opponent.stamina)}%`;
    this.roundLabel.textContent = `ROUND ${round}`;
    this.timerLabel.textContent = `${Math.floor(timeLeft / 60)}:${String(Math.floor(timeLeft % 60)).padStart(2, '0')}`;
    this.comboLabel.textContent = `COMBO x${Math.max(1, combo)}`;
    this.resultLabel.textContent = resultText;
  }

  showHUD(show) {
    this.hud.classList.toggle('hidden', !show);
  }

  setTouchVisible(visible) {
    this.touchControls.classList.toggle('hidden', !visible);
  }

  showToast(text) {
    this.toast.textContent = text;
    this.toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.classList.add('hidden'), 900);
  }

  renderStats() {
    const stats = JSON.parse(localStorage.getItem('ringFuryStats') || JSON.stringify({ wins: 0, losses: 0, kos: 0, knockdowns: 0, bestCombo: 0, totalFights: 0 }));
    const content = document.getElementById('statsContent');
    if (!content) return;
    content.innerHTML = `
      <div class="stats-box"><h3>Wins</h3><strong>${stats.wins}</strong></div>
      <div class="stats-box"><h3>Losses</h3><strong>${stats.losses}</strong></div>
      <div class="stats-box"><h3>KO Count</h3><strong>${stats.kos}</strong></div>
      <div class="stats-box"><h3>Knockdowns</h3><strong>${stats.knockdowns}</strong></div>
      <div class="stats-box"><h3>Best Combo</h3><strong>${stats.bestCombo}</strong></div>
      <div class="stats-box"><h3>Total Fights</h3><strong>${stats.totalFights}</strong></div>
    `;
  }
}
