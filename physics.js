// --- ⚙️ 物理與碰撞核心 ---

// 1. 傷害與得分處理
function applyDamage(b, amt) {
    b.hp -= amt;
    if (b.hp <= 0) {
        b.status = 0;
        score += BRICK_CONFIG[b.type].score;
        
        // 啟動捲軸遞補
        if (!isStuck) scrollDelayTriggered = true;

        // 呼叫渲染層的特效 (由 renderer.js 提供)
        if (typeof createFirework === 'function') createFirework(b.x + b.w/2, b.y + b.h/2);
    }
}

// 2. 球體碰撞逻辑
function updatePhysics() {
    if (isStuck) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r;
        return;
    }

    ball.x += ball.dx; 
    ball.y += ball.dy;
    
    // --- 邊界反彈 ---
    if (ball.x + ball.r > GameWidth || ball.x - ball.r < 0) {
        ball.dx *= -1; 
        if (typeof playHitSound === 'function') playHitSound();
    }
    // 頂部邊界 (考慮 UI 區域)
    if (ball.y - ball.r < UI_RECT_HEIGHT) { 
        ball.dy *= -1; 
        ball.y = UI_RECT_HEIGHT + ball.r; 
        if (typeof playHitSound === 'function') playHitSound();
    }

    // --- 掉落判定 ---
    if (ball.active && ball.y > GameHeight) {
        lives--; 
        updateUI();
        if (lives <= 0) goHome(); else resetBall();
    }

    // --- 擋板碰撞 (帶有角度偏移與能量獲取) ---
    if (ball.active && ball.y + ball.r > paddle.y && ball.y - ball.r < paddle.y + paddle.h &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
        
        ball.dy = -Math.abs(ball.dy); 
        ball.y = paddle.y - ball.r;
        
        // 根據撞擊點決定反彈角度
        let hitPos = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
        ball.dx = hitPos * 7;
        
        // 能量獲取：正中間擊球能量較高
        mana = Math.min(MANA_MAX, mana + (Math.abs(hitPos) < 0.3 ? 12 : 6));
        updateUI();
        if (typeof playHitSound === 'function') playHitSound();
    }

    // --- 磚塊碰撞偵測 ---
    checkBrickCollision();
}

// 3. 磚塊碰撞詳細判定 (防止穿模邏輯)
function checkBrickCollision() {
    let hasHit = false;
    for (let b of bricks) {
        if (b.status === 1 && !hasHit && b.y >= UI_RECT_HEIGHT - 20) {
            if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
                ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
                
                applyDamage(b, 1);
                mana = Math.min(MANA_MAX, mana + 1);
                hasHit = true; 
                updateUI();
                
                // 計算碰撞深度以決定反彈方向
                let overlapL = (ball.x + ball.r) - b.x;
                let overlapR = (b.x + b.w) - (ball.x - ball.r);
                let overlapT = (ball.y + ball.r) - b.y;
                let overlapB = (b.y + b.h) - (ball.y - ball.r);
                let min = Math.min(overlapL, overlapR, overlapT, overlapB);

                if (min === overlapL || min === overlapR) {
                    ball.dx *= -1;
                    ball.x = (min === overlapL) ? (b.x - ball.r) : (b.x + b.w + ball.r);
                } else {
                    ball.dy *= -1;
                    ball.y = (min === overlapT) ? (b.y - ball.r) : (b.y + b.h + ball.r);
                }
                if (typeof playHitSound === 'function') playHitSound();
            }
        }
    }
}
