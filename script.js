/* ==========================================
   SNAKERUSH
   MOBILE-FIRST COMPLETE GAME
========================================== */

"use strict";


/* ==========================================
   GET ELEMENTS
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


/* ==========================================
   GAME VARIABLES
========================================== */

const GRID_SIZE = 20;

let cellSize = 20;

let canvasSize = 400;


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


/* ==========================================
   LOCAL STORAGE
========================================== */

const defaultStats = {

    highScore: 0,

    foodCollected: 0,

    gamesPlayed: 0,

    longestSnake: 3

};


let stats;


try {

    stats =
        JSON.parse(
            localStorage.getItem(
                "SnakeRushStats"
            )
        ) || {
            ...defaultStats
        };

} catch {

    stats = {
        ...defaultStats
    };

}


/* ==========================================
   SETTINGS STORAGE
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
   SAVE STATS
========================================== */

function saveStats() {

    localStorage.setItem(
        "SnakeRushStats",
        JSON.stringify(stats)
    );

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


/* ==========================================
   SCREEN CHANGE
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


    screen.classList.add("active");


    window.scrollTo(
        0,
        0
    );


    if (screen === gameScreen) {

        setTimeout(
            resizeCanvas,
            30
        );
    }

}


/* ==========================================
   CANVAS SIZE
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
   CREATE SNAKE
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

}


/* ==========================================
   CREATE FOOD
========================================== */

function createFood() {

    let valid = false;


    while (!valid) {

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


        valid =
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

    /* Stop old loop */

    if (gameLoop !== null) {

        clearInterval(
            gameLoop
        );

        gameLoop = null;
    }


    /* Reset */

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


    /* Overlay hide */

    gameOverlay.style.display =
        "none";


    /* Make canvas correct size */

    resizeCanvas();


    /* Start loop */

    gameLoop =
        setInterval(
            updateGame,
            120
        );


    draw();

}


/* ==========================================
   UPDATE GAME
========================================== */

function updateGame() {

    if (
        !gameRunning ||
        gamePaused
    ) {

        return;
    }


    /* Apply direction */

    direction = {
        ...nextDirection
    };


    /* New head */

    const newHead = {

        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y

    };


    /* =========================
       WALL COLLISION
    ========================== */

    if (

        newHead.x < 0 ||

        newHead.x >= GRID_SIZE ||

        newHead.y < 0 ||

        newHead.y >= GRID_SIZE

    ) {

        endGame();

        return;
    }


    /* =========================
       BODY COLLISION
    ========================== */

    const willEat =

        newHead.x === food.x &&
        newHead.y === food.y;


    const bodyToCheck =

        willEat
            ? snake
            : snake.slice(
                0,
                snake.length - 1
            );


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


    /* =========================
       MOVE
    ========================== */

    snake.unshift(
        newHead
    );


    /* =========================
       FOOD
    ========================== */

    if (willEat) {

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


    draw();

}


/* ==========================================
   END GAME
========================================== */

function endGame() {

    if (!gameRunning) {

        return;
    }


    gameRunning = false;

    gamePaused = false;


    if (gameLoop !== null) {

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
            "Game Paused";


        overlayText.textContent =
            "Take a break. Resume when ready.";


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
   SET DIRECTION
========================================== */

function setDirection(x, y) {

    if (!gameRunning) {

        return;
    }


    /*
       Prevent instant reverse.
    */

    if (
        x === -direction.x &&
        y === -direction.y
    ) {

        return;
    }


    /*
       Also compare with
       current requested direction.
    */

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
   KEYBOARD CONTROL
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
   NO FIXED VIRTUAL BUTTONS
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


        const minimumSwipe =
            18;


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


    /* Grid */

    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";


    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= GRID_SIZE;
        i++
    ) {

        const pos =
            i * cellSize;


        ctx.beginPath();

        ctx.moveTo(
            pos,
            0
        );

        ctx.lineTo(
            pos,
            canvasSize
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            0,
            pos
        );

        ctx.lineTo(
            canvasSize,
            pos
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
        cellSize * 0.32;


    /* Glow */

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius * 1.45,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "rgba(239,68,68,.13)";


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


    ctx.fill();


    /* Leaf */

    ctx.beginPath();

    ctx.ellipse(
        centerX + radius * .45,
        centerY - radius * .75,
        radius * .45,
        radius * .2,
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
                cellSize * 0.08;


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


            /* Head eyes */

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

    let eye1X;

    let eye1Y;

    let eye2X;

    let eye2Y;


    const eyeSize =
        Math.max(
            1.7,
            size * .09
        );


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
        "#06210e";


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
        !canvasSize ||
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
            .045,
            audio.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            .001,
            audio.currentTime +
            duration
        );


        oscillator.connect(gain);

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
        700,
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
            20
        );

    }

}


function vibrateGameOver() {

    if (
        vibrationToggle.checked &&
        navigator.vibrate
    ) {

        navigator.vibrate([
            50,
            40,
            70
        ]);

    }

}


/* ==========================================
   BUTTONS
========================================== */


/* PLAY */

playButton.addEventListener(
    "click",
    function() {

        showScreen(
            gameScreen
        );


        /*
           Important:
           Game starts AFTER
           game screen becomes visible.
        */

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

        showScreen(
            settingsScreen
        );

    }
);


/* STATS BACK */

statsBack.addEventListener(
    "click",
    function() {

        showScreen(
            dashboard
        );

    }
);


/* HOW BACK */

howBack.addEventListener(
    "click",
    function() {

        showScreen(
            dashboard
        );

    }
);


/* SETTINGS BACK */

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

        /*
           If paused:
           resume.
        */

        if (gamePaused) {

            togglePause();

            return;
        }


        /*
           Otherwise:
           start/restart.
        */

        startGame();

    }
);


/* ==========================================
   SETTINGS
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
   WINDOW RESIZE
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

    resetSnake();

    createFood();

    /*
       Dashboard is visible initially,
       so canvas may not have size.
       It will resize automatically
       when PLAY is pressed.
    */

}


initialize();
