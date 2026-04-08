const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let GameWidth = 320;
let GameHeight = 480;
let score = 0, lives = 3, mana = 0, isPaused = false;
const MAX_LIVES = 5;
const MANA_MAX = 150;
let isPlaying = false, isStuck = true;

let paddle = { x: 110, y: 0, w: 90, h: 15 };
let ball = { x: 160, y: 0, dx: 4, dy: -5, r: 6 };
let bricks = [];
let effects = [];
let fireworks = []; 
let isLevelClearing = false;

const colors = { "k":"#000", "5":"#FFD700", "f":"#FFB6C1", "c":"#FF1493" };
// 這是你辛苦調整出來的魔法棒皮膚
const paddleSkin = ["000000000000k5k000000000000","00000000000kfffk00000000000","cccccccccckkffkkkcccccccccc","ffffffffffkf55fkffffffffff","cccccccccckkffkkkcccccccccc","00000000000kfffk00000000000","000000000000k5k000000000000"];

function resize() {
    const box = document.getElementById("game-box").getBoundingClientRect();
    canvas.width = 320;
    canvas.height = 320 * (box.height / box.width);
    GameHeight = canvas.height;
    paddle.y = GameHeight - 80; 
}
window.onresize = resize; resize();

function startGame() {
    document.getElementById("overlay").style.display = "none";
    score = 0; lives = 3; mana = 0; isPaused = false;
    initBricks();
    resetBall();
    isPlaying = true;
    updateUI();
    requestAnimationFrame(gameLoop);
}

function togglePause() { isPaused = !isPaused; if(!isPaused) requestAnimationFrame(gameLoop); }

function goHome() {
    if (isPlaying) { if (!confirm("確認回到首頁")) return; }
    isPlaying = false;
    document.getElementById("overlay").style.display = "flex";
}

function initBricks() {
    bricks = [];
    for(let r=0; r<8; r++) {
        for(let c=0; c<12; c++) {
            bricks.push({ x: 25 + c*22, y: 100 + r*15, w: 18, h: 10, status: 1 });
        }
    }
}

function resetBall() { isStuck = true; ball.dx = 4; ball.dy = -5; }

function updateUI() {
    document.getElementById("scoreVal").innerText = score;
    document.getElementById("lives-display").innerText = "❤️".repeat(lives);
    const fill = document.getElementById("mana-fill");
    const btn = document.getElementById("ult-node");
    fill.style.height = (mana / MANA_MAX) * 100 + "%";
    if(mana >= MANA_MAX) { btn.className = "ready"; btn.innerText = "💖"; } 
    else { btn.className = ""; btn.innerText = "🖤"; }
}

function gameLoop() {
    if (!isPlaying || isPaused) return;
    ctx.clearRect(0, 0, GameWidth, GameHeight);

    if (isStuck) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r;
    } else {
        ball.x += ball.dx; ball.y += ball.dy;
        if (ball.x + ball.r > 320 || ball.x - ball.r < 0) ball.dx *= -1;
        if (ball.y - ball.r < 0) ball.dy *= -1;
        if (ball.y > GameHeight) {
            lives--; updateUI();
            if (lives <= 0) goHome(); else resetBall();
        }

        if (ball.y + ball.r > paddle.y && ball.y - ball.r < paddle.y + paddle.h &&
            ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
            ball.dy = -Math.abs(ball.dy); ball.y = paddle.y - ball.r;
            let hit = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
            ball.dx = hit * 6;
            mana = Math.min(MANA_MAX, mana + (Math.abs(hit) < 0.3 ? 15 : 5));
            updateUI();
        }

        let activeCount = 0;
        let hasHitThisFrame = false;

        for (let b of bricks) {
            if (b.status === 1) {
                activeCount++;
                if (!hasHitThisFrame && 
                    ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
                    ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
                    b.status = 0;
                    score += 10;
                    activeCount--;
                    hasHitThisFrame = true;
                    let overlapX = (ball.x < b.x) ? (ball.x + ball.r - b.x) : (b.x + b.w - (ball.x - ball.r));
                    let overlapY = (ball.y < b.y) ? (ball.y + ball.r - b.y) : (b.y + b.h - (ball.y - ball.r));
                    if (overlapX < overlapY) { ball.dx *= -1; ball.x += (ball.dx > 0) ? overlapX : -overlapX; } 
                    else { ball.dy *= -1; ball.y += (ball.dy > 0) ? overlapY : -overlapY; }
                    updateUI();
                }
            }
        }
        if (activeCount === 0 && bricks.length > 0) checkWinCondition();
    }
    drawAll();
    requestAnimationFrame(gameLoop);
}

function drawAll() {
    bricks.forEach(b => { if(b.status === 1) { ctx.fillStyle = "#32CD32"; ctx.fillRect(b.x, b.y, b.w, b.h); } });

    const pxSize = paddle.w / 27; 
    paddleSkin.forEach((row, py) => {
        row.split('').forEach((pixel, px) => {
            if(pixel !== "0") {
                ctx.fillStyle = colors[pixel];
                ctx.fillRect(paddle.x + px*pxSize, paddle.y + py*pxSize, pxSize+0.5, pxSize+0.5);
            }
        });
    });

    ctx.beginPath(); 
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#0ff";
    ctx.fill(); 
    ctx.closePath();

    drawEffects();
    drawFireworks();
}

function drawEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        let e = effects[i];
        ctx.save();
        ctx.globalAlpha = e.life;
        ctx.fillStyle = "#ff69b4";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(e.text, e.x, e.y);
        ctx.restore();
        e.y += e.velocity; e.life -= 0.01;
        if (e.life <= 0) effects.splice(i, 1);
    }
}

function drawFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let f = fireworks[i];
        ctx.save();
        ctx.globalAlpha = f.life;
        ctx.fillStyle = f.color;
        ctx.fillRect(f.x, f.y, 3, 3);
        ctx.restore();
        f.x += f.vx; f.y += f.vy; f.vy += 0.1; f.life -= 0.02;
        if (f.life <= 0) fireworks.splice(i, 1);
    }
}

function createFirework(x, y) {
    for(let i=0; i<8; i++) {
        fireworks.push({
            x: x, y: y,
            vx: (Math.random()-0.5)*5,
            vy: (Math.random()-0.5)*5 - 2,
            life: 1.0, 
            color: colors[Object.keys(colors)[Math.floor(Math.random()*4)]]
        });
    }
}

function handleInput(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    paddle.x = (clientX - rect.left) * (320 / rect.width) - paddle.w/2;
    if(paddle.x < 0) paddle.x = 0; if(paddle.x > 320 - paddle.w) paddle.x = 320 - paddle.w;
    if(e.cancelable) e.preventDefault();
}
canvas.addEventListener("touchmove", handleInput, {passive: false});
canvas.addEventListener("mousemove", handleInput);
canvas.addEventListener("touchstart", (e) => { handleInput(e) }, {passive: false});
canvas.addEventListener("touchend", (e) => { if (isStuck && isPlaying && !isPaused) isStuck = false; });
canvas.addEventListener("mousedown", () => { if(isStuck) isStuck = false; });

function triggerUlt() {
    if (mana < MANA_MAX || isLevelClearing) return;
    let activeBricks = bricks.filter(b => b.status === 1);
    let count = activeBricks.length;
    let msg = count > 50 ? "大範圍削減！" : "全屏清場！";
    bricks.forEach(b => {
        if (b.status === 1 && (count <= 50 || Math.random() > 0.5)) {
            b.status = 0; score += 10;
            createFirework(b.x + b.w/2, b.y + b.h/2);
        }
    });
    createFirework(160, GameHeight / 2);
    effects.push({ x: 160, y: GameHeight / 2, text: msg, life: 1.0, velocity: -0.5 });
    mana = 0; score += 500; updateUI();
    checkWinCondition();
}

function checkWinCondition() {
    let remaining = bricks.filter(b => b.status === 1).length;
    if (remaining === 0 && !isLevelClearing) {
        isLevelClearing = true;
        effects.push({ x: 160, y: GameHeight / 2 + 40, text: "恭喜過關！", life: 2.0, velocity: -0.3 });
        setTimeout(() => {
            if(confirm("恭喜破關！要挑戰下一關嗎？")) startGame(); 
            else goHome();
            isLevelClearing = false;
        }, 3000);
    }
}
