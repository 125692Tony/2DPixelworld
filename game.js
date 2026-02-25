const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 500;

// World & Game State
let state = {
    view: 'top-down', // 'top-down' or 'side-scroller'
    biome: 'forest',
    time: 0, // 0 to 2400 (Day/Night cycle)
    flags: { savedVillage: false, bridgeBurned: false },
    activeQuest: "Find the Ancient Ruins"
};

const biomes = {
    forest: { ground: '#2e4d23', player: '#d35400', sky: '#5d81a2' },
    desert: { ground: '#ccad60', player: '#2980b9', sky: '#f39c12' },
    ruins: { ground: '#504141', player: '#ecf0f1', sky: '#2c3e50' }
};

const player = {
    x: 400, y: 300, w: 24, h: 36, vx: 0, vy: 0,
    accel: 0.6, friction: 0.82, maxSpeed: 4.5,
    isGrounded: false, coyoteTimer: 0, stamina: 100
};

// Input Handling
const keys = {};
window.onkeydown = (e) => { 
    keys[e.key.toLowerCase()] = true; 
    if(e.key === 'o') togglePerspective();
    if(e.key === 'e') interact();
};
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

function togglePerspective() {
    state.view = state.view === 'top-down' ? 'side-scroller' : 'top-down';
    player.vy = 0; // Prevent sky-rocketing during swap
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 200);
}

function update() {
    // 1. Perspective-Based Physics
    let speedMult = keys['shift'] && player.stamina > 0 ? 1.7 : 1;
    if (keys['shift'] && player.stamina > 0) player.stamina -= 1;
    else if (player.stamina < 100) player.stamina += 0.5;

    if (state.view === 'top-down') {
        if (keys['w']) player.vy -= player.accel * speedMult;
        if (keys['s']) player.vy += player.accel * speedMult;
    } else {
        player.vy += 0.7; // Gravity
        if (keys[' '] && (player.isGrounded || player.coyoteTimer > 0)) {
            player.vy = -12; player.coyoteTimer = 0;
        }
    }
    if (keys['a']) player.vx -= player.accel * speedMult;
    if (keys['d']) player.vx += player.accel * speedMult;

    // 2. Movement & Friction (Natural "Slide")
    player.vx *= player.friction;
    player.vy *= (state.view === 'top-down' ? player.friction : 0.98);
    player.x += player.vx;
    player.y += player.vy;

    // 3. Collision & Biome Swapping
    checkBoundaries();
    
    // 4. Update UI
    document.getElementById('sta-fill').style.width = player.stamina + "%";
    document.getElementById('current-biome').innerText = state.biome.toUpperCase();
    
    draw();
    requestAnimationFrame(update);
}

function checkBoundaries() {
    // Floor collision for Side-Scroller
    if (state.view === 'side-scroller' && player.y + player.h > canvas.height - 40) {
        player.y = canvas.height - 40 - player.h;
        player.vy = 0; player.isGrounded = true; player.coyoteTimer = 8;
    } else { player.coyoteTimer--; player.isGrounded = false; }

    // Biome Logic (Horizontal Scroll)
    if (player.x > canvas.width) { player.x = 10; state.biome = 'desert'; }
    if (player.x < 0) { player.x = canvas.width - 10; state.biome = 'forest'; }
}

function draw() {
    const theme = biomes[state.biome];
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Background & Environment Storytelling
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    if (state.view === 'side-scroller') {
        ctx.fillStyle = theme.sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height - 40);
        ctx.fillStyle = '#333'; // "Dirty" ground
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    }

    // Player Sprite (Humanoid Block)
    ctx.fillStyle = theme.player;
    ctx.fillRect(Math.round(player.x), Math.round(player.y), player.w, player.h);
    
    // Head (Visual Juice)
    ctx.fillStyle = '#f3e5ab';
    ctx.fillRect(Math.round(player.x + 4), Math.round(player.y - 4), 16, 16);
}

function interact() {
    // Example Choice Tracking
    if (state.biome === 'forest') {
        state.flags.savedVillage = true;
        document.getElementById('dialogue-box').classList.remove('hidden');
        document.getElementById('dialogue-text').innerText = "Thank you! You saved the village from the shift.";
    }
}

update();
