// === Game variables ===
let score = 0;
let time = 30;

let targetSize = 40;
let moveInterval = 1500;

let paused = false;
let popupActive = false;

// === Sounds ===
const tickSound = new Audio("/sounds/tick.mp3");
const warningSound = new Audio("/sounds/warning.mp3");
const gameOverSound = new Audio("/sounds/gameover.mp3");
const clickSound = new Audio("/sounds/click.mp3");

// Master volume
let globalVolume = 1;

// === Elements ===
const target = document.getElementById("target");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

// === Pop-up ===
const popup = document.createElement("div");
Object.assign(popup.style, {
    position: "fixed", top: "0", left: "0",
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.85)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: "999", color: "#00fff0", fontSize: "28px", textAlign: "center",
    fontFamily: "Arial, sans-serif", border: "2px solid #ff00ff",
    borderRadius: "15px", boxShadow: "0 0 20px #ff00ff,0 0 40px #0ff0fc",
    padding: "40px", display: "none", flexDirection: "column"
});
const popupText = document.createElement("p");
popupText.style.marginBottom = "20px";
const popupBtn = document.createElement("button");
popupBtn.textContent = "OK";
Object.assign(popupBtn.style, {
    padding: "10px 20px", fontSize: "18px",
    background: "#ff00ff", color: "#fff",
    border: "none", borderRadius: "8px", cursor: "pointer",
    boxShadow: "0 0 10px #ff00ff"
});
popupBtn.onmouseover = () => { popupBtn.style.background = "#0ff0fc"; popupBtn.style.color = "#000"; };
popupBtn.onmouseout = () => { popupBtn.style.background = "#ff00ff"; popupBtn.style.color = "#fff"; };
popup.appendChild(popupText);
popup.appendChild(popupBtn);
document.body.appendChild(popup);

function showPopup(message, callback) {
    if (popupActive) return;
    popupActive = true;
    popupText.textContent = message;
    popup.style.display = "flex";
    popupBtn.onclick = () => {
        popup.style.display = "none";
        popupActive = false;
        if (callback) callback();
    };
}

// === Volume Controls (top-right) ===
const volumeMenu = document.createElement("div");
Object.assign(volumeMenu.style, {
    position: "fixed", top: "10px", right: "10px",
    background: "rgba(0,0,0,0.7)", color: "#00fff0",
    padding: "15px", borderRadius: "12px",
    fontFamily: "Arial, sans-serif", fontSize: "16px",
    border: "2px solid #ff00ff", boxShadow: "0 0 15px #ff00ff", display: "flex", flexDirection: "column", gap: "10px"
});

// Mute checkbox
const muteLabel = document.createElement("label");
muteLabel.textContent = "Mute All Sounds ";
const muteCheckbox = document.createElement("input");
muteCheckbox.type = "checkbox";
muteCheckbox.onchange = () => {
    globalVolume = muteCheckbox.checked ? 0 : volumeSlider.value;
    updateVolumes();
};
muteLabel.appendChild(muteCheckbox);
volumeMenu.appendChild(muteLabel);

// Volume slider
const volumeLabel = document.createElement("label");
volumeLabel.textContent = "Volume: ";
const volumeSlider = document.createElement("input");
volumeSlider.type = "range";
volumeSlider.min = 0;
volumeSlider.max = 1;
volumeSlider.step = 0.05;
volumeSlider.value = globalVolume;
volumeSlider.oninput = () => {
    if (!muteCheckbox.checked) {
        globalVolume = volumeSlider.value;
        updateVolumes();
    }
};
volumeLabel.appendChild(volumeSlider);
volumeMenu.appendChild(volumeLabel);

document.body.appendChild(volumeMenu);

function updateVolumes() {
    tickSound.volume = globalVolume;
    warningSound.volume = globalVolume;
    gameOverSound.volume = globalVolume;
    clickSound.volume = globalVolume;
}

// === Bottom-right control buttons ===
const controlMenu = document.createElement("div");
Object.assign(controlMenu.style, {
    position: "fixed", bottom: "20px", right: "20px",
    display: "flex", flexDirection: "column", gap: "10px", zIndex: "900"
});

function createButton(label, onClick) {
    const btn = document.createElement("button");
    btn.textContent = label;
    Object.assign(btn.style, {
        padding: "12px 20px", fontSize: "16px",
        background: "#ff00ff", color: "#fff",
        border: "none", borderRadius: "10px",
        cursor: "pointer", boxShadow: "0 0 10px #ff00ff",
        fontFamily: "Arial, sans-serif"
    });
    btn.onmouseover = () => { btn.style.background = "#0ff0fc"; btn.style.color = "#000"; };
    btn.onmouseout = () => { btn.style.background = "#ff00ff"; btn.style.color = "#fff"; };
    btn.onclick = onClick;
    return btn;
}

const pauseBtn = createButton("Pause", () => {
    if (popupActive) return;
    paused = true;
    showPopup("Game Paused. Press OK to resume", () => { paused = false; });
});

const restartBtn = createButton("Restart", () => restartGame());

const quitBtn = createButton("Quit", () => {
    paused = true;
    showPopup("Thanks for playing!", () => {
        score = 0;
        time = 0;
        scoreEl.textContent = score;
        timeEl.textContent = time;
        target.style.display = "none";
    });
});

controlMenu.appendChild(pauseBtn);
controlMenu.appendChild(restartBtn);
controlMenu.appendChild(quitBtn);
document.body.appendChild(controlMenu);

// === Game logic ===
function moveTarget() {
    fetch("http://127.0.0.1:5000/spawn")
        .then(res => res.json())
        .then(data => {
            target.style.left = data.x + "px";
            target.style.top = data.y + "px";
            target.style.width = targetSize + "px";
            target.style.height = targetSize + "px";
        })
        .catch(err => console.error(err));
}

function moveLoop() {
    if (!paused) moveTarget();
    setTimeout(moveLoop, moveInterval);
}

target.onclick = () => {
    if (paused) return;
    score++;
    scoreEl.textContent = score;
    clickSound.currentTime = 0;
    clickSound.play();

    targetSize = Math.max(targetSize - 1, 15);
    if (score % 3 === 0) moveInterval = Math.max(moveInterval - 100, 400);
    moveTarget();
};

setInterval(() => {
    if (!paused) {
        if (time > 0) {
            time--;
            timeEl.textContent = time;
            tickSound.currentTime = 0;
            tickSound.play();
            if (time <= 5) warningSound.currentTime = 0; warningSound.play();
        } else {
            gameOverSound.play();
            paused = true;
            showPopup(`GAME OVER!\nScore: ${score}`, () => restartGame());
        }
    }
}, 1000);

// === Restart ===
function restartGame() {
    score = 0;
    time = 30;
    targetSize = 40;
    moveInterval = 1500;
    paused = false;
    scoreEl.textContent = score;
    timeEl.textContent = time;
    target.style.display = "block";
    moveTarget();
}

// === Keyboard shortcuts ===
document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "p") pauseBtn.click();
    if (e.key.toLowerCase() === "r") restartBtn.click();
});

// === Initialize ===
moveTarget();
moveLoop();
updateVolumes();
