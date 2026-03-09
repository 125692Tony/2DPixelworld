const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const scoreBoard = document.getElementById('score');

let gameLoop;
let isGameOver = false;
let score = 0;
let gameSpeed = 5; // Initial speed
const speedIncreaseRate = 0.0005; // Gradual speed increase

// Player variables
const player = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 20,
    velocity: 0,
    gravity: 0.3,
    thrust: -6,
    draw() {
        ctx.fillStyle = 'red'; // Jet color
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Prevent falling off the bottom
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            gameOver();
        }
        // Prevent flying off the top
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    jump() {
        this.velocity = this.thrust;
    }
};

// Obstacle variables
let obstacles = [];
const obstacleWidth = 50;
const obstacleGap = 200; // Gap between top and bottom obstacles
let lastObstacleTime = 0;
const obstacleSpawnInterval = 1500; // Spawn new obstacle every 1.5 seconds

class Obstacle {
    constructor(x, y, height) {
        this.x = x;
        this.y = y; // Top of the obstacle
        this.height = height;
        this.passed = false;
    }
    draw() {
        ctx.fillStyle = 'green';
        // Top part
        ctx.fillRect(this.x, 0, obstacleWidth, this.height);
        // Bottom part
        ctx.fillRect(this.x, this.height + obstacleGap, obstacleWidth, canvas.height - (this.height + obstacleGap));
    }
    update() {
        this.x -= gameSpeed;
    }
}

function createObstacle() {
    const minHeight = 50;
    const maxHeight = canvas.height - obstacleGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    obstacles.push(new Obstacle(canvas.width, topHeight));
}

function checkCollision() {
    for (const obstacle of obstacles) {
        // Collision with top pipe
        if (player.x < obstacle.x + obstacleWidth &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.height) {
            gameOver();
            return;
        }
        // Collision with bottom pipe
        if (player.x < obstacle.x + obstacleWidth &&
            player.x + player.width > obstacle.x &&
            player.y + player.height > obstacle.height + obstacleGap) {
            gameOver();
            return;
        }

        // Check for scoring
        if (obstacle.x + obstacleWidth < player.x && !obstacle.passed) {
            obstacle.passed = true;
            score++;
            scoreBoard.textContent = score;
        }
    }
}

function update() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game elements
    player.update();
    player.draw();

    // Handle obstacles
    const currentTime = Date.now();
    if (currentTime - lastObstacleTime > obstacleSpawnInterval) {
        createObstacle();
        lastObstacleTime = currentTime;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();
        // Remove off-screen obstacles
        if (obstacles[i].x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
        }
    }

    checkCollision();

    // Increase difficulty
    gameSpeed += speedIncreaseRate;

    gameLoop = requestAnimationFrame(update);
}

function startGame() {
    isGameOver = false;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    player.y = canvas.height / 2;
    player.velocity = 0;
    obstacles = [];
    score = 0;
    scoreBoard.textContent = score;
    gameSpeed = 5;
    lastObstacleTime = Date.now();
    // Ensure canvas size is correct on start
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    update();
}

function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoop);
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame();
}

// Input handling
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!isGameOver) {
            player.jump();
        } else {
            startGame();
        }
    }
});

canvas.addEventListener('click', () => {
    if (!isGameOver) {
        player.jump();
    } else {
        startGame();
    }
});

// Initial setup
window.onload = () => {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    startScreen.style.display = 'block';
};
