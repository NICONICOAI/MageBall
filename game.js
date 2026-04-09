// --- 🎮 指揮官：核心狀態與流程控制 ---

// 1. 初始化 DOM 引用與基礎變數
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0, lives = 3, mana = 0, isPaused = false;
let currentLevel = 1; 
let isPlaying = false, isStuck = true;

// 捲軸動態參數
let scrollActive = false; 
let scrollSpeed = 0.05; 
let scrollDelayTriggered = false; 

// 遊戲物件
let paddle = { x: 135, y: 0, w: 90, h: 15 }; 
let ball = { x: 180, y: 0, dx: 4, dy: -5, r: 6, active: true };
let bricks = [];
let effects = [];
let fireworks = []; 
let isLevelClearing = false;

// 2. 遊戲初始化與啟動
function startGame() {
    const levelSelector = document.getElementById("levelSelect");
    if(levelSelector) currentLevel = parseInt(levelSelector.value);

    document.getElementById("overlay").style.display = "none";
    score = 0; lives = 3; mana = 0; 
    scrollDelayTriggered = false; isPaused = false;
    isLevelClearing = false;
    
    initBricks();
    resetBall();
    isPlaying = true;
    updateUI();
    if (typeof playBGM === 'function') playBGM();
    requestAnimationFrame(gameLoop);
}

function initBricks() {
    bricks = [];
    const levelData = gameMaps[currentLevel - 1];
    if (!levelData) return;

    scrollActive = levelData.scroll || false;
    let startY = UI_RECT_HEIGHT;

    levelData.data.forEach((line, r) => {
        let row = typeof line === "string" ? line.split('') : line;
        row.forEach((char, c) => {
            let type = parseInt(char, 36);
            if (type > 0) {
                bricks.push({
                    x: c * BRICK_W,
                    y: startY + r * BRICK_H,
                    w: BRICK_W, h: BRICK_H,
                    type: type,
                    hp: BRICK_CONFIG[type].hp,
                    maxHp: BRICK_CONFIG[type].hp,
                    status: 1
                });
            }
        });
    });
    if (scrollActive) scrollDelayTriggered = false; 
}

function resetBall() { isStuck = true; ball.active = true; ball.dx = 4; ball.dy = -5; }

function updateUI() {
    document.getElementById("scoreVal").innerText = score;
    document.getElementById("lives-display").innerText = "❤️".repeat(lives);
    const fill = document.getElementById("mana-fill");
    const btn = document.getElementById("ult-node");
    if (fill) fill.style.width = (mana / MANA_MAX) * 100 + "%";
    if (btn) {
        if(mana >= MANA_MAX) { btn.className = "ready"; btn.innerText = "💖"; }
        else { btn.className = ""; btn.innerText = "🖤"; }
    }
}

// 3. 核心主迴圈
function gameLoop() {
    if (!isPlaying || isPaused) return;

    // 捲軸推進邏輯 (保持在指揮官層級，因為涉及失敗判定)
    if (scrollActive && !isLevelClearing && scrollDelayTriggered) {
        let activeBricks = bricks.filter(b => b.status === 1);
        let speed = (activeBricks.length < 100) ? 1.5 : scrollSpeed;
        
        for (let b of bricks) {
            if (b.status === 1) {
                b.y += speed;
                if (b.y + b.h > paddle.y) {
                    alert("防線被突破！"); goHome(); return;
                }
            }
        }
    }

    // 呼叫物理模組 (來自 physics.js)
    updatePhysics();

    // 呼叫渲染模組 (來自 renderer.js)
    drawAll();

    // 檢查過關
    checkWinCondition();

    requestAnimationFrame(gameLoop);
}

// 4. 輸入控制
function handleInput(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    paddle.x = (clientX - rect.left) * (GameWidth / rect.width) - paddle.w/2;
    if(paddle.x < 0) paddle.x = 0; 
    if(paddle.x > GameWidth - paddle.w) paddle.x = GameWidth - paddle.w;
    if(e.cancelable) e.preventDefault();
}

canvas.addEventListener("touchmove", handleInput, {passive: false});
canvas.addEventListener("mousemove", handleInput);
canvas.addEventListener("touchstart", (e) => handleInput(e), {passive: false});
canvas.addEventListener("touchend", () => { if (isStuck && isPlaying && !isPaused) isStuck = false; });
canvas.addEventListener("mousedown", () => { if (isStuck && isPlaying && !isPaused) isStuck = false; });

// 5. 系統功能
function checkWinCondition() {
    let remaining = bricks.filter(b => b.status === 1).length;
    if (remaining === 0 && !isLevelClearing && isPlaying) {
        isLevelClearing = true; ball.active = false;
        effects.push({ x: 180, y: GameHeight / 2, text: "STAGE CLEAR!", life: 2.0, velocity: -0.3 });
        setTimeout(() => { if(confirm("過關！下一關？")) startNextLevel(); else goHome(); }, 1500);
    }
}

function startNextLevel() {
    isPaused = false; isLevelClearing = false;
    currentLevel++; 
    const levelSelector = document.getElementById("levelSelect");
    if(levelSelector) levelSelector.value = currentLevel;
    initBricks(); resetBall(); updateUI();
}

function goHome() {
    isPlaying = false;
    if (typeof stopBGM === 'function') stopBGM();
    document.getElementById("overlay").style.display = "flex";
}

function togglePause() { 
    isPaused = !isPaused; 
    if(!isPaused) { requestAnimationFrame(gameLoop); if (typeof playBGM === 'function') playBGM(); }
    else { if (typeof stopBGM === 'function') stopBGM(); }
}

function updateLevelMenu() {
    const levelSelector = document.getElementById("levelSelect");
    if (!levelSelector || typeof gameMaps === 'undefined') return;
    levelSelector.innerHTML = ""; 
    gameMaps.forEach((map, index) => {
        let opt = document.createElement("option");
        opt.value = index + 1; opt.innerHTML = `第 ${index + 1} 關`;
        levelSelector.appendChild(opt);
    });
}

// 事件綁定與初始化
window.addEventListener('load', updateLevelMenu);
window.onresize = resize; 
resize();
