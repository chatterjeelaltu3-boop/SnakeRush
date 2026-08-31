"use strict";


/* ==========================================
   ELEMENTS
========================================== */

const dashboard =
    document.getElementById("dashboard");

const gameScreen =
    document.getElementById("gameScreen");

const statsScreen =
    document.getElementById("statsScreen");

const howScreen =
    document.getElementById("howScreen");

const settingsScreen =
    document.getElementById("settingsScreen");


const playButton =
    document.getElementById("playButton");

const statsButton =
    document.getElementById("statsButton");

const howButton =
    document.getElementById("howButton");

const settingsButton =
    document.getElementById("settingsButton");


const statsBack =
    document.getElementById("statsBack");

const howBack =
    document.getElementById("howBack");

const settingsBack =
    document.getElementById("settingsBack");


const homeButton =
    document.getElementById("homeButton");

const pauseButton =
    document.getElementById("pauseButton");

const overlayButton =
    document.getElementById("overlayButton");


const gameArea =
    document.getElementById("gameArea");

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


const scoreElement =
    document.getElementById("score");

const gameHighScore =
    document.getElementById("gameHighScore");

const snakeSize =
    document.getElementById("snakeSize");

const currentSpeed =
    document.getElementById("currentSpeed");


const dashboardHighScore =
    document.getElementById(
        "dashboardHighScore"
    );

const dashboardFood =
    document.getElementById(
        "dashboardFood"
    );

const dashboardGames =
    document.getElementById(
        "dashboardGames"
    );


const statsHighScore =
    document.getElementById(
        "statsHighScore"
    );

const statsFood =
    document.getElementById(
        "statsFood"
    );

const statsGames =
    document.getElementById(
        "statsGames"
    );

const statsLongest =
    document.getElementById(
        "statsLongest"
    );


const gameOverlay =
    document.getElementById(
        "gameOverlay"
    );

const overlayIcon =
    document.getElementById(
        "overlayIcon"
    );

const overlayTitle =
    document.getElementById(
        "overlayTitle"
    );

const overlayText =
    document.getElementById(
        "overlayText"
    );


const soundToggle =
    document.getElementById(
        "soundToggle"
    );

const vibrationToggle =
    document.getElementById(
        "vibrationToggle"
    );


const speedButtons =
    document.querySelectorAll(
        ".speed-option"
    );


/* ==========================================
   GAME CONFIGURATION
========================================== */

const GRID_SIZE = 20;


/*
   Lower number = faster.
*/

const SPEEDS = {

    slow: 190,

    medium: 120,

    fast: 70

};


const SPEED_NAMES = {

    slow: "SLOW",

    medium: "MEDIUM",

    fast: "FAST"

};


let selectedSpeed =
    localStorage.getItem(
        "SnakeRushSpeed"
    ) || "medium";


if (
    !SPEEDS[selectedSpeed]
) {

    selectedSpeed =
        "medium";

}


/* ==========================================
   GAME VARIABLES
========================================== */

let snake = [];

let food = {
    x: 5,
    y: 5
};


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

let cellSize = 20;

let canvasSize = 400;


/* ==========================================
   STATISTICS
========================================== */

let stats;

try {

    stats =
        JSON.parse(
            localStorage.getItem(
                "SnakeRushStats"
            )
        ) || {};

} catch {

    stats = {};

}


stats.highScore =
    Number(stats.highScore) || 0;

stats.foodCollected =
    Number(stats.foodCollected) || 0;

stats.gamesPlayed =
    Number(stats.gamesPlayed) || 0;

stats.longestSnake =
    Number(stats.longestSnake) || 3;


function saveStats() {

    localStorage.setItem(
        "SnakeRushStats",
        JSON.stringify(stats)
    );

}


/* ==========================================
   SETTINGS
========================================== */

const savedSound =
    localStorage.getItem(
        "SnakeRushSound"
    );

const savedVibration =
    localStorage.getItem(
        "SnakeRushVibration"
    );


if (savedSound !== null) {

    soundToggle.checked =
        savedSound === "true";
}


if (savedVibration !== null) {

    vibrationToggle.checked =
        savedVibration === "true";
}


/* ==========================================
   UPDATE UI
========================================== */

function updateStatsUI() {

    dashboardHighScore.textContent =
        stats.highScore;

    dashboardFood.textContent =
        stats.foodCollected;

    dashboardGames.textContent =
        stats.gamesPlayed;


    statsHighScore.textContent =
        stats.highScore;

    statsFood.textContent =
        stats.foodCollected;

    statsGames.textContent =
        stats.gamesPlayed;

    statsLongest.textContent =
        stats.longestSnake;


    gameHighScore.textContent =
        stats.highScore;

}


function updateSpeedUI() {

    currentSpeed.textContent =
        SPEED_NAMES[selectedSpeed];


    speedButtons.forEach(
        button => {

            button.classList.toggle(
                "selected",
                button.dataset.speed ===
                selectedSpeed
            );

        }
    );

}


/* ==========================================
   SCREEN SYSTEM
========================================== */

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    screen.classList.add(
        "active"
    );


    window.scrollTo(
        0,
        0
    );


    if (
        screen === gameScreen
    ) {

        setTimeout(
            resizeCanvas,
            30
        );
    }

}


/* ==========================================
   CANVAS
========================================== */

function resizeCanvas() {

    const rect =
        gameArea.getBoundingClientRect();


    const size =
        Math.max(
            200,
            Math.floor(
                rect.width
            )
        );


    canvasSize = size;

    const pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        Math.floor(
            size * pixelRatio
        );

    canvas.height =
        Math.floor(
            size * pixelRatio
        );


    canvas.style.width =
        size + "px";

    canvas.style.height =
        size + "px";


    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );


    cellSize =
        size / GRID_SIZE;


    draw();

}


/* ==========================================
   SNAKE RESET
========================================== */

function resetSnake() {

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


    snakeSize.textContent =
        snake.length;

}


/* ==========================================
   FOOD
========================================== */

function createFood() {

    let validPosition = false;


    while (!validPosition) {

        food = {

            x:
                Math.floor(
                    Math.random() *
                    GRID_SIZE
                ),

            y:
                Math.floor(
                    Math.random() *
                    GRID_SIZE
                )

        };


        validPosition =
            !snake.some(
                part =>

                    part.x === food.x &&
                    part.y === food.y
            );

    }

}


/* ==========================================
   START GAME
========================================== */

function startGame() {

    if (
        gameLoop !== null
    ) {

        clearInterval(
            gameLoop
        );

        gameLoop = null;
    }


    score = 0;

    scoreElement.textContent =
        "0";


    resetSnake();


    direction = {
        x: 1,
        y: 0
    };


    nextDirection = {
        x: 1,
        y: 0
    };


    createFood();


    gameRunning = true;

    gamePaused = false;


    pauseButton.textContent =
        "⏸";


    gameOverlay.style.display =
        "none";


    resizeCanvas();


    gameLoop =
        setInterval(
            updateGame,
            SPEEDS[selectedSpeed]
        );


    draw();

}


/* ==========================================
   GAME UPDATE
========================================== */

function updateGame() {

    if (
        !gameRunning ||
        gamePaused
    ) {

        return;
    }


    direction = {
        ...nextDirection
    };


    const newHead = {

        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y

    };


    /* ======================
       WALL
    ====================== */

    if (

        newHead.x < 0 ||

        newHead.x >= GRID_SIZE ||

        newHead.y < 0 ||

        newHead.y >= GRID_SIZE

    ) {

        endGame();

        return;
    }


    const eatingFood =

        newHead.x === food.x &&
        newHead.y === food.y;


    /*
       If not eating, tail will move away,
       so it does not need to be checked.
    */

    const bodyToCheck =
        eatingFood
            ? snake
            : snake.slice(
                0,
                snake.length - 1
            );


    /* ======================
       BODY
    ====================== */

    const hitBody =
        bodyToCheck.some(
            part =>

                part.x === newHead.x &&
                part.y === newHead.y
        );


    if (hitBody) {

        endGame();

        return;
    }


    /* ======================
       MOVE
    ====================== */

    snake.unshift(
        newHead
    );


    /* ======================
       FOOD
    ====================== */

    if (eatingFood) {

        score += 10;


        scoreElement.textContent =
            score;


        stats.foodCollected++;


        if (
            snake.length >
            stats.longestSnake
        ) {

            stats.longestSnake =
                snake.length;
        }


        createFood();


        playFoodSound();

        vibrateFood();

    } else {

        snake.pop();

    }


    snakeSize.textContent =
        snake.length;


    draw();

}


/* ==========================================
   GAME OVER
========================================== */

function endGame() {

    if (!gameRunning) {

        return;
    }


    gameRunning = false;

    gamePaused = false;


    if (
        gameLoop !== null
    ) {

        clearInterval(
            gameLoop
        );

        gameLoop = null;
    }


    stats.gamesPlayed++;


    let newRecord = false;


    if (
        score >
        stats.highScore
    ) {

        stats.highScore =
            score;

        newRecord = true;
    }


    saveStats();

    updateStatsUI();


    playGameOverSound();

    vibrateGameOver();


    overlayIcon.textContent =
        newRecord
            ? "🏆"
            : "💥";


    overlayTitle.textContent =
        newRecord
            ? "NEW HIGH SCORE!"
            : "GAME OVER";


    overlayText.textContent =
        "Score: " +
        score +
        "  •  Best: " +
        stats.highScore;


    overlayButton.textContent =
        "🔄 PLAY AGAIN";


    gameOverlay.style.display =
        "flex";


    draw();

}


/* ==========================================
   PAUSE
========================================== */

function togglePause() {

    if (!gameRunning) {

        return;
    }


    gamePaused =
        !gamePaused;


    if (gamePaused) {

        pauseButton.textContent =
            "▶";


        overlayIcon.textContent =
            "⏸️";


        overlayTitle.textContent =
            "GAME PAUSED";


        overlayText.textContent =
            "Resume whenever you're ready.";


        overlayButton.textContent =
            "▶ RESUME";


        gameOverlay.style.display =
            "flex";

    } else {

        pauseButton.textContent =
            "⏸";


        gameOverlay.style.display =
            "none";

    }

}


/* ==========================================
   DIRECTION
========================================== */

function setDirection(x, y) {

    if (!gameRunning) {

        return;
    }


    /*
       Prevent reversing directly.
    */

    if (

        x === -direction.x &&
        y === -direction.y

    ) {

        return;
    }


    if (

        x === -nextDirection.x &&
        y === -nextDirection.y

    ) {

        return;
    }


    nextDirection = {
        x,
        y
    };

}


/* ==========================================
   KEYBOARD
========================================== */

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (
            key === " " ||
            key === "p"
        ) {

            if (gameRunning) {

                event.preventDefault();

                togglePause();

            }

            return;
        }


        if (!gameRunning) {

            return;
        }


        switch (key) {

            case "arrowup":
            case "w":

                event.preventDefault();

                setDirection(
                    0,
                    -1
                );

                break;


            case "arrowdown":
            case "s":

                event.preventDefault();

                setDirection(
                    0,
                    1
                );

                break;


            case "arrowleft":
            case "a":

                event.preventDefault();

                setDirection(
                    -1,
                    0
                );

                break;


            case "arrowright":
            case "d":

                event.preventDefault();

                setDirection(
                    1,
                    0
                );

                break;

        }

    }
);


/* ==========================================
   SWIPE CONTROL
========================================== */

let touchStartX = 0;

let touchStartY = 0;

let touchActive = false;


gameArea.addEventListener(
    "touchstart",
    function(event) {

        if (!gameRunning) {

            return;
        }


        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

        touchActive = true;

    },
    {
        passive: true
    }
);


gameArea.addEventListener(
    "touchend",
    function(event) {

        if (
            !gameRunning ||
            !touchActive
        ) {

            return;
        }


        const touch =
            event.changedTouches[0];


        const dx =
            touch.clientX -
            touchStartX;


        const dy =
            touch.clientY -
            touchStartY;


        touchActive = false;


        const minimumSwipe = 18;


        if (

            Math.abs(dx) <
            minimumSwipe &&

            Math.abs(dy) <
            minimumSwipe

        ) {

            return;
        }


        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            if (dx > 0) {

                setDirection(
                    1,
                    0
                );

            } else {

                setDirection(
                    -1,
                    0
                );

            }

        } else {

            if (dy > 0) {

                setDirection(
                    0,
                    1
                );

            } else {

                setDirection(
                    0,
                    -1
                );

            }

        }

    },
    {
        passive: true
    }
);


/* ==========================================
   DRAW BACKGROUND
========================================== */

function drawBackground() {

    ctx.fillStyle =
        "#06100d";


    ctx.fillRect(
        0,
        0,
        canvasSize,
        canvasSize
    );


    /*
       Subtle grid
    */

    ctx.strokeStyle =
        "rgba(255,255,255,.035)";

    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= GRID_SIZE;
        i++
    ) {

        const position =
            i * cellSize;


        ctx.beginPath();

        ctx.moveTo(
            position,
            0
        );

        ctx.lineTo(
            position,
            canvasSize
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            0,
            position
        );

        ctx.lineTo(
            canvasSize,
            position
        );

        ctx.stroke();

    }

}


/* ==========================================
   DRAW FOOD
========================================== */

function drawFood() {

    const centerX =
        food.x * cellSize +
        cellSize / 2;


    const centerY =
        food.y * cellSize +
        cellSize / 2;


    const radius =
        cellSize * .30;


    /*
       Glow
    */

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius * 1.55,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(239,68,68,.12)";

    ctx.fill();


    /*
       Apple
    */

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

    ctx.fill();


    /*
       Leaf
    */

    ctx.beginPath();

    ctx.ellipse(
        centerX + radius * .45,
        centerY - radius * .75,
        radius * .45,
        radius * .20,
        -0.5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#4ade80";

    ctx.fill();

}


/* ==========================================
   DRAW SNAKE
========================================== */

function drawSnake() {

    snake.forEach(
        (part, index) => {

            const padding =
                cellSize * .08;


            const x =
                part.x *
                cellSize +
                padding;


            const y =
                part.y *
                cellSize +
                padding;


            const size =
                cellSize -
                padding * 2;


            const radius =
                Math.max(
                    3,
                    cellSize * .22
                );


            ctx.beginPath();


            ctx.roundRect(
                x,
                y,
                size,
                size,
                radius
            );


            if (index === 0) {

                ctx.fillStyle =
                    "#4ade80";

            } else {

                ctx.fillStyle =
                    "#22c55e";

            }


            ctx.fill();


            if (index === 0) {

                drawEyes(
                    x,
                    y,
                    size
                );

            }

        }
    );

}


/* ==========================================
   DRAW EYES
========================================== */

function drawEyes(
    x,
    y,
    size
) {

    const eyeSize =
        Math.max(
            1.6,
            size * .09
        );


    let eye1X;
    let eye1Y;
    let eye2X;
    let eye2Y;


    if (
        direction.x === 1
    ) {

        eye1X =
            x + size * .72;

        eye2X =
            x + size * .72;

        eye1Y =
            y + size * .30;

        eye2Y =
            y + size * .70;

    } else if (
        direction.x === -1
    ) {

        eye1X =
            x + size * .28;

        eye2X =
            x + size * .28;

        eye1Y =
            y + size * .30;

        eye2Y =
            y + size * .70;

    } else if (
        direction.y === -1
    ) {

        eye1X =
            x + size * .30;

        eye2X =
            x + size * .70;

        eye1Y =
            y + size * .28;

        eye2Y =
            y + size * .28;

    } else {

        eye1X =
            x + size * .30;

        eye2X =
            x + size * .70;

        eye1Y =
            y + size * .72;

        eye2Y =
            y + size * .72;

    }


    ctx.fillStyle =
        "#06200d";


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


/* ==========================================
   DRAW
========================================== */

function draw() {

    if (
        canvasSize <= 0
    ) {

        return;
    }


    drawBackground();

    drawFood();

    drawSnake();

}


/* ==========================================
   SOUND
========================================== */

let audioContext = null;


function getAudioContext() {

    if (!audioContext) {

        try {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        } catch {

            return null;
        }

    }


    return audioContext;

}


function playTone(
    frequency,
    duration
) {

    if (
        !soundToggle.checked
    ) {

        return;
    }


    const audio =
        getAudioContext();


    if (!audio) {

        return;
    }


    try {

        if (
            audio.state ===
            "suspended"
        ) {

            audio.resume();
        }


        const oscillator =
            audio.createOscillator();


        const gain =
            audio.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            frequency;


        gain.gain.setValueAtTime(
            .04,
            audio.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            .001,
            audio.currentTime +
            duration
        );


        oscillator.connect(
            gain
        );


        gain.connect(
            audio.destination
        );


        oscillator.start();


        oscillator.stop(
            audio.currentTime +
            duration
        );

    } catch {

        /* Sound is optional */

    }

}


function playFoodSound() {

    playTone(
        720,
        .08
    );

}


function playGameOverSound() {

    playTone(
        180,
        .18
    );

}


/* ==========================================
   VIBRATION
========================================== */

function vibrateFood() {

    if (

        vibrationToggle.checked &&

        navigator.vibrate

    ) {

        navigator.vibrate(
            18
        );

    }

}


function vibrateGameOver() {

    if (

        vibrationToggle.checked &&

        navigator.vibrate

    ) {

        navigator.vibrate([
            45,
            35,
            65
        ]);

    }

}


/* ==========================================
   BUTTON EVENTS
========================================== */


/* PLAY */

playButton.addEventListener(
    "click",
    function() {

        showScreen(
            gameScreen
        );


        setTimeout(
            function() {

                startGame();

            },
            60
        );

    }
);


/* STATISTICS */

statsButton.addEventListener(
    "click",
    function() {

        updateStatsUI();

        showScreen(
            statsScreen
        );

    }
);


/* HOW TO PLAY */

howButton.addEventListener(
    "click",
    function() {

        showScreen(
            howScreen
        );

    }
);


/* SETTINGS */

settingsButton.addEventListener(
    "click",
    function() {

        updateSpeedUI();

        showScreen(
            settingsScreen
        );

    }
);


/* BACK BUTTONS */

statsBack.addEventListener(
    "click",
    function() {

        showScreen(
            dashboard
        );

    }
);


howBack.addEventListener(
    "click",
    function() {

        showScreen(
            dashboard
        );

    }
);


settingsBack.addEventListener(
    "click",
    function() {

        showScreen(
            dashboard
        );

    }
);


/* HOME */

homeButton.addEventListener(
    "click",
    function() {

        if (
            gameLoop !== null
        ) {

            clearInterval(
                gameLoop
            );

            gameLoop = null;
        }


        gameRunning = false;

        gamePaused = false;


        updateStatsUI();


        showScreen(
            dashboard
        );

    }
);


/* PAUSE */

pauseButton.addEventListener(
    "click",
    function() {

        togglePause();

    }
);


/* OVERLAY */

overlayButton.addEventListener(
    "click",
    function() {

        if (gamePaused) {

            togglePause();

            return;
        }


        startGame();

    }
);


/* ==========================================
   SPEED SETTINGS
========================================== */

speedButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                const newSpeed =
                    button.dataset.speed;


                if (
                    !SPEEDS[newSpeed]
                ) {

                    return;
                }


                selectedSpeed =
                    newSpeed;


                localStorage.setItem(
                    "SnakeRushSpeed",
                    selectedSpeed
                );


                updateSpeedUI();

            }
        );

    }
);


/* ==========================================
   SOUND SETTINGS
========================================== */

soundToggle.addEventListener(
    "change",
    function() {

        localStorage.setItem(
            "SnakeRushSound",
            String(
                soundToggle.checked
            )
        );

    }
);


/* ==========================================
   VIBRATION SETTINGS
========================================== */

vibrationToggle.addEventListener(
    "change",
    function() {

        localStorage.setItem(
            "SnakeRushVibration",
            String(
                vibrationToggle.checked
            )
        );

    }
);


/* ==========================================
   RESIZE
========================================== */

window.addEventListener(
    "resize",
    function() {

        if (
            gameScreen.classList.contains(
                "active"
            )
        ) {

            resizeCanvas();

        }

    }
);


/* ==========================================
   INITIALIZE
========================================== */

function initialize() {

    updateStatsUI();

    updateSpeedUI();

    resetSnake();

    createFood();

}


initialize();
