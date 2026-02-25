const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 500;

let state = { view: 'top-down', biome: 'forest', isSwapping: false };
const player = {
    x: 400, y: 300, w: 24, h: 36, vx: 0, vy: 0,
    accel: 0.5, friction: 0.85, maxSpeed: 5,
    stamina: 100, isGrounded: false, coyoteTimer: 0
};

// Procedural Grass & Parallax Data
const grass = [];
for(let i=0; i<800; i+=20) grass.push({x: i, bend: 0});
const layers = [{speed: 0.1, color: '#1a2e14'}, {speed: 0.3, color: '#25421d'}];

const keys = {};
window.onkeydown = (e) => { 
    keys[e.key.toLowerCase()] = true; 
    if(e.key === 'o') handleSwap(); 
};
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

function handleSwap() {
    if(state.isSwapping) return;
    state.isSwapping = true;
    document.getElementById('flash-overlay').classList.add('flash-active');
    setTimeout(() => {
        state.view = state.view === 'top-down' ? 'side-scroller' : 'top-down';
        player.vy = 0; canvas.classList.add('shake');
    }, 300);
    setTimeout(() => {
        document.getElementById('flash-overlay').classList.remove('flash-active');
        canvas.classList.remove('shake');
        state.isSwapping = false;
    }, 600);
}

function update() {
    let sprint = keys['shift'] && player.stamina > 0 ? 1.8 : 1;
    if(keys['shift'] && player.stamina > 0) player.stamina -= 0.8;
    else if(player.stamina < 100) player.stamina += 0.4;

    // Movement Logic
    if (state.view === 'top-down') {
        if(keys['w']) player.vy -= player.accel * sprint;
        if(keys['s']) player.vy += player.accel * sprint;
    } else {
        player.vy += 0.7; // Gravity
        if(keys[' '] && (player.isGrounded || player.coyoteTimer > 0)) {
            player.vy = -12; player.coyoteTimer = 0;
        }
    }
    if(keys['a']) player.vx -= player.accel * sprint;
    if(keys['d']) player.vx += player.accel * sprint;

    player.vx *= player.friction;
    player.vy *= (state.view === 'top-down' ? player.friction : 0.99);
    player.x += player.vx; player.y += player.vy;

    // Coyote Time & Floor Collision
    if(state.view === 'side-scroller' && player.y + player.h > 460) {
        player.y = 460 - player.h; player.vy = 0;
        player.isGrounded = true; player.coyoteTimer = 10;
    } else { player.coyoteTimer--; player.isGrounded = false; }

    draw();
    document.getElementById('sta-fill').style.width = player.stamina + "%";
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#2e4d23'; ctx.fillRect(0,0,800,500); // Base

    // 1. Parallax Layers
    layers.forEach(l => {
        ctx.fillStyle = l.color;
        let offset = (player.x * l.speed) % 400;
        for(let i=-1; i<3; i++) ctx.fillRect((i*400) - offset, 150, 300, 350);
    });

    // 2. Interactive Grass (Bends when walked on)
    ctx.strokeStyle = '#4a7c36'; ctx.lineWidth = 3;
    grass.forEach(g => {
        let dist = Math.abs(g.x - player.x);
        g.bend = dist < 50 ? (player.vx * 3) : g.bend * 0.9;
        ctx.beginPath(); ctx.moveTo(g.x, 460);
        ctx.quadraticCurveTo(g.x + g.bend, 445, g.x + g.bend * 1.5, 435);
        ctx.stroke();
    });

    // 3. Player Rendering
    ctx.fillStyle = '#d35400';
    ctx.fillRect(Math.round(player.x), Math.round(player.y), player.w, player.h);
    ctx.fillStyle = '#f3e5ab'; // Head
    ctx.fillRect(Math.round(player.x + 4), Math.round(player.y - 6), 16, 16);

    if(state.view === 'side-scroller') {
        ctx.fillStyle = '#222'; ctx.fillRect(0, 460, 800, 40);
    }
}

window.onload = () => setTimeout(() => document.getElementById('loading-screen').style.display='none', 1000);
update();
