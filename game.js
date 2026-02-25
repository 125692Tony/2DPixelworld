const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height;

// Game State
let gameRunning = false;
let isPaused = false;
let score = 0;
let speed = 8; // Faster starting speed
let targetLane = 1; 
let currentX = 0; // For smooth sliding
let playerY = 0;
let jumpVel = 0;
const gravity = 0.8;

// Obstacles
let obstacles = [];
let gameTick = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    currentX = width / 2; // Initialize position
}
window.addEventListener('resize', resize);
resize();

// Input Logic
window.addEventListener('keydown', (e) => {
    if (!gameRunning || isPaused) return;
    if ((e.key === 'a' || e.key === 'ArrowLeft') && targetLane > 0) targetLane--;
    if ((e.key === 'd' || e.key === 'ArrowRight') && targetLane < 2) targetLane++;
    if ((e.key === ' ' || e.key === 'w') && playerY === 0) jumpVel = 15;
});

function spawnObstacle() {
    const lanePos = Math.floor(Math.random() * 3);
    const type = Math.random() > 0.7 ? 'SAW' : 'BARRIER';
    obstacles.push({ z: 1500, lane: lanePos, type: type });
}

function update() {
    if (!gameRunning || isPaused) return;

    gameTick++;
    score += Math.floor(speed / 4);
    speed += 0.002;

    // Smooth Lane Interpolation (The "Subway Surfer" slide)
    const centerX = width / 2;
    const targetX = centerX + (targetLane - 1) * (width * 0.25);
    currentX += (targetX - currentX) * 0.15; 

    // Player Physics
    playerY += jumpVel;
    if (playerY > 0) jumpVel -= gravity;
    else { playerY = 0; jumpVel = 0; }

    // Spawn Logic
    if (gameTick % Math.max(20, Math.floor(60 - speed)) === 0) spawnObstacle();

    // Update Obstacles
    obstacles.forEach((obs, i) => {
        obs.z -= speed;
        
        // Accurate Collision Detection
        // obs.z between 50 and 100 is roughly where the player "is" in 3D space
        if (obs.z < 100 && obs.z > 20 && obs.lane === targetLane) {
            if (obs.type === 'BARRIER' && playerY < 40) endGame();
            if (obs.type === 'SAW' && playerY < 60) endGame();
        }
    });
    obstacles = obstacles.filter(obs => obs.z > -100);

    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Motion Blur Effect
    ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
    ctx.fillRect(0, 0, width, height);

    const horizon = height * 0.45;
    const centerX = width / 2;

    // 1. Draw Moving Grid (Horizontal Lines)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
        let lineZ = ((i * 100) - (gameTick * speed) % 100);
        let lineScale = 600 / (lineZ + 600);
        let lineY = horizon + (height * 0.5) * lineScale;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
    }

    // 2. Draw Perspective Lines (Vertical)
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + (i * 20), horizon);
        ctx.lineTo(centerX + (i * 1200), height);
        ctx.stroke();
    }

    // 3. Draw Obstacles
    obstacles.forEach(obs => {
        const scale = 600 / (obs.z + 600);
        const x = centerX + (obs.lane - 1) * (width * 0.35) * scale;
        const y = horizon + (height * 0.55) * scale;
        const size = 120 * scale;

        ctx.shadowBlur = 20 * scale;
        ctx.fillStyle = obs.type === 'SAW' ? '#ff0044' : '#00ffff';
        ctx.shadowColor = ctx.fillStyle;
        
        ctx.fillRect(x - size/2, y - size, size, size);
    });
    ctx.shadowBlur = 0;

    // 4. Draw Player
    const pY = (height * 0.85) - playerY;
    
    // Draw Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#0ff';
    ctx.fillStyle = '#fff';
    // Draw simple humanoid shape
    ctx.fillRect(currentX - 20, pY - 80, 40, 70); 
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(currentX - 20, pY - 80, 40, 70);
    ctx.shadowBlur = 0;
    
    document.getElementById('current-score').innerText = score;
}

function startGame() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('best-score').innerText = localStorage.getItem('best') || 0;
    gameRunning = true;
    update();
}

function endGame() {
    gameRunning = false;
    document.getElementById('death-screen').clas
