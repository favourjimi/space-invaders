// Function to load images
function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = path
    img.onload = () => {
      resolve(img)
    }
  })
}

// Function to draw enemies in a grid
function createEnemies(ctx, canvas, enemyImg) {
  const ENEMY_ROWS = 3;
  const ENEMY_COLS = 5;
  const ENEMY_SPACING_X = 150;
  const ENEMY_SPACING_Y = 100;
  const ENEMY_START_X = 100;
  const ENEMY_START_Y = 50;

  for (let y = 0; y < ENEMY_ROWS; y++) {
    for (let x = 0; x < ENEMY_COLS; x++) {
      ctx.drawImage(
        enemyImg,
        ENEMY_START_X + x * ENEMY_SPACING_X,
        ENEMY_START_Y + y * ENEMY_SPACING_Y,
        75,  // enemy width
        75   // enemy height
      );
    }
  }
}

window.onload = async () => {
  // Get canvas and context
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')

  // Load textures
  const heroImg = await loadTexture('assets/player.png')
  const enemyImg = await loadTexture('assets/enemyShip.png')

  // Draw black background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw hero at bottom center of canvas
  ctx.drawImage(
    heroImg,
    canvas.width / 2 - 45,  // center horizontally
    canvas.height - 120,     // near bottom
    90,   // hero width
    90    // hero height
  )

  // Draw enemies
  createEnemies(ctx, canvas, enemyImg);
}