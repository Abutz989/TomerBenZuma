// game/input.js
export default class Input {
  constructor(canvas, engine) {
    this.engine = engine;
    // engine.input = this;
    this.angle = 0;
   

    const updateAngle = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - canvas.width/2;
      const y = clientY - rect.top - canvas.height/2;
      this.angle = Math.atan2(y, x);
    };

    const fire = () => {
      if (!engine.gameOver) engine.shooter.fire(this.angle);
    };

    canvas.addEventListener('mousemove', e => updateAngle(e.clientX, e.clientY));
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = e.touches[0];
      updateAngle(t.clientX, t.clientY);
    });

    canvas.addEventListener('click', fire);
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0];
      updateAngle(t.clientX, t.clientY);
      fire();
    });

    // Keep reference for shooter
    // engine.shooter.currentAimAngle = () => this.angle;
  }
}