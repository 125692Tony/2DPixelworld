const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 640; canvas.height = 360;

// Game State
const state = {
    view: 'topdown', // 'topdown' or 'side'
    gravity: 0.5,
    pixelSize: 4,
    keys: {},
    flags: { savedVillage: false },
    coyoteTimer: 0,
    coyoteMax: 10 // Frames of grace period
};

const player = {
    x: 100, y: 100,
    w: 24, h: 32,
    vx: 0, vy: 0,
    acc: 0.8, friction: 0.85,
    speed: 4,
    isGrounded: false,
    hp: 100,
    stamina: 100
};

// Input Handling
window.addEventListener('keydown', e => {
    state.keys[e.code] = true;
    if(e.code === 'KeyO') switchPOV();
});
window.addEventListener('keyup', e => state.keys[e.code] = false);

function switchPOV() {
    state.view = state.view === 'topdown' ? 'side' : 'topdown';
    document.getElementById('pov-indicator').innerText = `POV: ${state.view.toUpperCase()}`;
    player.vx = 0; player.vy = 0; // Reset momentum to prevent glitches
}

function update() {
    let targetSpeed = state.keys['ShiftLeft'] ? player.speed * 1.6 : player.speed;

    if (state.view === 'topdown') {
        // 8-Directional Movement
        if (state.keys['KeyW']) player.vy -= player.acc;
        if (state.keys['KeyS']) player.vy += player.acc;
        if (state.keys['KeyA']) player.vx -= player.acc;
        if (state.keys['KeyD']) player.vx += player.acc;
    } else {
        // Side-Scroller Physics
        if (state.keys['KeyA']) player.vx -= player.acc;
        if (state.keys['KeyD']) player.vx += player.acc;
       
        // Gravity & Coyote Time
        player.vy += state.gravity;
        if (player.y >= canvas.height - player.h - 20) { // Simple floor collision
            player.y = canvas.height - player.h - 20;
            player.vy = 0;
            player.isGrounded = true;
            state.coyoteTimer = state.coyoteMax;
        } else {
            state.coyoteTimer--;
            if (state.coyoteTimer <= 0) player.isGrounded = false;
        }

        // Jump (Requires grounded or Coyote Time)
        if (state.keys['Space'] && state.coyoteTimer > 0) {
            player.vy = -10;
            state.coyoteTimer = 0;
        }
    }

    // Apply Friction (Acceleration/Deceleration)
    player.vx *= player.friction;
    if (state.view === 'topdown') player.vy *= player.friction;

    // Movement Apply
    player.x += player.vx;
    player.y += player.vy;

    // Boundary constraints
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pixel Snapping: Draw at Math.floor positions
    ctx.fillStyle = '#3498db'; // Humanoid blue
    ctx.fillRect(Math.floor(player.x), Math.floor(player.y), player.w, player.h);
   
    // Draw floor in side-scroller mode
    if(state.view === 'side') {
        ctx.fillStyle = '#444';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    }

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

draw();

