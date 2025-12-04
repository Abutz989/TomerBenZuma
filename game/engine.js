// game/engine.js
import Input from './input.js';
import ZumaPath from './zumaPath.js';
import Chain from './chain.js';
import Shooter from './shooter.js';
import Sound from './sound.js';
import ASSETS from './assets.js';

export default class Engine {
  constructor(canvas, ctx) {
  this.canvas = canvas;
  this.ctx = ctx;
  this.input = new Input(canvas, this);
  this.path = new ZumaPath();
  this.chain = new Chain(this.path);
  this.shooter = new Shooter(this);
  this.gameOver = false;
  this.victory = false;

  Sound.preload();
  ASSETS.preload().then(() => {  // ✅ Wait for images
    this.lastTime = 0;
    requestAnimationFrame(this.loop.bind(this));
  });
}

  reset() {
    this.chain = new Chain(this.path);
    this.shooter = new Shooter(this);
    this.gameOver = false;
    this.victory = false;
    document.getElementById('overlay').classList.remove('show');
  }

  showResult(win) {
    this.gameOver = true;
    this.victory = win;
    const img = document.getElementById('resultImage');
    img.src = win ? ASSETS.win : ASSETS.lose;
    Sound.play(win ? 'win' : 'lose');

    // Confetti for win
    if (win) this.createConfetti();

    document.getElementById('overlay').classList.add('show');
  }

  createConfetti() {
    for (let i = 0; i < 80; i++) {
      const div = document.createElement('div');
      div.className = 'confetti';
      div.style.left = Math.random() * 100 + 'vw';
      div.style.background = ['#f00','#0f0','#00f','#ff0','#f0f'][i%5];
      div.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 5000);
    }
  }

  update(dt) {
    if (this.gameOver) return;
    this.chain.update(dt);
    this.shooter.update(dt);

    if (this.chain.reachedEnd()) {
      this.showResult(false);
    } else if (this.chain.isEmpty()) {
      this.showResult(true);
    }
  }

  draw() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    this.path.draw(this.ctx);
    this.chain.draw(this.ctx);
    this.shooter.draw(this.ctx);
  }

  loop(time) {
    if (!this.lastTime) this.lastTime = time;
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }
}

// Play Again button
document.getElementById('playAgain').addEventListener('click', () => {
  window.engine.reset();
});
window.engine = window.engine || null; // expose for button