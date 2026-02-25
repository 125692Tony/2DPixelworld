const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 600;

// Game State
const world = {
    view: 'top-down', // 'top-down' or 'side-scroller'
    gravity: 0.8,
    friction: 0.85,
    cellSize: 50,
    biome: 'forest'
};

const player = {
    x: 100, y: 100, w: 32, h: 48,
    vx: 0, vy: 0,
    speed: 0.8, maxSpeed: 5,
    isGrounded: false,
    coyoteTimer: 0,
    hp: 100,
    lastPOVChange: 0
};

const keys = {};
window.onkeydown = (e) => { keys[e.key.toLowerCase()] = true; if(e.key.toLowerCase() === 'o') switchPOV(); };
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

function switchPOV() {
    const now = Date.now();
    if (now - player.lastPOVChange < 500) return; // Prevent spam
    world.view = world.view === 'top-down' ? 'side-scroller' : 'top-down';
    player.vy = 0; // Reset momentum
    player.lastPOVChange = now;
    triggerScreenShake();
}

function triggerScreenShake() {
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 200);
}

function update() {
    const sprintMul = keys['shift'] ? 1.8 : 1;

    // Movement Logic
    if (world.view === 'top-down') {
        if (keys['w']) player.vy -= player.speed * sprintMul;
        if (keys['s']) player.vy += player.speed * sprintMul;
    } else {
        // Gravity & Jump for Side-scroller
        player.vy += world.gravity;
        if (keys[' '] && (player.isGrounded || player.coyoteTimer > 0)) {
            player.vy = -12;
            player.coyoteTimer = 0;
        }
    }

    if (keys['a']) player.vx -= player.speed * sprintMul;
    if (keys['d']) player.vx += player.speed * sprintMul;

    // Apply Friction (Acceleration/Deceleration)
    player.vx *= world.friction;
    player.vy *= world.view === 'top-down' ? world.friction : 0.99;

    // Update Position
    player.x += player.vx;
    player.y += player.vy;

    // Simple Collision (Floor)
    player.isGrounded = false;
    if (player.y + player.h > canvas.height - 50) {
        player.y = canvas.height - 50 - player.h;
        player.vy = 0;
        player.isGrounded = true;
        player.coyoteTimer = 10; // Reset Coyote Time
    } else {
        player.coyoteTimer--;
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Biome Background
    ctx.fillStyle = world.view === 'top-down' ? '#2d5a27' : '#5d81a2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Ground (Side-scroller)
    if(world.view === 'side-scroller') {
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    }

    // Draw Player (Pixel Snapping)
    ctx.fillStyle = '#e67e22';
    const drawX = Math.round(player.x);
    const drawY = Math.round(player.y);
    ctx.fillRect(drawX, drawY, player.w, player.h);
    
    // POV Label
    ctx.fillStyle = "white";
    ctx.fillText(`POV: ${world.view.toUpperCase()} [O to swap]`, 20, 580);
}

update();
