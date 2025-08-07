const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

let player;
let stars;
let bombs;
let platforms;
let cursors;
let score = 0;
let currentLevel = 1;
let gameOver = false;

let scoreText;
let gameOverText;
let restartButton;
let gameOverOverlay;

let game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "../assets/image/sky.png");
  this.load.image("ground", "../assets/image/platform.png");
  this.load.image("star", "../assets/image/star.png");
  this.load.image("bomb", "../assets/image/bomb.png");
  this.load.spritesheet("dude", "../assets/image/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });

  // ui
  this.load.image("restartBtn", "../assets/image/ui/restart-btn.png");
  this.load.image("gameOverImg", "../assets/image/ui/game-over.png");
}

function create() {
  this.add.image(400, 300, "sky");

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 590, "ground").setScale(2.5).refreshBody();
  platforms.create(650, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  player = this.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();

  const totalStars = 12;
  const spacing = config.width / totalStars;

  stars = this.physics.add.group();

  for (let i = 0; i < totalStars; i++) {
    const x = i * spacing + spacing / 2;
    const star = stars.create(x, 0, "star");
    star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  }

  bombs = this.physics.add.group();

  let initialBomb = bombs.create(Phaser.Math.Between(100, 800), 16, "bomb");
  initialBomb.setBounce(1);
  initialBomb.setCollideWorldBounds(true);
  initialBomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  initialBomb.allowGravity = false;

  // UI
  scoreText = this.add.text(700, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  gameOverOverlay = this.add
    .rectangle(0, 0, config.width, config.height, 0x000000, 0.5)
    .setOrigin(0)
    .setDepth(1)
    .setVisible(false);

  gameOverText = this.add
    .image(config.width / 2, 240, "gameOverImg")
    .setOrigin(0.5)
    .setDepth(2)
    .setVisible(false);

  restartButton = this.add
    .image(config.width / 2, 350, "restartBtn")
    .setOrigin(0.5)
    .setDepth(2)
    .setVisible(false)
    .setInteractive({ useHandCursor: true });

  restartButton.on("pointerdown", () => {
    this.scene.restart();
    score = 0;
    currentLevel = 1;
    gameOver = false;

    gameOverOverlay.setVisible(false);
    gameOverText.setVisible(false);
    restartButton.setVisible(false);
  });

  // Colisiones
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
  if (gameOver) return;

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    currentLevel++;
    loadLevel.call(this, currentLevel);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("turn");
  gameOver = true;

  gameOverOverlay.setVisible(true);
  gameOverText.setVisible(true);
  restartButton.setVisible(true);
}

function loadLevel(level) {
  // Por ahora, solo reseteamos las estrellas y agregamos una bomba
  stars.clear(true, true);

  const totalStars = 12;
  const spacing = config.width / totalStars;

  for (let i = 0; i < totalStars; i++) {
    const x = i * spacing + spacing / 2;
    const star = stars.create(x, 0, "star");
    star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  }

  let x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

  let bomb = bombs.create(x, 16, "bomb");
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  bomb.allowGravity = false;

  // Más adelante puedes cambiar plataformas, dificultad, etc.
}
