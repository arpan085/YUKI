export class EffectsManager {
  constructor() {
    this.particles = [];
    this.texts = [];
  }

  spawnParticles(x, y, color = '#ffd77b', count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 2 + Math.random() * 4,
        life: 0.5 + Math.random() * 0.6,
        maxLife: 0.5 + Math.random() * 0.6,
        color
      });
    }
  }

  spawnText(x, y, text, color = '#f4d27a') {
    this.texts.push({ x, y, text, color, life: 0.8, maxLife: 0.8 });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y -= dt * 18;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.restore();

    ctx.save();
    for (const t of this.texts) {
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = '900 18px Arial';
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }
}
