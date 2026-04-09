// --- 🎹 MageBall 音效與音樂中心 ---

// 1. 核心變數與上下文
let audioCtx = null;
let bgmAudio = null;
let hitAudio = null;

/**
 * 初始化音效系統
 * 由 game.js 的 window.onload 或啟動時呼叫
 */
function initSoundSystem() {
    try {
        bgmAudio = document.getElementById("audio-bgm");
        hitAudio = document.getElementById("audio-hit");
        
        // 設定初始音量
        if (bgmAudio) bgmAudio.volume = 0.4; // 背景音樂稍微小聲點比較耐聽
        if (hitAudio) hitAudio.volume = 0.6;
        
        console.log("✅ 音效系統初始化成功");
    } catch (e) {
        console.warn("⚠️ 部分音頻元件未找到，將以無聲模式運行");
    }
}

// --- 🎵 背景音樂控制 ---

function playBGM() {
    // 防錯：如果初始化沒抓到，再抓一次
    if (!bgmAudio) bgmAudio = document.getElementById("audio-bgm");
    
    if (bgmAudio) {
        bgmAudio.currentTime = 0;
        // 使用 play() 回傳的 Promise 處理瀏覽器限制
        let playPromise = bgmAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("🎵 Alive.mp3 開始播放");
            }).catch(error => {
                console.log("🔇 瀏覽器阻擋自動播放，需等待玩家互動");
            });
        }
    }
}

function stopBGM() {
    if (bgmAudio) {
        bgmAudio.pause();
    }
}

// --- 💥 戰鬥音效 ---

function playHitSound() {
    if (!hitAudio) hitAudio = document.getElementById("audio-hit");
    if (hitAudio) {
        // 重置時間讓連續碰撞聲不會被切掉
        hitAudio.currentTime = 0;
        hitAudio.play().catch(() => {}); 
    }
}

// --- 🌟 大絕招合成音效 (Web Audio API) ---

function playUltSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const tempo = 200;
    const q = 60 / tempo;
    const unit16 = q / 4;
    const unitTriplet = q / 6;
    const getFreq = (startFreq, semitones) => startFreq * Math.pow(2, semitones / 12);

    // A 軌：由高往低俯衝 (C7 -> F4)
    let stepA = 0;
    for (let i = 0; i >= -32; i--) {
        playNote(getFreq(2093.00, i), now + (stepA * unit16), unit16, 0.1);
        stepA++;
    }

    // B 軌：延遲加入的中音俯衝 (E6 -> C4)
    const startTimeB = 16 * unit16;
    let stepB = 0;
    for (let i = 0; i >= -28; i--) {
        playNote(getFreq(1318.51, i), now + startTimeB + (stepB * unit16), unit16, 0.1);
        stepB++;
    }

    // 副音軌：極速三連音俯衝 (C6 -> E4)
    const startTimeSub = startTimeB + (14 * unit16);
    let stepSub = 0;
    for (let i = 0; i >= -20; i--) {
        playNote(getFreq(1046.50, i), now + startTimeSub + (stepSub * unitTriplet), unitTriplet, 0.08);
        stepSub++;
    }
}

/**
 * Web Audio 合成器輔助函數
 */
function playNote(freq, time, dur, vol) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    
    osc.type = 'triangle'; // 使用三角波，聲音較為清脆且有魔法感
    osc.frequency.setValueAtTime(freq, time);
    
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur * 1.2);
    
    osc.connect(g);
    g.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + dur * 1.2);
}

// 綁定視窗載入初始化
window.addEventListener('load', initSoundSystem);
