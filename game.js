const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height, currentX;

// Game State
let gameRunning = false, isPaused = false;
let score = 0, speed = 8, gameTick = 0;
let targetLane = 1, playerY = 0, jumpVel = 0;
let obstacles = [];
const gravity = 0.8;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    currentX = width / 2;
}
window.addEventListener('resize', resize);
resize();

// Input
window.addEventListener('keydown', (e) => {
    if (!gameRunning || isPaused) return;
    if ((e.key === 'a' || e.key === 'ArrowLeft') && targetLane > 0) targetLane--;
    if ((e.key === 'd' || e.key === 'ArrowRight') && targetLane < 2) targetLane++;
    if ((e.key === ' ' || e.key === 'w') && playerY === 0) jumpVel = 15;
});

// UI Controls
function toggleMenu(menuId) {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(menuId);
    if (target) target.classList.remove('hidden');
}

function setChar(type) {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function startGame() {
    toggleMenu('none'); // Hide all menus
    document.getElementById('hud').classList.remove('hidden');
    gameRunning = true;
    update();
}

function pauseGame() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').innerText = isPaused ? '▶' : 'll';
    if (!isPaused) update();
}

function endGame() {
    gameRunning = false;
    const best = localStorage.getItem('best-score') || 0;
    if (score > best) localStorage.setItem('best-score', score);
    
    document.getElementById('death-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    document.getElementById('best-score').innerText = localStorage.getItem('best-score');
}

function resetGame() {
    score = 0; speed = 8; obstacles = []; gameTick = 0;
    targetLane = 1; playerY = 0; jumpVel = 0;
    document.getElementById('death-screen').classList.add('hidden');
    toggleMenu('main-menu');
}

// Logic & Drawing
function spawnObstacle() {
    const lanePos = Math.floor(Math.random() * 3);
    obstacles.push({ z: 1500, lane: lanePos });
}

function update() {
    if (!gameRunning || isPaused) return;
    gameTick++;
    score += Math.floor(speed / 4);
    speed += 0.002;

    const targetX = (width / 2) + (targetLane - 1) * (width * 0.25);
    currentX += (targetX - currentX) * 0.15; 

    playerY += jumpVel;
    if (playerY > 0) jumpVel -= gravity; else { playerY = 0; jumpVel = 0; }

    if (gameTick % Math.max(20, Math.floor(60 - speed)) === 0) spawnObstacle();

    obstacles.forEach((obs) => {
        obs.z -= speed;
        // Collision: Check if obstacle is near player in Z-space and in the same lane
        if (obs.z < 100 && obs.z > 20 && obs.lane === targetLane && playerY < 40) endGame();
    });
    obstacles = obstacles.filter(obs => obs.z > -100);

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);
    const horizon = height * 0.45;
    const centerX = width / 2;

    // Obstacles
    obstacles.forEach(obs => {
        const scale = 600 / (obs.z + 600);
        const x = centerX + (obs.lane - 1) * (width * 0.35) * scale;
        const y = horizon + (height * 0.55) * scale;
        const size = 100 * scale;
        ctx.fillStyle = '#0ff';
        ctx.fillRect(x - size/2, y - size, size, size);
    });

    // Player (Neon Cube)
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#0ff';
    ctx.fillRect(currentX - 20, (height * 0.85) - playerY - 80, 40, 70);
    ctx.shadowBlur = 0;

    document.getElementById('current-score').innerText = score;
}

// Initial Load
window.onload = () => {
    let prog = 0;
    const inter = setInterval(() => {
        prog += 5;
        document.getElementById('progress').style.width = prog + '%';
        if(prog >= 100) {
            clearInterval(inter);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('best-score').innerText = localStorage.getItem('best-score') || 0;
        }
    }, 50);
};
