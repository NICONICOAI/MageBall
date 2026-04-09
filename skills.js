// --- 💖 MageBall 技能與魔法中心 ---

// 1. 被動技能與隨機魔法數據 (status: 0 關閉, 1 開啟)
const gameSkills = [
    {
        id: "tripleBall",
        name: "魔法三重彈",
        status: 0,
        probability: 0,
        description: "在板子上重置球時，額外生成兩顆球 (未實作)"
    },
    {
        id: "extendedPaddle",
        name: "魔法棒延伸",
        status: 0,
        probability: 0,
        description: "魔法棒長度增加 (未實作)"
    },
    { id: "emptySkill1", name: "空白技能 1", status: 0, probability: 0, description: "預留空格 1" },
    { id: "emptySkill2", name: "空白技能 2", status: 0, probability: 0, description: "預留空格 2" },
];

// 2. 主動大絕招邏輯 (Ult)
function triggerUlt() {
    if (mana < MANA_MAX || isLevelClearing) return;

    let activeBricks = bricks.filter(b => b.status === 1 && b.y >= UI_RECT_HEIGHT);
    let count = activeBricks.length;

    if (count > 300) {
        activeBricks.sort(() => Math.random() - 0.5)
                    .slice(0, Math.floor(count * 0.5))
                    .forEach(b => applyUltDamage(b));
    } else if (count > 50) {
        activeBricks.forEach(b => applyUltDamage(b));
    } else {
        for (let i = 0; i < 100; i++) {
            let b = activeBricks[Math.floor(Math.random() * activeBricks.length)];
            if (b && b.status === 1) applyDamage(b, 2);
        }
    }

    mana = 0; 
    updateUI(); 
    checkWinCondition();
    if (typeof playUltSound === 'function') playUltSound();
}

// 大絕招傷害演算
function applyUltDamage(b) {
    let dmg = (b.hp > 5) ? 4 : Math.ceil(b.hp / 2);
    applyDamage(b, dmg);
}

// 3. 預留：隨機魔法觸發檢查 (未來可以在 applyDamage 之後呼叫)
function checkRandomMagicTrigger() {
    gameSkills.forEach(skill => {
        if (skill.status === 1 && skill.probability > 0) {
            let roll = Math.random() * 100;
            if (roll < skill.probability) {
                console.log(`觸發技能: ${skill.name}`);
                // 這裡未來實作各別技能的效果邏輯
            }
        }
    });
}
