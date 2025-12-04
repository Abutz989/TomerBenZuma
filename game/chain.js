// game/chain.js
import { checkAndRemoveMatches } from './match.js';
import Sound from './sound.js';
import ASSETS from './assets.js';

// Req 5: Five distinct colors
const COLORS = ['red', 'green', 'blue', 'yellow', 'purple'];
const HEAD_SIZE = 40; 
const SPACING = 40; // Strictly 40 to ensure touching but no overlap

export default class Chain {
  constructor(path) {
    this.path = path;
    this.heads = [];
    
    // --- [RULE] DIFFICULTY SETTINGS ---
    this.speed = 10;       // Speed in pixels per second
    const startCount = 30; // How many balls start in the chain

    // --- FIX 1: Correct Chain Initialization ---
    // Start the first ball (index 0) at a distance visible on the path, 
    // and place subsequent balls exactly one spacing behind it.
    const initialHeadDistance = 800; // Start 400 pixels along the path.
    // ------------------------------------------

    for (let i = 0; i < startCount; i++) {
      const color = COLORS[Math.floor(Math.random()*COLORS.length)];
      // Distance starts high for index 0 (the leader) and decreases.
      const distance = initialHeadDistance - (i * SPACING);
      this.heads.push({ color, distance });
    }
    // Note: No need for sorting if distances are calculated in descending order.
  }

  update(dt) {
    if (this.heads.length === 0) return;

    // 1. Move the LEADING head (index 0) forward
    this.heads[0].distance += this.speed * dt;

    // 2. FIX 2: Force TIGHT adjacent spacing for the rest of the chain
    // This strictly ensures balls do not overlap and prevents them from jumping
    // when a gap is closed after a match removal.
    for (let i = 1; i < this.heads.length; i++) {
        const leader = this.heads[i-1];
        const follower = this.heads[i];
        
        // Follower's position is forced to be exactly one SPACING behind its leader.
        follower.distance = leader.distance - SPACING;
    }

    // 3. Check Matches
    while (checkAndRemoveMatches(this.heads)) {
      Sound.play('pop');
    }
  }

  // Req 4: Shot ball settles and pushes
  insert(head, hitDistance) {
    // 1. Find insertion index (list sorted by distance descending)
    let insertIndex = this.heads.length;
    for(let i=0; i<this.heads.length; i++) {
        // Find the first head that the projectile has *passed*
        if (hitDistance > this.heads[i].distance) {
            insertIndex = i;
            break;
        }
    }

    // 2. Insert the ball
    const newHead = { ...head, distance: hitDistance };
    this.heads.splice(insertIndex, 0, newHead);

    // 3. Resolve Overlap / Push adjacent balls immediately

    // Align the new head relative to the one in front (if it exists)
    if (insertIndex > 0) {
        const front = this.heads[insertIndex - 1];
        // If the new ball overlapped, push it back to touch the one in front
        if (newHead.distance > front.distance - SPACING) {
            newHead.distance = front.distance - SPACING;
        }
    }

    // Push everything behind the new head backwards to maintain spacing
    for (let i = insertIndex + 1; i < this.heads.length; i++) {
        const prev = this.heads[i-1];
        // Force the current ball to be exactly one SPACING behind the one in front of it
        if (this.heads[i].distance > prev.distance - SPACING) {
            this.heads[i].distance = prev.distance - SPACING;
        }
    }
  }

  // LOSE CONDITION
  reachedEnd() {
    return this.heads.length > 0 && this.heads[0].distance >= this.path.getTotalLength();
  }

  // WIN CONDITION
  isEmpty() {
    return this.heads.length === 0;
  }

  draw(ctx) {
    const offsetX = ctx.canvas.width / 2;
    const offsetY = ctx.canvas.height / 2;

    for (let i = this.heads.length - 1; i >= 0; i--) {
      const head = this.heads[i];
      const point = this.path.getPointByDistance(head.distance);
      
      if (!point || head.distance < 0) continue; // Don't draw if off-screen/before start

      const img = ASSETS.getImage(ASSETS.heads[head.color]);
      
      if (img) {
          ctx.drawImage(img,
            point.x + offsetX - HEAD_SIZE/2,
            point.y + offsetY - HEAD_SIZE/2,
            HEAD_SIZE, HEAD_SIZE
          );
      } else {
          // Fallback if image not loaded yet
          ctx.fillStyle = head.color;
          ctx.beginPath();
          ctx.arc(point.x + offsetX, point.y + offsetY, HEAD_SIZE/2 - 2, 0, Math.PI*2);
          ctx.fill();
      }
    }
  }
}