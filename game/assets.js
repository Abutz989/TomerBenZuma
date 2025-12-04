// game/assets.js
const ASSETS = {
  heads: {
    red:    "assets/heads/head_red.png",
    green:  "assets/heads/head_green.png",
    blue:   "assets/heads/head_blue.png",
    // Added new colors (ensure you have these images or duplicate existing ones to test)
    yellow: "assets/heads/head_yellow.png",
    purple: "assets/heads/head_purple.png"
  },
  shooter:  "assets/shooter.png",
  win:      "assets/win.png",
  lose:     "assets/lose.png",
  sounds: {
    shoot:  "assets/sounds/shoot.wav",
    pop:    "assets/sounds/pop.wav",
    win:    "assets/sounds/win.wav",
    lose:   "assets/sounds/lose.wav"
  },
  
  _loaded: {},
  
  preload() {
    return Promise.all([
      ...Object.values(this.heads).map(src => this._loadImage(src)),
      this._loadImage(this.shooter),
      this._loadImage(this.win),
      this._loadImage(this.lose)
    ]);
  },
  
  _loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this._loaded[src] = img;
        resolve(img);
      };
      // If image missing, resolve null so game doesn't crash
      img.onerror = () => {
        console.warn(`Failed to load: ${src}`);
        resolve(null); 
      }; 
      img.src = src;
    });
  },
  
  getImage(src) {
    return this._loaded[src];
  }
};

export default ASSETS;