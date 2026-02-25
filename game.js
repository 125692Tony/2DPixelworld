const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height;

// Game State
let gameRunning = false;
let isPaused = false;
let score = 0;
let speed = 5;
let lane = 1; // 0: Left, 1: Middle, 2: Right
let playerY = 0;
let jumpVel = 0;
const gravity = 0.8;

// Obstacles
let obstacles = [];
let gameTick = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Input Logic
window.addEventListener('keydown', (e) => {
    if (!gameRunning || isPaused) return;
    if (e.key === 'a' || e.key === 'ArrowLeft') if (lane > 0) lane--;
    if (e.key === 'd' || e.key === 'ArrowRight') if (lane < 2) lane++;
    if (e.key === ' ' || e.key === 'w') {
        if (playerY === 0) jumpVel = 15;
    }
});

function spawnObstacle() {
    const lanePos = Math.floor(Math.random() * 3);
    const type = Math.random() > 0.7 ? 'SAW' : 'BARRIER';
    obstacles.push({ z: 1000, lane: lanePos, type: type });
}

function update() {
    if (!gameRunning || isPaused) return;

    gameTick++;
    score += Math.floor(speed / 2);
    speed += 0.001;

    // Player Physics
    playerY += jumpVel;
    if (playerY > 0) jumpVel -= gravity;
    else { playerY = 0; jumpVel = 0; }

    // Spawn Logic
    if (gameTick % Math.floor(100 / (speed/5)) === 0) spawnObstacle();

    // Update Obstacles
    obstacles.forEach((obs, i) => {
        obs.z -= speed;
        
        // Collision Detection
        if (obs.z < 50 && obs.z > 0 && obs.lane === lane) {
            if (obs.type === 'BARRIER' && playerY < 30) endGame();
            if (obs.type === 'SAW' && playerY < 50) endGame();
        }
    });
    obstacles = obstacles.filter(obs => obs.z > -100);

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    const horizon = height * 0.4;
    const centerX = width / 2;

    // Draw Floor (Perspective Lines)
    ctx.strokeStyle = '#111';
    for (let i = -5; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + (i * 10), horizon);
        ctx.lineTo(centerX + (i * 1000), height);
        ctx.stroke();
    }

    // Draw Obstacles (Running Fred traps)
    obstacles.forEach(obs => {
        const scale = 200 / (obs.z || 1);
        const x = centerX + (obs.lane - 1) * (width * 0.3) * scale;
        const y = horizon + (height * 0.5) * scale;
        const size = 100 * scale;

        ctx.fillStyle = obs.type === 'SAW' ? '#ff0044' : '#00ffff';
        ctx.fillRect(x - size/2, y - size, size, size);
        
        // Add "Glow"
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = ctx.fillStyle;
    });
    ctx.shadowBlur = 0;

    // Draw Player (Subway Surfer style)
    const pScale = 1;
    const pX = centerX + (lane - 1) * (width * 0.15);
    const pY = (height * 0.85) - playerY;
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(pX - 20, pY - 60, 40, 60); // Humanoid block
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(pX - 20, pY - 60, 40, 60);
    
    document.getElementById('current-score').innerText = score;
}

// UI Functions
function startGame() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    gameRunning = true;
    update();
}

function endGame() {
    gameRunning = false;
    document.getElementById('death-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    const best = localStorage.getItem('best') || 0;
    if (score > best) localStorage.setItem('best', score);
}

function resetGame() {
    location.reload();
}

// Simulated Loading
let loadProgress = 0;
const interval = setInterval(() => {
    loadProgress += Math.random() * 20;
    document.getElementById('progress').style.width = loadProgress + '%';
    if (loadProgress >= 100) {
        clearInterval(interval);
        document.getElementById('loading-screen').classList.add('hidden');
    }
}, 200);
