// Game constants
const HERO_SPEED = 5;
const ENEMY_SPEED = 1;

// Game objects
let hero = {
  x: 0,
  y: 0,
  width: 99,
  height: 75,
  img: null
};

let enemies = [];
let heroImg, enemyImg;
let canvas, ctx;

// Keys being pressed
let keys = {};

function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}

function createEnemies() {
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;

  for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      enemies.push({
        x: x,
        y: y,
        width: 98,
        height: 50,
        img: enemyImg
      });
    }
  }
}

function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHero() {
  ctx.drawImage(heroImg, hero.x, hero.y, hero.width, hero.height);
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function updateHero() {
  // Move left
  if (keys["ArrowLeft"] && hero.x > 0) {
    hero.x -= HERO_SPEED;
  }
  // Move right
  if (keys["ArrowRight"] && hero.x < canvas.width - hero.width) {
    hero.x += HERO_SPEED;
  }
}

function updateEnemies() {
  // Move enemies down
  enemies.forEach(enemy => {
    enemy.y += ENEMY_SPEED;
  });
}

function gameLoop() {
  // Clear and redraw everything
  drawBackground();
  drawHero();
  drawEnemies();

  // Update positions
  updateHero();
  updateEnemies();

  // Keep the loop going
  requestAnimationFrame(gameLoop);
}

// Listen for keyboard input
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

window.onload = async () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  // Load images
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");

  // Set hero starting position
  hero.x = canvas.width / 2 - 45;
  hero.y = canvas.height - canvas.height / 4;
  hero.img = heroImg;

  // Create enemies
  createEnemies();

  // Start game loop
  gameLoop();
};