// game/match.js
export function checkAndRemoveMatches(heads) {
  if (heads.length < 3) return false;

  let removed = false;
  for (let i = 0; i <= heads.length - 3; i++) {
    if (heads[i].color === heads[i+1].color && heads[i].color === heads[i+2].color) {
      // Remove 3 or more consecutive
      let j = i + 3;
      while (j < heads.length && heads[j].color === heads[i].color) j++;
      heads.splice(i, j - i);
      removed = true;
      // Shake animation on removed heads would go here if desired
      break; // re-check from start
    }
  }
  return removed;
}