// Base class for all game objects
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dead = false;
    }

    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Hero class - the player's spaceship
class Hero extends GameObject {
    constructor(x, y) {
        super(x, y, 40, 40);
        this.color = "green";
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Enemy class - the aliens
class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.color = "red";
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// EventEmitter class - handles communication between game objects
class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach(l => l(message, payload));
        }
    }
}

// Main Game class
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.hero = new Hero(280, 520);
        this.enemies = [];
        this.eventEmitter = new EventEmitter();
        this.running = true;

        // Create enemies
        this.createEnemies();

        // Set up event listener for hero shooting
        this.eventEmitter.on("shoot", (message, payload) => {
            console.log("Hero shot at:", payload);
        });
    }

    createEnemies() {
        // Create a grid of enemies
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 3; y++) {
                this.enemies.push(new Enemy(x * 80 + 60, y * 60 + 30));
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw hero
        this.hero.draw(this.ctx);

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
    }

    gameLoop() {
        if (this.running) {
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    start() {
        this.gameLoop();
    }
}

// Start the game when page loads
window.onload = () => {
    const canvas = document.getElementById("gameCanvas");
    const game = new Game(canvas);
    game.start();
    console.log("Game started!");
};