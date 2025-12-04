// game/collision.js
// Logic moved to Chain class to handle physics better.
// Keeping this function as a proxy if other files import it.
export function insertProjectile(chain, newHead, targetDistance) {
  // This helper is deprecated in favor of chain.insert directly, 
  // but we keep it to prevent breaking imports if any.
  // The logic inside chain.insert handles the array splicing.
  console.warn("Using deprecated insertProjectile wrapper");
}