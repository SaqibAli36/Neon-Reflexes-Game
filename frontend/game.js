document.addEventListener("DOMContentLoaded", () => {

    // === Game Variables ===
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

    let globalVolume = 1;

    // === Elements ===
    const arena = document.getElementById("arena");
    const target = document.getElementById("target");
    const scoreEl = document.getElementById("score");
    const timeEl = document.getElementById("time");
    const startOverlay = document.getElementById("start-overlay");

    // === POPUP SYSTEM ===
    const popup = document.createElement("div");
    Object.assign(popup.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0.85)",
        display: "none",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "999",
        color: "#00fff0",
        fontSize: "24px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        flexDirection: "column",
        padding: "20px"
    });

    const popupText = document.createElement("p");
    popupText.style.marginBottom = "20px";

    const popupBtn = document.createElement("button");
    popupBtn.textContent = "OK";
    Object.assign(popupBtn.style, {
        padding: "12px 24px",
        fontSize: "18px",
        background: "#ff00ff",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 0 10px #ff00ff"
    });

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

    // === VOLUME CONTROLS (TOP RIGHT) ===
    const volumeMenu = document.createElement("div");
    Object.assign(volumeMenu.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.7)",
        color: "#00fff0",
        padding: "10px",
        borderRadius: "10px",
        fontSize: "14px",
        border: "2px solid #ff00ff",
        boxShadow: "0 0 15px #ff00ff",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: "1000"
    });

    const muteLabel = document.createElement("label");
    muteLabel.textContent = "Mute ";
    const muteCheckbox = document.createElement("input");
    muteCheckbox.type = "checkbox";

    muteCheckbox.onchange = () => {
        globalVolume = muteCheckbox.checked ? 0 : volumeSlider.value;
        updateVolumes();
    };

    muteLabel.appendChild(muteCheckbox);

    const volumeLabel = document.createElement("label");
    volumeLabel.textContent = "Volume ";
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

    volumeMenu.appendChild(muteLabel);
    volumeMenu.appendChild(volumeLabel);
    document.body.appendChild(volumeMenu);

    function updateVolumes() {
        tickSound.volume = globalVolume;
        warningSound.volume = globalVolume;
        gameOverSound.volume = globalVolume;
        clickSound.volume = globalVolume;
    }

    updateVolumes();

    // === RESPONSIVE TARGET MOVEMENT ===
    function moveTarget() {
        const maxX = arena.clientWidth - targetSize;
        const maxY = arena.clientHeight - targetSize;

        const x = Math.random() * maxX;
        const y = Math.random() * maxY;

        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
        target.style.width = `${targetSize}px`;
        target.style.height = `${targetSize}px`;
    }

    function moveLoop() {
        if (!paused) moveTarget();
        setTimeout(moveLoop, moveInterval);
    }

    // === CLICK LOGIC (MOBILE FRIENDLY) ===
    target.addEventListener("click", handleHit);
    target.addEventListener("touchstart", handleHit);

    function handleHit(e) {
        e.preventDefault();
        if (paused) return;

        score++;
        scoreEl.textContent = score;

        clickSound.currentTime = 0;
        clickSound.play();

        targetSize = Math.max(targetSize - 1, 18);

        if (score % 3 === 0) {
            moveInterval = Math.max(moveInterval - 100, 400);
        }

        moveTarget();
    }

    // === TIMER (WARNING SOUND FIXED) ===
    setInterval(() => {
        if (!paused) {
            if (time > 0) {
                time--;
                timeEl.textContent = time;

                tickSound.currentTime = 0;
                tickSound.play();

                if (time <= 5) {
                    warningSound.pause();
                    warningSound.currentTime = 0;
                    warningSound.play();
                }
            } else {
                gameOverSound.currentTime = 0;
                gameOverSound.play();
                paused = true;

                showPopup(`GAME OVER\nScore: ${score}`, restartGame);
            }
        }
    }, 1000);

    // === RESTART ===
    function restartGame() {
        score = 0;
        time = 30;
        targetSize = 40;
        moveInterval = 1500;
        paused = false;

        scoreEl.textContent = score;
        timeEl.textContent = time;
        moveTarget();
    }

    // === KEYBOARD SUPPORT ===
    document.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "p") paused = !paused;
        if (e.key.toLowerCase() === "r") restartGame();
    });

    // === START OVERLAY ===
    if (startOverlay) {
        startOverlay.onclick = () => {
            startOverlay.style.display = "none";
            moveTarget();
            moveLoop();
        };
    } else {
        moveTarget();
        moveLoop();
    }

});
