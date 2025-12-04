// game/shooter.js
import Sound from './sound.js';
import ASSETS from './assets.js';

const SHOOTER_SIZE = 100;
const PROJECTILE_SPEED = 500; // Slower speed feels better for physics check

// Req 5: 5 colors
const COLORS = ['red', 'green', 'blue', 'yellow', 'purple'];

export default class Shooter {
  constructor(engine) {
    this.engine = engine;
    this.queue = [this.randomColor(), this.randomColor()];
    this.angle = 0;
    this.bouncePhase = 0;
    this.projectiles = [];
  }

  randomColor() {
    return COLORS[Math.floor(Math.random()*COLORS.length)];
  }

  fire(angle) {
    if (this.engine.gameOver) return;
    Sound.play('shoot');

    const color = this.queue.shift();
    this.queue.push(this.randomColor());

    const projectile = {
      x: this.engine.canvas.width / 2,
      y: this.engine.canvas.height / 2,
      color,
      vx: Math.cos(angle) * PROJECTILE_SPEED,
      vy: Math.sin(angle) * PROJECTILE_SPEED,
      life: 2
    };

    this.projectiles.push(projectile);
  }

  update(dt) {
    this.bouncePhase += dt * 3;

    for (let i = this.projectiles.length-1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Collision detection radius
      const distFromCenter = Math.hypot(p.x - this.engine.canvas.width/2, p.y - this.engine.canvas.height/2);
      
      // Only check collision if projectile is far enough from shooter
      if (distFromCenter > 30 && (distFromCenter > 250 || p.life <= 0)) {
        
        // Use path raycast with actual dimensions
        const t = this.engine.path.getPointAlongRay(
             p.x, p.y, 
             this.engine.canvas.width, 
             this.engine.canvas.height
        );
        
        const pathLen = this.engine.path.getTotalLength();
        const hitDistance = t * pathLen; // Offset to match visual
        
        // Get actual point to verify strict hit radius
        const hitPoint = this.engine.path.getPointByDistance(hitDistance);
        const actualDist = Math.hypot(
            (hitPoint.x + this.engine.canvas.width/2) - p.x, 
            (hitPoint.y + this.engine.canvas.height/2) - p.y
        );

        // Hit radius: 30px allowance
        if (actualDist < 30) {
           this.engine.chain.insert({color: p.color}, hitDistance);
           this.projectiles.splice(i,1);
           Sound.play('pop'); // Hit sound
        } else if (p.life <= 0) {
           // Missed and died
           this.projectiles.splice(i,1);
        }
      }
    }
  }

  draw(ctx) {
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;
    this.angle = this.engine.input?.angle || 0;

    // Req 6: Aiming Guide (Dashed Line)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);
    
    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    // Animate dash offset
    ctx.lineDashOffset = -Date.now() / 20; 
    ctx.moveTo(40, 0); // Start outside shooter
    ctx.lineTo(800, 0); // Long line
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
    
    // Draw Shooter
    ctx.setLineDash([]); // Reset dash
    const img = ASSETS.getImage(ASSETS.shooter);
    const scale = 1 + Math.sin(this.bouncePhase) * 0.07;
    ctx.scale(scale, scale);
    if(img) {
        ctx.drawImage(img, -SHOOTER_SIZE/2, -SHOOTER_SIZE/2, SHOOTER_SIZE, SHOOTER_SIZE);
    } else {
        // Fallback
        ctx.fillStyle = '#ccc';
        ctx.fillRect(-30, -30, 60, 60);
    }
    
    // Draw Current Projectile (loaded)
    const currentBallImg = ASSETS.getImage(ASSETS.heads[this.queue[0]]);
    if (currentBallImg) {
        ctx.drawImage(currentBallImg, -15, -15, 30, 30); // Smaller ball inside shooter
    }

    ctx.restore(); // Undo rotation/translation

    // Drawing Active Projectiles
    this.projectiles.forEach(p => {
        const pImg = ASSETS.getImage(ASSETS.heads[p.color]);
        if (pImg) {
            ctx.drawImage(pImg, p.x - 20, p.y - 20, 40, 40);
        } else {
            ctx.fillStyle = p.color;
            ctx.beginPath(); 
            ctx.arc(p.x, p.y, 20, 0, Math.PI*2); 
            ctx.fill();
        }
    });

    // Req 2: Next Head Preview (Fixed to side of screen)
    // Draw at Bottom Right
    const previewSize = 50;
    const margin = 20;
    const px = ctx.canvas.width - previewSize - margin;
    const py = ctx.canvas.height - previewSize - margin;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(px + previewSize/2, py + previewSize/2, previewSize/2 + 5, 0, Math.PI*2);
    ctx.fill();

    const nextImg = ASSETS.getImage(ASSETS.heads[this.queue[1]]); // Queue[1] is next
    if (nextImg) {
        ctx.drawImage(nextImg, px, py, previewSize, previewSize);
    }
    
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("NEXT", px + previewSize/2, py - 5);
  }
}