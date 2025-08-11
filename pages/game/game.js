const ASSETS_URL = "../../assets/image";
const ASSETS_SCENES_URL = `${ASSETS_URL}/scenes`;
const ASSETS_PLATFORMS_URL = `${ASSETS_URL}/platforms`;
const ASSETS_ENEMIES_URL = `${ASSETS_URL}/enemies`;
const ASSETS_UI_URL = `${ASSETS_URL}/ui`;
const ASSETS_SOUNDS_URL = "../../assets/sounds";

const BTNS_CHANGE_LEVELS = Array.from(document.querySelectorAll("#change-level-btn"));

function updateLevelButtons() {
  let unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels") || "[1]");

  BTNS_CHANGE_LEVELS.forEach((btn) => {
    const levelNum = parseInt(btn.dataset.level.replace("Level", "").replace("Scene", ""));
    if (unlockedLevels.includes(levelNum)) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  });
}

BTNS_CHANGE_LEVELS.forEach((btn) => {
  btn.addEventListener("click", () => {
    const currentScene = game.scene.getScenes(true)[0];
    currentScene.scene.start(btn.dataset.level);
  });
});

updateLevelButtons(); // ejecuta al inicio
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Scenes
    this.load.image("beach", `${ASSETS_SCENES_URL}/beach.png`);
    this.load.image("night-forest", `${ASSETS_SCENES_URL}/night-forest.png`);
    this.load.image("desert", `${ASSETS_SCENES_URL}/desert.png`);
    this.load.image("cold-night", `${ASSETS_SCENES_URL}/cold-night.png`);
    this.load.image("countryside", `${ASSETS_SCENES_URL}/countryside.png`);

    // Platforms
    this.load.image("grass-platform", `${ASSETS_PLATFORMS_URL}/grass-platform.png`);
    this.load.image("mud-platform", `${ASSETS_PLATFORMS_URL}/mud-platform.png`);
    this.load.image("sand-platform", `${ASSETS_PLATFORMS_URL}/sand-platform.png`);
    this.load.image("ice-platform", `${ASSETS_PLATFORMS_URL}/ice-platform.png`);
    this.load.image("lava-platform", `${ASSETS_PLATFORMS_URL}/lava-platform.png`);

    // Items & enemies
    this.load.image("star", `${ASSETS_URL}/star.png`);
    this.load.image("bomb", `${ASSETS_ENEMIES_URL}/bomb.png`);
    this.load.spritesheet("dude", `${ASSETS_URL}/dude.png`, {
      frameWidth: 32,
      frameHeight: 48,
    });

    // UI
    this.load.image("gameOverImg", `${ASSETS_UI_URL}/game-over.png`);
    this.load.image("levelCompleted", `${ASSETS_UI_URL}/level-completed.png`);
    this.load.image("endGame", `${ASSETS_UI_URL}/end-game.png`);

    // Buttons
    this.load.image("nextLevelBtn", `${ASSETS_UI_URL}/next-level.png`);
    this.load.image("playAgainBtn", `${ASSETS_UI_URL}/play-again.png`);
    this.load.image("restartBtn", `${ASSETS_UI_URL}/restart-btn.png`);

    // Sounds
    this.load.audio("starSound", `${ASSETS_SOUNDS_URL}/star.mp3`);
    this.load.audio("maniacalLaughter", `${ASSETS_SOUNDS_URL}/maniacal-laughter.mp3`);
    this.load.audio("bombExplosion", `${ASSETS_SOUNDS_URL}/bomb-explosion.wav`);
    this.load.audio("winchimes", `${ASSETS_SOUNDS_URL}/winchimes.mp3`);
    this.load.audio("orchestralWin", `${ASSETS_SOUNDS_URL}/orchestral-win.mp3`);
  }

  create() {
    this.scene.start("Level1Scene");
  }
}

class BaseLevel extends Phaser.Scene {
  constructor(key, bgKey, platformKey, nextSceneKey, pointsWin) {
    super({ key });
    this.bgKey = bgKey;
    this.platformKey = platformKey;
    this.nextSceneKey = nextSceneKey || null;
    this.pointsWin = pointsWin;
  }

  create() {
    // Reset state
    this.score = 0;
    this.gameOver = false;

    // Sounds
    this.starSound = this.sound.add("starSound");
    this.maniacalLaughter = this.sound.add("maniacalLaughter");
    this.bombExplosion = this.sound.add("bombExplosion");
    this.winchimes = this.sound.add("winchimes");
    this.orchestralWin = this.sound.add("orchestralWin");

    // Fondo
    this.add.image(450, 300, this.bgKey);

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(450, 600, this.platformKey).setScale(2.5).refreshBody();
    this.platforms.create(650, 400, this.platformKey);
    this.platforms.create(100, 250, this.platformKey);
    this.platforms.create(750, 220, this.platformKey);

    // Player
    this.player = this.physics.add.sprite(100, 450, "dude");
    this.player.setBounce(0.2).setCollideWorldBounds(true);

    // Animations (solo si no existen)
    if (!this.anims.exists("left")) {
      this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({ key: "turn", frames: [{ key: "dude", frame: 4 }], frameRate: 20 });
      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    this.cursors = this.input.keyboard.createCursorKeys();

    // Groups
    this.stars = this.physics.add.group();
    this.spawnStars();

    this.bombs = this.physics.add.group();
    this.spawnBomb();

    this.scoreText = this.add.text(700, 16, "Score: 0", { fontSize: "32px", fill: "#000" });

    // Colliders & overlaps
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
  }

  update() {
    if (this.gameOver) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  spawnStars() {
    if (this.stars) this.stars.clear(true, true);
    const totalStars = 12;
    const spacing = this.sys.game.config.width / totalStars;
    for (let i = 0; i < totalStars; i++) {
      const x = i * spacing + spacing / 2;
      const star = this.stars.create(x, 0, "star");
      star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    }
  }

  spawnBomb() {
    const x =
      this.player && this.player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);
    const bomb = this.bombs.create(x, 16, "bomb");
    bomb.setBounce(1).setCollideWorldBounds(true).setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }

  collectStar(player, star) {
    star.disableBody(true, true);

    // reproducir sonido
    this.starSound.play();

    if (typeof this.score !== "number") this.score = 0;
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    if (this.score >= this.pointsWin) {
      if (!this.nextSceneKey) {
        this.orchestralWin.play();
        this.scene.start("EndGameScene", { score: this.score });
      } else {
        this.winchimes.play();
        this.scene.start("LevelCompleteScene", { nextScene: this.nextSceneKey, bgKey: this.bgKey });
      }
      return;
    }

    if (this.stars.countActive(true) === 0) {
      this.spawnStars();
      this.spawnBomb();
    }
  }

  hitBomb() {
    this.bombExplosion.play();
    this.maniacalLaughter.play();
    this.scene.start("GameOverScene", { score: this.score, crrLevel: this.scene.key });
  }
}

class Level1Scene extends BaseLevel {
  constructor() {
    super("Level1Scene", "beach", "grass-platform", "Level2Scene", 360); // 3 enemigos
  }
}

class Level2Scene extends BaseLevel {
  constructor() {
    super("Level2Scene", "night-forest", "mud-platform", "Level3Scene", 480); // 4 enemigos
  }
}

class Level3Scene extends BaseLevel {
  constructor() {
    super("Level3Scene", "desert", "sand-platform", "Level4Scene", 600); // 5 enemigos
  }
}

class Level4Scene extends BaseLevel {
  constructor() {
    super("Level4Scene", "cold-night", "ice-platform", "Level5Scene", 720); // 6 enemigos
  }
}

class Level5Scene extends BaseLevel {
  constructor() {
    super("Level5Scene", "countryside", "lava-platform", null, 840); // 7 enemigos
  }
}

class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: "LevelCompleteScene" });
  }

  create(data) {
    const bg = data.bgKey;

    this.add.image(450, 300, bg).setOrigin(0.5);
    this.add.image(450, 300, "levelCompleted").setOrigin(0.5);

    // Guardar progreso
    let unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels") || "[1]");
    const nextLevelNum = parseInt(data.nextScene.match(/\d+/)[0]);
    if (!unlockedLevels.includes(nextLevelNum)) {
      unlockedLevels.push(nextLevelNum);
      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    }
    updateLevelButtons();

    const btn = this.add.image(450, 400, "nextLevelBtn").setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      this.sound.stopAll();
      this.scene.start(data.nextScene || "Level1Scene");
    });
  }
}

class EndGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndGameScene" });
  }

  create() {
    this.add.image(450, 300, "countryside").setOrigin(0.5);
    this.add.image(450, 300, "endGame").setOrigin(0.5);

    const btn = this.add.image(450, 400, "playAgainBtn").setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      this.sound.stopAll();
      this.scene.start("Level1Scene");
    });
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }
  create(data) {
    this.add.image(450, 200, "gameOverImg").setOrigin(0.5);
    this.add
      .text(450, 260, "Score: " + (data.score || 0), { fontSize: "24px", fill: "#fff" })
      .setOrigin(0.5);
    const btn = this.add.image(450, 400, "restartBtn").setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      this.sound.stopAll();
      this.scene.start(data.crrLevel);
    });
  }
}

// -------------------- Config y arranque (después de definir las clases) --------------------
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  parent: "game",
  physics: { default: "arcade", arcade: { gravity: { y: 300 }, debug: false } },
  scene: [
    BootScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    Level4Scene,
    Level5Scene,
    LevelCompleteScene,
    EndGameScene,
    GameOverScene,
  ],
};

const game = new Phaser.Game(config);
