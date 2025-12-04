// game/zumaPath.js
export default class ZumaPath {
  constructor() {
    this.points = [];
    this.totalLength = 0;

    // --- CONFIGURATION FOR OVAL SPIRAL ---
    const loops = 2.5;            // How many times it spirals
    const startRadius = 500;      // How wide it starts (outside screen)
    const endRadius = 100;         // How small the center hole is
    const steps = 1500;            // Resolution of the curve
    const stretchX = 1.1;         // Horizontal stretch (makes it Oval)
    const stretchY = 0.8;         // Vertical squash
    // -------------------------------------

    let prevX = null;
    let prevY = null;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // 0 to 1
      
      // Angle: Starts at PI (left) and spirals inward
      const angle = Math.PI + (t * Math.PI * 2 * loops);
      
      // Radius: Linear interpolation from Start to End
      const currentRadius = startRadius - (t * (startRadius - endRadius));

      // Oval Math
      const x = Math.cos(angle) * currentRadius * stretchX;
      const y = Math.sin(angle) * currentRadius * stretchY;

      // Calculate distance for constant speed movement
      if (prevX !== null) {
        const dist = Math.hypot(x - prevX, y - prevY)
        this.totalLength += dist;
      }

      this.points.push({ x, y, dist: this.totalLength });
      prevX = x;
      prevY = y;
    }
  }

  getPointByDistance(distance) {
    if (distance < 0) return this.points[0];
    if (distance >= this.totalLength) return this.points[this.points.length - 1];

    // Simple linear scan (optimized for stability)
    for(let i = 0; i < this.points.length - 1; i++) {
      if (distance >= this.points[i].dist && distance < this.points[i+1].dist) {
        return this.points[i]; // Return exact point for smoother look
      }
    }
    return this.points[this.points.length-1];
  }

  getTotalLength() {
    return this.totalLength;
  }

  // Draw the path AND the "Exit Hole"
  draw(ctx) {
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;

    // 1. Draw The Track
    ctx.strokeStyle = '#d8d0d0ff'; // Dark grey track
    ctx.lineWidth = 45; 
    ctx.lineCap = 'round';
    ctx.beginPath();
    this.points.forEach((p,i) => {
      if (i===0) ctx.moveTo(p.x + cx, p.y + cy);
      else ctx.lineTo(p.x + cx, p.y + cy);
    });
    ctx.stroke();

    // 2. Draw Center Hole (The "Lose" Zone)
    const endP = this.points[this.points.length-1];
    ctx.fillStyle = '#ff0000ff'; // Black hole
    ctx.beginPath();
    ctx.arc(endP.x + cx, endP.y + cy, 35, 0, Math.PI*2);
    ctx.fill();

    // Skull/Danger icon (optional simple drawing)
    ctx.fillStyle = '#f00';
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("☠️", endP.x + cx, endP.y + cy + 7);
  }

  getPointAlongRay(x, y, canvasWidth, canvasHeight) {
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    let bestDist = Infinity;
    let bestT = 0;

    for(let i=0; i<this.points.length; i++) {
      const p = this.points[i];
      const d = Math.hypot((p.x + cx) - x, (p.y + cy) - y);
      if (d < bestDist) {
        bestDist = d;
        bestT = p.dist / this.totalLength;
      }
    }
    return bestT;
  }
}