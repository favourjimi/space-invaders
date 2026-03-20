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
        }

        fire() {
                if (this.cooldown === 0) {
                        gameObjects.push(new Laser(this.x + 45, this.y - 10));
                        this.cooldown = 500;
                        let id = setInterval(() => {
                                if (this.cooldown > 0) {
                                        this.cooldown -= 100;
                                } else {
                                        clearInterval(id);
                                }
                        }, 100);
                }
        }

        canFire() {
                return this.cooldown === 0;
        }
}

class Enemy extends GameObject {
        // @ts-ignore
        constructor(x, y) {
                super(x, y);
                (this.width = 98), (this.height = 50);
                this.type = 'Enemy';
                let id = setInterval(() => {
                        // @ts-ignore
                        if (this.y < canvas.height - this.height) {
                                this.y += 5;
                        } else {
                                console.log('Stopped at', this.y);
                                clearInterval(id);
                        }
                }, 300);
        }
}

class Laser extends GameObject {
        // @ts-ignore
        constructor(x, y) {
                super(x, y);
                (this.width = 9), (this.height = 33);
                this.type = 'Laser';
                // @ts-ignore
                this.img = laserImg;
                let id = setInterval(() => {
                        if (this.y > 0) {
                                this.y -= 15;
                        } else {
                                this.dead = true;
                                clearInterval(id);
                        }
                }, 100);
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

// Check if two rectangles intersect
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
        COLLISION_ENEMY_LASER: 'COLLISION_ENEMY_LASER',
};

// @ts-ignore
let heroImg,
        // @ts-ignore
        enemyImg,
        // @ts-ignore
        laserImg,
        // @ts-ignore
        canvas,
        // @ts-ignore
        ctx,
        // @ts-ignore
        gameObjects = [],
        // @ts-ignore
        hero,
        eventEmitter = new EventEmitter();

// EVENTS
// @ts-ignore
let onKeyDown = function (e) {
        console.log(e.keyCode);
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
        } else if (evt.key === ' ') {
                eventEmitter.emit(Messages.KEY_EVENT_SPACE);
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

// @ts-ignore
function drawGameObjects(ctx) {
        // @ts-ignore
        gameObjects.forEach((go) => go.draw(ctx));
}

function updateGameObjects() {
        // Remove dead objects
        // @ts-ignore
        gameObjects = gameObjects.filter((go) => !go.dead);

        // Check laser - enemy collisions
        const lasers = gameObjects.filter((go) => go.type === 'Laser');
        lasers.forEach((laser) => {
                // @ts-ignore
                const enemies = gameObjects.filter((go) => go.type === 'Enemy');
                enemies.forEach((enemy) => {
                        if (intersectRect(
                                laser.rectFromGameObject(),
                                enemy.rectFromGameObject()
                        )) {
                                eventEmitter.emit(
                                        Messages.COLLISION_ENEMY_LASER,
                                        // @ts-ignore
                                        { first: laser, second: enemy }
                                );
                        }
                });
        });
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
                hero.x -= 5;
        });

        eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
                // @ts-ignore
                hero.x += 5;
        });

        // Fire laser on spacebar
        eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
                // @ts-ignore
                if (hero.canFire()) {
                        // @ts-ignore
                        hero.fire();
                }
        });

        // Handle collision - mark both laser and enemy as dead
        eventEmitter.on(
                Messages.COLLISION_ENEMY_LASER,
                // @ts-ignore
                (_, { first, second }) => {
                        first.dead = true;
                        second.dead = true;
                }
        );
}

window.onload = async () => {
        canvas = document.getElementById('canvas');
        // @ts-ignore
        ctx = canvas.getContext('2d');
        heroImg = await loadTexture('assets/player.png');
        enemyImg = await loadTexture('assets/enemyShip.png');
        laserImg = await loadTexture('assets/laserRed.png');

        initGame();
      /*  let gameLoopId = setInterval(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                updateGameObjects();
                drawGameObjects(ctx);
        }, 100);*/
		function gameLoop() {
        // @ts-ignore
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // @ts-ignore
        ctx.fillStyle = 'black';
        // @ts-ignore
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateGameObjects();
        // @ts-ignore
        drawGameObjects(ctx);
        requestAnimationFrame(gameLoop);
}

gameLoop();
};