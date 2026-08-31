```javascript
/* =========================================
   SnakeRush
   Game Logic
========================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dashboard = document.getElementById("dashboard");
const gameScreen = document.getElementById("gameScreen");
const statsScreen = document.getElementById("statsScreen");
const settingsScreen = document.getElementById("settingsScreen");
const howToPlayScreen = document.getElementById("howToPlayScreen");

const playBtn = document.getElementById("playBtn");
const statsBtn = document.getElementById("statsBtn");
const settingsBtn = document.getElementById("settingsBtn");
const howToPlayBtn = document.getElementById("howToPlayBtn");

const backFromStats = document.getElementById("backFromStats");
const backFromSettings = document.getElementById("backFromSettings");
const backFromHowToPlay = document.getElementById("backFromHowToPlay");

const homeFromGame = document.getElementById("homeFromGame");
const pauseBtn = document.getElementById("pauseBtn");
const startRoundBtn = document.getElementById("startRoundBtn");

const gameMessage = document.getElementById("gameMessage");

const scoreElement = document.getElementById("score");
const gameHighScoreElement = document.getElementById("gameHighScore");

const dashboardHighScore = document.getElementById("dashboardHighScore");
const statsBestScore = document.getElementById("statsBestScore");
const statsFood = document.getElementById("statsFood");
const statsGames = document.getElementById("statsGames");
const statsLongest = document.getElementById("statsLongest");

const foodCollectedElement = document.getElementById("foodCollected");
const gamesPlayedElement = document.getElementById("gamesPlayed");
const longestSnakeElement = document.getElementById("longestSnake");

const soundToggle = document.getElementById("soundToggle");
const vibrationToggle = document.getElementById("vibrationToggle");


/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY = "snakeRushStats";

let savedStats = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || {
    highScore: 0,
    foodCollected: 0,
    gamesPlayed: 0,
    longestSnake: 3
};


/* =========================================
   GAME VARIABLES
========================================= */

let snake = [];
let food = {};

let direction = {
    x: 1,
    y: 0
};

let nextDirection = {
    x: 1,
    y: 0
};

let score = 0;

let gameRunning = false;
let gamePaused = false;

let gameLoop = null;

let gridSize = 20;

let cellSize = 20;

let lastTouchX = 0;
let lastTouchY = 0;


/* =========================================
   SOUND
========================================= */

let audioContext = null;

function playBeep(frequency = 500, duration = 0.06) {

    if (!soundToggle || !soundToggle.checked) {
        return;
    }

    try {

        if (!audioContext) {
            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.06,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {
        // Audio is optional.
    }
}


/* =========================================
   VIBRATION
========================================= */

function vibrate(pattern = 30) {

    if (
        vibrationToggle &&
        vibrationToggle.checked &&
        "vibrate" in navigator
    ) {
        navigator.vibrate(pattern);
    }
}


/* =========================================
   SCREEN MANAGEMENT
========================================= */

function showScreen(screen) {

    document.querySelectorAll(".screen").forEach(
        item => item.classList.remove("active")
    );

    screen.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   DASHBOARD DATA
========================================= */

function updateDashboard() {

    dashboardHighScore.textContent = savedStats.highScore;
    foodCollectedElement.textContent = savedStats.foodCollected;
    gamesPlayedElement.textContent = savedStats.gamesPlayed;
    longestSnakeElement.textContent = savedStats.longestSnake;

    statsBestScore.textContent = savedStats.highScore;
    statsFood.textContent = savedStats.foodCollected;
    statsGames.textContent = savedStats.gamesPlayed;
    statsLongest.textContent = savedStats.longestSnake;

    gameHighScoreElement.textContent = savedStats.highScore;
}


function saveStats() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedStats)
    );

    updateDashboard();
}


/* =========================================
   CANVAS
========================================= */

function resizeCanvas() {

    const rect = document
        .getElementById("gameArea")
        .getBoundingClientRect();

    const size = Math.floor(
        Math.min(rect.width, rect.height)
    );

    const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;

    canvas.style.width = size + "px";
    canvas.style.height = size + "px";

    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    cellSize = size / gridSize;

    drawGame();
}


/* =========================================
   INITIAL SNAKE
========================================= */

function createSnake() {

    snake = [
        {
            x: 10,
            y: 10
        },
        {
            x: 9,
            y: 10
        },
        {
            x: 8,
            y: 10
        }
    ];
}


/* =========================================
   FOOD
========================================= */

function createFood() {

    let validPosition = false;

    while (!validPosition) {

        food = {
            x: Math.floor(
                Math.random() * gridSize
            ),
            y: Math.floor(
                Math.random() * gridSize
            )
        };

        validPosition = !snake.some(
            segment =>
                segment.x === food.x &&
                segment.y === food.y
        );
    }
}


/* =========================================
   START GAME
========================================= */

function startGame() {

    clearInterval(gameLoop);

    score = 0;

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };

    createSnake();
    createFood();

    scoreElement.textContent = score;

    gameRunning = true;
    gamePaused = false;

    pauseBtn.textContent = "Ⅱ";

    gameMessage.style.display = "none";

    resizeCanvas();

    /*
        110ms gives a smooth classic Snake speed.
    */

    gameLoop = setInterval(
        updateGame,
        110
    );

    drawGame();
}


/* =========================================
   GAME UPDATE
========================================= */

function updateGame() {

    if (!gameRunning || gamePaused) {
        return;
    }

    direction = {
        ...nextDirection
    };

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };


    /* Wall Collision */

    if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
    ) {

        endGame();
        return;
    }


    /* Self Collision */

    const hitsBody = snake.some(
        (segment, index) => {

            /*
                The last segment will move away
                when the snake does not eat food.
            */

            if (index === snake.length - 1) {
                return false;
            }

            return (
                segment.x === head.x &&
                segment.y === head.y
            );
        }
    );

    if (hitsBody) {

        endGame();
        return;
    }


    /* Add New Head */

    snake.unshift(head);


    /* Food Collision */

    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score += 10;

        savedStats.foodCollected++;

        if (
            snake.length >
            savedStats.longestSnake
        ) {
            savedStats.longestSnake =
                snake.length;
        }

        scoreElement.textContent = score;

        createFood();

        playBeep(720, 0.07);
        vibrate(25);

    } else {

        snake.pop();
    }


    drawGame();
}


/* =========================================
   DRAW GAME
========================================= */

function drawGame() {

    const width =
        canvas.width /
        (window.devicePixelRatio || 1);

    const height =
        canvas.height /
        (window.devicePixelRatio || 1);


    /* Background */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* Subtle Grid */

    ctx.strokeStyle =
        "rgba(255,255,255,0.025)";

    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {

        const position =
            i * cellSize;

        ctx.beginPath();
        ctx.moveTo(position, 0);
        ctx.lineTo(position, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, position);
        ctx.lineTo(width, position);
        ctx.stroke();
    }


    /* Food */

    drawFood();


    /* Snake */

    snake.forEach(
        (segment, index) => {

            const x =
                segment.x * cellSize;

            const y =
                segment.y * cellSize;

            const padding =
                cellSize * 0.08;

            const size =
                cellSize - padding * 2;

            const radius =
                cellSize * 0.22;

            ctx.beginPath();

            roundRect(
                ctx,
                x + padding,
                y + padding,
                size,
                size,
                radius
            );

            if (index === 0) {

                ctx.fillStyle =
                    "#4ade80";

                ctx.shadowColor =
                    "rgba(74,222,128,0.55)";

                ctx.shadowBlur = 10;

            } else {

                ctx.fillStyle =
                    "#22c55e";

                ctx.shadowColor =
                    "rgba(34,197,94,0.20)";

                ctx.shadowBlur = 5;
            }

            ctx.fill();

            ctx.shadowBlur = 0;


            /* Snake Eyes */

            if (index === 0) {

                drawSnakeEyes(
                    x,
                    y
                );
            }
        }
    );
}


/* =========================================
   FOOD DRAW
========================================= */

function drawFood() {

    const centerX =
        food.x * cellSize +
        cellSize / 2;

    const centerY =
        food.y * cellSize +
        cellSize / 2;

    const radius =
        cellSize * 0.31;


    /* Glow */

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius + 3,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(248,113,113,0.12)";

    ctx.fill();


    /* Apple */

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY + 1,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ef4444";

    ctx.shadowColor =
        "rgba(239,68,68,0.50)";

    ctx.shadowBlur = 9;

    ctx.fill();

    ctx.shadowBlur = 0;


    /* Leaf */

    ctx.beginPath();

    ctx.ellipse(
        centerX + 4,
        centerY - radius - 1,
        4,
        2,
        -0.4,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#4ade80";

    ctx.fill();


    /* Small highlight */

    ctx.beginPath();

    ctx.arc(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.18,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,255,255,0.65)";

    ctx.fill();
}


/* =========================================
   SNAKE EYES
========================================= */

function drawSnakeEyes(x, y) {

    const headSize = cellSize;

    let eye1X;
    let eye1Y;
    let eye2X;
    let eye2Y;

    const eyeOffset =
        headSize * 0.27;

    const eyeSize =
        Math.max(1.8, headSize * 0.075);


    if (direction.x === 1) {

        eye1X =
            x + headSize * 0.68;

        eye2X =
            x + headSize * 0.68;

        eye1Y =
            y + headSize * 0.30;

        eye2Y =
            y + headSize * 0.70;

    } else if (direction.x === -1) {

        eye1X =
            x + headSize * 0.32;

        eye2X =
            x + headSize * 0.32;

        eye1Y =
            y + headSize * 0.30;

        eye2Y =
            y + headSize * 0.70;

    } else if (direction.y === -1) {

        eye1X =
            x + headSize * 0.30;

        eye2X =
            x + headSize * 0.70;

        eye1Y =
            y + headSize * 0.32;

        eye2Y =
            y + headSize * 0.32;

    } else {

        eye1X =
            x + headSize * 0.30;

        eye2X =
            x + headSize * 0.70;

        eye1Y =
            y + headSize * 0.68;

        eye2Y =
            y + headSize * 0.68;
    }


    ctx.fillStyle = "#052e16";

    ctx.beginPath();

    ctx.arc(
        eye1X,
        eye1Y,
        eyeSize,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        eye2X,
        eye2Y,
        eyeSize,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =========================================
   ROUNDED RECTANGLE
========================================= */

function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    context.moveTo(
        x + radius,
        y
    );

    context.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        radius
    );

    context.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        radius
    );

    context.arcTo(
        x,
        y + height,
        x,
        y,
        radius
    );

    context.arcTo(
        x,
        y,
        x + width,
        y,
        radius
    );

    context.closePath();
}


/* =========================================
   GAME OVER
========================================= */

function endGame() {

    clearInterval(gameLoop);

    gameRunning = false;
    gamePaused = false;

    savedStats.gamesPlayed++;

    if (score > savedStats.highScore) {
        savedStats.highScore = score;
    }

    saveStats();

    gameHighScoreElement.textContent =
        savedStats.highScore;

    playBeep(180, 0.15);
    vibrate([60, 40, 60]);

    gameMessage.innerHTML = `
        <h2>💀 Game Over</h2>
        <p>Your Score: <strong>${score}</strong></p>
        <p>Best Score: <strong>${savedStats.highScore}</strong></p>

        <button id="restartRoundBtn">
            PLAY AGAIN
        </button>
    `;

    gameMessage.style.display = "flex";

    document
        .getElementById("restartRoundBtn")
        .addEventListener(
            "click",
            startGame
        );
}


/* =========================================
   PAUSE
========================================= */

function togglePause() {

    if (!gameRunning) {
        return;
    }

    gamePaused = !gamePaused;

    if (gamePaused) {

        pauseBtn.textContent = "▶";

        gameMessage.innerHTML = `
            <h2>⏸️ Paused</h2>
            <p>Take a break.</p>

            <button id="resumeBtn">
                RESUME
            </button>
        `;

        gameMessage.style.display = "flex";

        document
            .getElementById("resumeBtn")
            .addEventListener(
                "click",
                togglePause
            );

    } else {

        pauseBtn.textContent = "Ⅱ";

        gameMessage.style.display = "none";
    }
}


/* =========================================
   KEYBOARD CONTROLS
========================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        const controls = {
            arrowup: {
                x: 0,
                y: -1
            },

            w: {
                x: 0,
                y: -1
            },

            arrowdown: {
                x: 0,
                y: 1
            },

            s: {
                x: 0,
                y: 1
            },

            arrowleft: {
                x: -1,
                y: 0
            },

            a: {
                x: -1,
                y: 0
            },

            arrowright: {
                x: 1,
                y: 0
            },

            d: {
                x: 1,
                y: 0
            }
        };


        if (key === " " && gameRunning) {

            event.preventDefault();

            togglePause();

            return;
        }


        if (!controls[key]) {
            return;
        }

        event.preventDefault();


        const newDirection =
            controls[key];


        /*
            Prevent instant reverse.
            Example: moving right cannot
            instantly move left.
        */

        if (
            newDirection.x === -direction.x &&
            newDirection.y === -direction.y
        ) {
            return;
        }


        nextDirection = {
            ...newDirection
        };
    }
);


/* =========================================
   MOBILE SWIPE CONTROLS
========================================= */

const gameArea =
    document.getElementById("gameArea");


gameArea.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.changedTouches[0];

        lastTouchX =
            touch.clientX;

        lastTouchY =
            touch.clientY;
    },
    {
        passive: true
    }
);


gameArea.addEventListener(
    "touchend",
    event => {

        if (!gameRunning) {
            return;
        }

        const touch =
            event.changedTouches[0];

        const dx =
            touch.clientX -
            lastTouchX;

        const dy =
            touch.clientY -
            lastTouchY;

        const minimumSwipe =
            20;

        if (
            Math.abs(dx) < minimumSwipe &&
            Math.abs(dy) < minimumSwipe
        ) {
            return;
        }


        let newDirection;


        if (Math.abs(dx) > Math.abs(dy)) {

            newDirection =
                dx > 0
                    ? { x: 1, y: 0 }
                    : { x: -1, y: 0 };

        } else {

            newDirection =
                dy > 0
                    ? { x: 0, y: 1 }
                    : { x: 0, y: -1 };
        }


        if (
            newDirection.x === -direction.x &&
            newDirection.y === -direction.y
        ) {
            return;
        }


        nextDirection = {
            ...newDirection
        };
    },
    {
        passive: true
    }
);


/* =========================================
   BUTTON EVENTS
========================================= */

playBtn.addEventListener(
    "click",
    () => {

        showScreen(gameScreen);

        setTimeout(() => {
            resizeCanvas();
            startGame();
        }, 50);
    }
);


startRoundBtn.addEventListener(
    "click",
    startGame
);


pauseBtn.addEventListener(
    "click",
    togglePause
);


homeFromGame.addEventListener(
    "click",
    () => {

        clearInterval(gameLoop);

        gameRunning = false;
        gamePaused = false;

        updateDashboard();

        showScreen(dashboard);
    }
);


statsBtn.addEventListener(
    "click",
    () => {

        updateDashboard();
        showScreen(statsScreen);
    }
);


settingsBtn.addEventListener(
    "click",
    () => {

        showScreen(settingsScreen);
    }
);


howToPlayBtn.addEventListener(
    "click",
    () => {

        showScreen(howToPlayScreen);
    }
);


backFromStats.addEventListener(
    "click",
    () => {

        updateDashboard();
        showScreen(dashboard);
    }
);


backFromSettings.addEventListener(
    "click",
    () => {

        showScreen(dashboard);
    }
);


backFromHowToPlay.addEventListener(
    "click",
    () => {

        showScreen(dashboard);
    }
);


/* =========================================
   SETTINGS STORAGE
========================================= */

const SOUND_KEY =
    "snakeRushSound";

const VIBRATION_KEY =
    "snakeRushVibration";


function loadSettings() {

    const savedSound =
        localStorage.getItem(SOUND_KEY);

    const savedVibration =
        localStorage.getItem(VIBRATION_KEY);


    if (savedSound !== null) {

        soundToggle.checked =
            savedSound === "true";
    }


    if (savedVibration !== null) {

        vibrationToggle.checked =
            savedVibration === "true";
    }
}


soundToggle.addEventListener(
    "change",
    () => {

        localStorage.setItem(
            SOUND_KEY,
            soundToggle.checked
        );
    }
);


vibrationToggle.addEventListener(
    "change",
    () => {

        localStorage.setItem(
            VIBRATION_KEY,
            vibrationToggle.checked
        );
    }
);


/* =========================================
   WINDOW RESIZE
========================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            gameScreen.classList.contains("active")
        ) {
            resizeCanvas();
        }
    }
);


/* =========================================
   INITIAL LOAD
========================================= */

loadSettings();
updateDashboard();

resizeCanvas();
```

