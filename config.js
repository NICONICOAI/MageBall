// --- 🧱 磚塊等級配置中心 ---
const BRICK_CONFIG = {
    0: { color: "transparent", hp: 0, score: 0 },
    1: { color: "#FFD700", hp: 1,  score: 10 }, 
    2: { color: "#FF8C00", hp: 2,  score: 20 },
    3: { color: "#FF4500", hp: 4,  score: 40 },
    4: { color: "#32CD32", hp: 7,  score: 70 },
    5: { color: "#1E90FF", hp: 10, score: 100 },
    6: { color: "#00FFFF", hp: 13, score: 130 },
    7: { color: "#FFFFFF", hp: 16, score: 160 },
    8: { color: "#E6E6FA", hp: 20, score: 200 },
    9: { color: "#800080", hp: 25, score: 250 },
    10: { color: "#FF69B4", hp: 30, score: 500 }
};

// --- 🛠️ 核心常數 ---
const UI_RECT_HEIGHT = 60; 
const GameWidth = 360; 
const MAX_LIVES = 5;
const MANA_MAX = 150;

// --- 🎨 美術資產 (擋板皮膚) ---
const colors = { "k":"#000", "5":"#FFD700", "f":"#FFB6C1", "c":"#FF1493" };
const paddleSkin = [
    "000000000000k5k000000000000",
    "00000000000kfffk00000000000",
    "cccccccccckkffkkkcccccccccc",
    "ffffffffffkf55fkffffffffff",
    "cccccccccckkffkkkcccccccccc",
    "00000000000kfffk00000000000",
    "000000000000k5k000000000000"
];

// --- 捲軸網格參數 ---
const BRICK_COLS = 30; 
const BRICK_W = 12; 
const BRICK_H = 12; 
