const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height, currentX;

// Game State
let gameRunning = false, isPaused = false, score = 0, speed = 8, gameTick = 0;
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

// UI Functions
function toggleMenu(id) {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
}

function setChar(el, type) {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function startGame() {
    toggleMenu('none');
    document.getElementById('hud').classList.remove('hidden');
    gameRunning = true;
    update();
}

function pauseGame() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').innerText = isPaused ? '▶' : 'll';
}

function resetGame() {
    location.reload(); // Simplest way to reset all states
}

function endGame() {
    gameRunning = false;
    const best = localStorage.getItem('best-score') || 0;
    if (score > best) localStorage.setItem('best-score', score);
    toggleMenu('death-screen');
    document.getElementById('final-score').innerText = score;
}

// Core Loop
function update() {
    if (!gameRunning || isPaused) return;
    gameTick++;
    score++;
    speed += 0.002;

    const targetX = (width / 2) + (targetLane - 1) * (width * 0.25);
    currentX += (targetX - currentX) * 0.15; 

    playerY += jumpVel;
    if (playerY > 0) jumpVel -= gravity; else { playerY = 0; jumpVel = 0; }

    if (gameTick % 60 === 0) obstacles.push({ z: 1500, lane: Math.floor(Math.random() * 3) });

    obstacles.forEach(obs => {
        obs.z -= speed;
        if (obs.z < 100 && obs.z > 20 && obs.lane === targetLane && playerY < 40) endGame();
    });
    obstacles = obstacles.filter(obs => obs.z > -100);

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);
    
    // Simple Grid & Player
    ctx.fillStyle = '#0ff';
    obstacles.forEach(o => {
        let s = 400 / (o.z + 400);
        ctx.fillRect((width/2) + (o.lane-1)*(width*0.4)*s, (height*0.5)+(height*0.5)*s, 50*s, 50*s);
    });

    ctx.fillStyle = '#fff';
    ctx.fillRect(currentX - 20, (height * 0.85) - playerY - 80, 40, 70);
    document.getElementById('current-score').innerText = score;
}

// Fix Infinite Loading Screen
document.addEventListener('DOMContentLoaded', () => {
    let p = 0;
    const interval = setInterval(() => {
        p += 10;
        document.getElementById('progress').style.width = p + '%';
        if (p >= 100) {
            clearInterval(interval);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('best-score').innerText = localStorage.getItem('best-score') || 0;
        }
    }, 50);
});
