const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height, currentX, gameRunning = false, isPaused = false;
let score = 0, speed = 8, gameTick = 0, targetLane = 1, playerY = 0, jumpVel = 0;
let obstacles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    currentX = width / 2;
}
window.addEventListener('resize', resize);
resize();

// UI Nav
function toggleMenu(menuId) {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(menuId);
    if (target) target.classList.remove('hidden');
}

function setChar(element, type) {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}

function startGame() {
    toggleMenu('none');
    document.getElementById('hud').classList.remove('hidden');
    gameRunning = true;
    score = 0;
    obstacles = [];
    loop(); // Start the loop
}

function pauseGame() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').innerText = isPaused ? '▶' : 'll';
}

function resetGame() {
    gameRunning = false;
    toggleMenu('main-menu');
    document.getElementById('hud').classList.add('hidden');
}

// Logic
window.addEventListener('keydown', (e) => {
    if (!gameRunning || isPaused) return;
    if ((e.key === 'ArrowLeft' || e.key === 'a') && targetLane > 0) targetLane--;
    if ((e.key === 'ArrowRight' || e.key === 'd') && targetLane < 2) targetLane++;
    if ((e.key === ' ' || e.key === 'w') && playerY === 0) jumpVel = 15;
});

function loop() {
    if (!gameRunning) return;
    if (!isPaused) {
        gameTick++;
        score++;
        speed += 0.001;
        
        // Lane Slide
        const targetX = (width / 2) + (targetLane - 1) * (width * 0.2);
        currentX += (targetX - currentX) * 0.1;

        // Jump Physics
        playerY += jumpVel;
        if (playerY > 0) jumpVel -= 0.8; else { playerY = 0; jumpVel = 0; }

        // Obstacles
        if (gameTick % 60 === 0) obstacles.push({ z: 1000, lane: Math.floor(Math.random() * 3) });
        obstacles.forEach(o => {
            o.z -= speed;
            if (o.z < 50 && o.z > 0 && o.lane === targetLane && playerY < 30) {
                gameRunning = false;
                document.getElementById('final-score').innerText = score;
                toggleMenu('death-screen');
            }
        });
        obstacles = obstacles.filter(o => o.z > -100);
    }
    
    // Always draw, even if paused
    draw();
    requestAnimationFrame(loop);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw Floor Grid
    ctx.strokeStyle = '#333';
    for(let i=0; i<3; i++) {
        let x = (width/2) + (i-1) * (width*0.2);
        ctx.beginPath(); ctx.moveTo(x, height); ctx.lineTo(width/2, height*0.4); ctx.stroke();
    }

    // Draw Obstacles
    ctx.fillStyle = '#0ff';
    obstacles.forEach(o => {
        let scale = 400 / (o.z + 400);
        let x = (width/2) + (o.lane - 1) * (width*0.4) * scale;
        let y = (height*0.4) + (height*0.6) * scale;
        let size = 50 * scale;
        ctx.fillRect(x - size/2, y - size, size, size);
    });

    // Draw Player
    ctx.fillStyle = '#fff';
    ctx.fillRect(currentX - 20, (height*0.9) - playerY - 40, 40, 40);
    document.getElementById('current-score').innerText = score;
}

// Initial Load
window.onload = () => {
    let p = 0;
    let iv = setInterval(() => {
        p += 10;
        document.getElementById('progress').style.width = p + '%';
        if(p >= 100) { 
            clearInterval(iv); 
            document.getElementById('loading-screen').style.display = 'none';
        }
    }, 50);
};
