let canvas, ctx, width, height, currentX;
let gameRunning = false, isPaused = false, score = 0, speed = 8, gameTick = 0;
let targetLane = 1, playerY = 0, jumpVel = 0, obstacles = [];

function init() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    setupLoading();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    currentX = width / 2;
}

function setupLoading() {
    let p = 0;
    const progress = document.getElementById('progress');
    const loading = document.getElementById('loading-screen');
    const interval = setInterval(() => {
        p += 10;
        if (progress) progress.style.width = p + '%';
        if (p >= 100) {
            clearInterval(interval);
            if (loading) loading.style.display = 'none';
            document.getElementById('best-score').innerText = localStorage.getItem('neon-best') || 0;
        }
    }, 50);
}

window.toggleMenu = (menuId) => {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(menuId);
    if (target) target.classList.remove('hidden');
};

window.setChar = (el, type) => {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
};

window.startGame = () => {
    toggleMenu('none');
    document.getElementById('hud').classList.remove('hidden');
    gameRunning = true;
    score = 0;
    speed = 8;
    obstacles = [];
    loop();
};

window.pauseGame = () => {
    isPaused = !isPaused;
    document.getElementById('pause-btn').innerText = isPaused ? '▶' : 'll';
};

window.resetGame = () => {
    gameRunning = false;
    toggleMenu('main-menu');
    document.getElementById('hud').classList.add('hidden');
};

function loop() {
    if (!gameRunning) return;
    if (!isPaused) {
        gameTick++;
        score++;
        speed += 0.001;
        const targetX = (width / 2) + (targetLane - 1) * (width * 0.2);
        currentX += (targetX - currentX) * 0.1;
        playerY += jumpVel;
        if (playerY > 0) jumpVel -= 0.8; else { playerY = 0; jumpVel = 0; }
        if (gameTick % 60 === 0) obstacles.push({ z: 1000, lane: Math.floor(Math.random() * 3) });
        obstacles.forEach(o => {
            o.z -= speed;
            if (o.z < 50 && o.z > 0 && o.lane === targetLane && playerY < 30) {
                gameRunning = false;
                document.getElementById('final-score').innerText = score;
                if(score > (localStorage.getItem('neon-best') || 0)) localStorage.setItem('neon-best', score);
                toggleMenu('death-screen');
            }
        });
        obstacles = obstacles.filter(o => o.z > -100);
    }
    draw();
    requestAnimationFrame(loop);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#333';
    for(let i=0; i<3; i++) {
        let x = (width/2) + (i-1) * (width*0.2);
        ctx.beginPath(); ctx.moveTo(x, height); ctx.lineTo(width/2, height*0.4); ctx.stroke();
    }
    ctx.fillStyle = '#0ff';
    obstacles.forEach(o => {
        let scale = 400 / (o.z + 400);
        let x = (width/2) + (o.lane - 1) * (width*0.4) * scale;
        let y = (height*0.4) + (height*0.6) * scale;
        let size = 50 * scale;
        ctx.fillRect(x - size/2, y - size, size, size);
    });
    ctx.fillStyle = '#fff';
    ctx.fillRect(currentX - 20, (height*0.9) - playerY - 40, 40, 40);
    document.getElementById('current-score').innerText = score;
}

window.addEventListener('keydown', (e) => {
    if (!gameRunning || isPaused) return;
    if ((e.key === 'ArrowLeft' || e.key === 'a') && targetLane > 0) targetLane--;
    if ((e.key === 'ArrowRight' || e.key === 'd') && targetLane < 2) targetLane++;
    if ((e.key === ' ' || e.key === 'w') && playerY === 0) jumpVel = 15;
});

// Initialize on load
window.addEventListener('load', init);
