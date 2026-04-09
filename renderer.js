//畫圖相關

// --- 🎨 渲染與視覺特效中心 ---

// 繪製背景邊界
function drawBorder() {
    ctx.lineWidth = 2; 
    ctx.strokeStyle = "#fff"; 
    ctx.beginPath(); 
    ctx.moveTo(0, UI_RECT_HEIGHT); 
    ctx.lineTo(GameWidth, UI_RECT_HEIGHT); 
    ctx.stroke();
}

// 繪製所有內容
function drawAll() {
    ctx.clearRect(0, 0, GameWidth, GameHeight);
    
    drawBorder();

    // 1. 磚塊渲染
    bricks.forEach(b => {
        if(b.status === 1 && b.y >= UI_RECT_HEIGHT && b.y < GameHeight) {
            ctx.fillStyle = BRICK_CONFIG[b.type].color;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.strokeRect(b.x, b.y, b.w, b.h);
            
            // 裂痕效果
            let dmg = 1 - (b.hp / b.maxHp);
            if(dmg > 0.1 && b.maxHp > 1) {
                ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.beginPath();
                if(dmg > 0.1) { ctx.moveTo(b.x+2, b.y+2); ctx.lineTo(b.x+b.w-2, b.y+b.h-2); }
                if(dmg > 0.4) { ctx.moveTo(b.x+b.w-2, b.y+2); ctx.lineTo(b.x+2, b.y+b.h-2); }
                ctx.stroke();
            }
        }
    });

    // 2. 擋板渲染 (使用像素風格)
    const pxSize = paddle.w / 27; 
    paddleSkin.forEach((row, py) => {
        row.split('').forEach((pixel, px) => {
            if(pixel !== "0") {
                ctx.fillStyle = colors[pixel];
                ctx.fillRect(paddle.x + px*pxSize, paddle.y + py*pxSize, pxSize+0.5, pxSize+0.5);
            }
        });
    });

    // 3. 球體渲染
    if (ball.active) {
        ctx.beginPath(); 
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = "#0ff"; 
        ctx.fill(); 
        ctx.closePath();
    }
    
    // 4. 特效與煙火
    drawEffects(); 
    drawFireworks();
}

// 文字特效 (例如 STAGE CLEAR)
function drawEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        let e = effects[i]; 
        ctx.save(); 
        ctx.globalAlpha = e.life; 
        ctx.fillStyle = "#ff69b4"; 
        ctx.font = "bold 28px Arial"; 
        ctx.textAlign = "center";
        ctx.fillText(e.text, e.x, e.y); 
        ctx.restore(); 
        e.y += e.velocity; 
        e.life -= 0.01; 
        if (e.life <= 0) effects.splice(i, 1);
    }
}

// 煙火顆粒
function createFirework(x, y) {
    for(let i=0; i<8; i++) {
        fireworks.push({ 
            x: x, y: y, 
            vx: (Math.random()-0.5)*5, 
            vy: (Math.random()-0.5)*5-2, 
            life: 1.0, 
            color: "#fff" 
        });
    }
}

function drawFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let f = fireworks[i]; 
        ctx.save(); 
        ctx.globalAlpha = f.life; 
        ctx.fillStyle = f.color; 
        ctx.fillRect(f.x, f.y, 2, 2); 
        ctx.restore();
        f.x += f.vx; 
        f.y += f.vy; 
        f.vy += 0.1; 
        f.life -= 0.02; 
        if (f.life <= 0) fireworks.splice(i, 1);
    }
}

// 畫面縮放邏輯
function resize() {
    const box = document.getElementById("game-box").getBoundingClientRect();
    if (!box) return; 
    canvas.width = GameWidth; 
    canvas.height = GameWidth * (box.height / box.width);
    GameHeight = canvas.height;
    paddle.y = GameHeight - 80; 
}
