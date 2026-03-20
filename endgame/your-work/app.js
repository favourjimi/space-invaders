// @ts-check
class EventEmitter {
        constructor() {
                this.listeners = {};
        }

        // @ts-ignore
        on(message, listener) {
                // @ts-ignore
                if (!this.listeners[message]) {
                        // @ts-ignore
                        this.listeners[message] = [];
                }
                // @ts-ignore
                this.listeners[message].push(listener);
        }

        // @ts-ignore
        emit(message, payload = null) {
                // @ts-ignore
                if (this.listeners[message]) {
                        // @ts-ignore
                        this.listeners[message].forEach((l) => l(message, payload));
                }
        }
}

class GameObject {
        // @ts-ignore
        constructor(x, y) {
                this.x = x;
                this.y = y;
                this.dead = false;
                this.type = '';
                this.width = 0;
                this.height = 0;
                // @ts-ignore
                this.img = undefined;
        }

        // @ts-ignore
        draw(ctx) {
                ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }

        rectFromGameObject() {
                return {
                        top: this.y,
                        left: this.x,
                        bottom: this.y + this.height,
                        right: this.x + this.width,
                };
        }
}

class Hero extends GameObject {
        // @ts-ignore
        constructor(x, y) {
                super(x, y);
                (this.width = 99), (this.height = 75);
                this.type = 'Hero';
                this.speed = { x: 0, y: 0 };
                this.cooldown = 0;
                this.life = 3;
                this.points = 0;
        }

        fire() {
                gameObjects.push(new Laser(this.x + 45, this.y - 10));
                this.cooldown = 500;
                let id = setInterval(() => {
                        if (this.cooldown > 0) {
                                this.cooldown -= 100;
                                if (this.cooldown === 0) {
                                        clearInterval(id);
                                }
                        }
                }, 200);
        }

        canFire() {
                return this.cooldown === 0;
        }

        decrementLife() {
                if (this.life > 0) {
                        this.life--;
                        if (this.life === 0) {
                                this.dead = true;
                                eventEmitter.emit(Messages.GAME_END_LOSS);
                        }
                }
        }

        incrementPoints() {
                this.points += 100;
        }
}
class Enemy extends GameObject {
        constructor(x, y) {
                super(x, y);
                (this.width = 98), (this.height = 50);
                this.type = 'Enemy';
                this.speed = 1.5;
        }

        update() {
                if (this.y < canvas.height - this.height) {
                        this.y += this.speed;
                }
        }
}

class Laser extends GameObject {
        constructor(x, y) {
                super(x, y);
                (this.width = 9), (this.height = 33);
                this.type = 'Laser';
                this.img = laserImg;
                this.speed = 10;
        }

        update() {
                if (this.y > 0) {
                        this.y -= this.speed;
                } else {
                        this.dead = true;
                }
        }
}

// @ts-ignore
function loadTexture(path) {
        return new Promise((resolve) => {
                const img = new Image();
                img.src = path;
                img.onload = () => {
                        resolve(img);
                };
        });
}

// @ts-ignore
function intersectRect(r1, r2) {
        return !(
                r2.left > r1.right ||
                r2.right < r1.left ||
                r2.top > r1.bottom ||
                r2.bottom < r1.top
        );
}

const Messages = {
        KEY_EVENT_UP: 'KEY_EVENT_UP',
        KEY_EVENT_DOWN: 'KEY_EVENT_DOWN',
        KEY_EVENT_LEFT: 'KEY_EVENT_LEFT',
        KEY_EVENT_RIGHT: 'KEY_EVENT_RIGHT',
        KEY_EVENT_SPACE: 'KEY_EVENT_SPACE',
        KEY_EVENT_ENTER: 'KEY_EVENT_ENTER',
        COLLISION_ENEMY_LASER: 'COLLISION_ENEMY_LASER',
        COLLISION_ENEMY_HERO: 'COLLISION_ENEMY_HERO',
        GAME_END_WIN: 'GAME_END_WIN',
        GAME_END_LOSS: 'GAME_END_LOSS',
};

// @ts-ignore
let heroImg,
        // @ts-ignore
        enemyImg,
        // @ts-ignore
        laserImg,
        // @ts-ignore
        lifeImg,
        // @ts-ignore
        canvas,
        // @ts-ignore
        ctx,
        // @ts-ignore
        gameObjects = [],
        // @ts-ignore
        hero,
        eventEmitter = new EventEmitter();

// Game state
// @ts-ignore
let gameLoopId;
let isGameOver = false;

// @ts-ignore
let onKeyDown = function (e) {
        switch (e.keyCode) {
                case 37:
                case 39:
                case 38:
                case 40:
                case 32:
                        e.preventDefault();
                        break;
                default:
                        break;
        }
};

window.addEventListener('keydown', onKeyDown);

window.addEventListener('keyup', (evt) => {
        if (evt.key === 'ArrowUp') {
                eventEmitter.emit(Messages.KEY_EVENT_UP);
        } else if (evt.key === 'ArrowDown') {
                eventEmitter.emit(Messages.KEY_EVENT_DOWN);
        } else if (evt.key === 'ArrowLeft') {
                eventEmitter.emit(Messages.KEY_EVENT_LEFT);
        } else if (evt.key === 'ArrowRight') {
                eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
        } else if (evt.keyCode === 32) {
                eventEmitter.emit(Messages.KEY_EVENT_SPACE);
        } else if (evt.key === 'Enter') {
                eventEmitter.emit(Messages.KEY_EVENT_ENTER);
        }
});

function createEnemies() {
        const MONSTER_TOTAL = 5;
        const MONSTER_WIDTH = MONSTER_TOTAL * 98;
        // @ts-ignore
        const START_X = (canvas.width - MONSTER_WIDTH) / 2;
        const STOP_X = START_X + MONSTER_WIDTH;

        for (let x = START_X; x < STOP_X; x += 98) {
                for (let y = 0; y < 50 * 5; y += 50) {
                        const enemy = new Enemy(x, y);
                        // @ts-ignore
                        enemy.img = enemyImg;
                        gameObjects.push(enemy);
                }
        }
}

function createHero() {
        hero = new Hero(
                // @ts-ignore
                canvas.width / 2 - 45,
                // @ts-ignore
                canvas.height - canvas.height / 4
        );
        // @ts-ignore
        hero.img = heroImg;
        gameObjects.push(hero);
}

function updateGameObjects() {
        // @ts-ignore
        const enemies = gameObjects.filter((go) => go.type === 'Enemy');
        // @ts-ignore
        const lasers = gameObjects.filter((go) => go.type === 'Laser');

        // Check enemy hitting hero
        enemies.forEach((enemy) => {
                // @ts-ignore
                const heroRect = hero.rectFromGameObject();
                if (intersectRect(heroRect, enemy.rectFromGameObject())) {
                        // @ts-ignore
                        eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
                }
        });

        // Check laser hitting enemy
        lasers.forEach((l) => {
                enemies.forEach((m) => {
                        if (intersectRect(
                                l.rectFromGameObject(),
                                m.rectFromGameObject()
                        )) {
                                // @ts-ignore
                                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                                        first: l,
                                        second: m,
                                });
                        }
                });
        });

        // Check if all enemies are dead - player wins!
        if (enemies.length === 0) {
                eventEmitter.emit(Messages.GAME_END_WIN);
        }
        gameObjects.forEach((go) => {
                if (go.update) go.update();
        });
        // @ts-ignore
        gameObjects = gameObjects.filter((go) => !go.dead);
}

// @ts-ignore
function drawGameObjects(ctx) {
        // @ts-ignore
        gameObjects.forEach((go) => go.draw(ctx));
}

// Draw big centered message on screen
// @ts-ignore
function drawMessage(message, color = 'red') {
        // @ts-ignore
        ctx.font = '50px Arial';
        // @ts-ignore
        ctx.fillStyle = color;
        // @ts-ignore
        ctx.textAlign = 'center';
        // @ts-ignore
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        // @ts-ignore
        ctx.font = '25px Arial';
        // @ts-ignore
        ctx.fillStyle = 'white';
        // @ts-ignore
        ctx.fillText('Press ENTER to play again', canvas.width / 2, canvas.height / 2 + 50);
        // @ts-ignore
        ctx.textAlign = 'left';
}

function drawLife() {
        // @ts-ignore
        const START_POS = canvas.width - 180;
        // @ts-ignore
        for (let i = 0; i < hero.life; i++) {
                // @ts-ignore
                ctx.drawImage(lifeImg, START_POS + 45 * (i + 1), canvas.height - 37);
        }
}

function drawPoints() {
        // @ts-ignore
        ctx.font = '30px Arial';
        // @ts-ignore
        ctx.fillStyle = 'red';
        // @ts-ignore
        ctx.textAlign = 'left';
        // @ts-ignore
        ctx.fillText('Points: ' + hero.points, 10, canvas.height - 20);
}

// @ts-ignore
function drawText(message, x, y) {
        // @ts-ignore
        ctx.fillText(message, x, y);
}

// @ts-ignore
function endGame(win) {
        // Stop the game loop
        // @ts-ignore
        clearInterval(gameLoopId);
        isGameOver = true;

        // Draw final screen
        // @ts-ignore
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // @ts-ignore
        ctx.fillStyle = 'black';
        // @ts-ignore
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (win) {
                drawMessage('YOU WIN! 🎉', 'green');
        } else {
                drawMessage('GAME OVER', 'red');
        }

        // Show final score
        // @ts-ignore
        ctx.font = '25px Arial';
        // @ts-ignore
        ctx.fillStyle = 'white';
        // @ts-ignore
        ctx.textAlign = 'center';
        // @ts-ignore
        ctx.fillText('Final Score: ' + hero.points, canvas.width / 2, canvas.height / 2 - 50);
        // @ts-ignore
        ctx.textAlign = 'left';
}

function resetGame() {
        // Clear everything and restart
        isGameOver = false;
        eventEmitter = new EventEmitter();
        initGame();

        gameLoopId = setInterval(() => {
                // @ts-ignore
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // @ts-ignore
                ctx.fillStyle = 'black';
                // @ts-ignore
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawPoints();
                drawLife();
                updateGameObjects();
                // @ts-ignore
                drawGameObjects(ctx);
        }, 100);
}

function initGame() {
        gameObjects = [];
        createEnemies();
        createHero();

        eventEmitter.on(Messages.KEY_EVENT_UP, () => {
                // @ts-ignore
                hero.y -= 5;
        });

        eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
                // @ts-ignore
                hero.y += 5;
        });

        eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
                // @ts-ignore
                hero.x -= 20;
        });

        eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
                // @ts-ignore
                hero.x += 20;
        });

        eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
                // @ts-ignore
                if (hero.canFire()) {
                        // @ts-ignore
                        hero.fire();
                }
        });

        // Press Enter to restart when game is over
        eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
                if (isGameOver) {
                        resetGame();
                }
        });

        // Laser hits enemy
        eventEmitter.on(
                Messages.COLLISION_ENEMY_LASER,
                // @ts-ignore
                (_, { first, second }) => {
                        first.dead = true;
                        second.dead = true;
                        // @ts-ignore
                        hero.incrementPoints();
                }
        );

        // Enemy hits hero
        eventEmitter.on(
                Messages.COLLISION_ENEMY_HERO,
                // @ts-ignore
                (_, { enemy }) => {
                        enemy.dead = true;
                        // @ts-ignore
                        if (!hero.dead) {
                                // @ts-ignore
                                hero.decrementLife();
                        }
                }
        );

        // Game end events
        eventEmitter.on(Messages.GAME_END_WIN, () => {
                endGame(true);
        });

        eventEmitter.on(Messages.GAME_END_LOSS, () => {
                endGame(false);
        });
}

window.onload = async () => {
        canvas = document.getElementById('canvas');
        // @ts-ignore
        ctx = canvas.getContext('2d');
        heroImg = await loadTexture('assets/player.png');
        enemyImg = await loadTexture('assets/enemyShip.png');
        laserImg = await loadTexture('assets/laserRed.png');
        lifeImg = await loadTexture('assets/life.png');

        initGame();
        let gameLoopId = setInterval(() => {
                // @ts-ignore
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // @ts-ignore
                ctx.fillStyle = 'black';
                // @ts-ignore
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawPoints();
                drawLife();
                updateGameObjects();
                // @ts-ignore
                drawGameObjects(ctx);
        }, 100);
};