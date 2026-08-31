/* =========================================
   SnakeRush
   Complete Game Script
========================================= */


/* =========================================
   ELEMENTS
========================================= */

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


const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


const gameArea =
    document.getElementById("gameArea");


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

const overlayButton =
    document.getElementById(
        "overlayButton"
    );


const soundToggle =
    document.getElementById(
        "soundToggle"
    );

const vibrationToggle =
    document.getElementById(
        "vibrationToggle"
    );


/* =========================================
   GAME SETTINGS
========================================= */

const GRID = 20;

let cellSize = 20;

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

let gameTimer = null;


/* =========================================
   SAVED DATA
========================================= */

let gameStats =
    JSON.parse(
        localStorage.getItem(
            "snakeRushStats"
        )
    ) || {

        highScore: 0,

        foodCollected: 0,

        gamesPlayed: 0,

        longestSnake: 3
    };


/* =========================================
   SAVE DATA
========================================= */

function saveStats() {

    localStorage.setItem(
        "snakeRushStats",
        JSON.stringify(gameStats)
    );

}


/* =========================================
   UPDATE ALL STATS
========================================= */

function updateStatsUI() {

    dashboardHighScore.textContent =
        gameStats.highScore;

    dashboardFood.textContent =
        gameStats.foodCollected;

    dashboardGames.textContent =
        gameStats.gamesPlayed;


    statsHighScore.textContent =
        gameStats.highScore;

    statsFood.textContent =
        gameStats.foodCollected;

    statsGames.textContent =
        gameStats.gamesPlayed;

    statsLongest.textContent =
        gameStats.longestSnake;


    gameHighScore.textContent =
        gameStats.highScore;
}


/* =========================================
   SCREEN NAVIGATION
========================================= */

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(
            screenItem => {

                screenItem.classList.remove(
                    "active"
                );

            }
        );


    screen.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   SOUND
========================================= */

let audioContext = null;


function beep(
    frequency = 500,
    duration = 0.07
) {

    if (
        !soundToggle.checked
    ) {
        return;
    }


    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();
        }


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.frequency.value =
            frequency;

        oscillator.type =
            "sine";


        gain.gain.setValueAtTime(
            0.05,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime +
                duration
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime +
                duration
        );

    } catch (error) {

        // Sound is optional.
    }
}


/* =========================================
   VIBRATION
========================================= */

function vibrate(pattern) {

    if (
        vibrationToggle.checked &&
        "vibrate" in navigator
    ) {

        navigator.vibrate(pattern);
    }
}


/* =========================================
   CANVAS RESIZE
========================================= */

function resizeCanvas() {

    const size =
        Math.floor(
            gameArea.clientWidth
        );


    const ratio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        size * ratio;

    canvas.height =
        size * ratio;


    canvas.style.width =
        size + "px";

    canvas.style.height =
        size + "px";


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    cellSize =
        size / GRID;


    draw();
}


/* =========================================
   CREATE SNAKE
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
   CREATE FOOD
========================================= */

function createFood() {

    let positionOK = false;


    while (!positionOK) {

        food = {

            x:
                Math.floor(
                    Math.random() * GRID
                ),

            y:
                Math.floor(
                    Math.random() * GRID
                )
        };


        positionOK =
            !snake.some(
                part =>
                    part.x === food.x &&
                    part.y === food.y
            );
    }
}


/* =========================================
   START GAME
========================================= */

function startGame() {

    clearInterval(gameTimer);


    score = 0;

    scoreElement.textContent =
        "0";


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


    gameRunning = true;

    gamePaused = false;


    pauseButton.textContent =
        "⏸";


    overlayButton.textContent =
        "START GAME";


    gameOverlay.style.display =
        "none";


    resizeCanvas();


    gameTimer =
        setInterval(
            updateGame,
            115
        );


    draw();
}


/* =========================================
   UPDATE GAME
========================================= */

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


    const head = {

        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y
    };


    /* WALL */

    if (

        head.x < 0 ||

        head.x >= GRID ||

        head.y < 0 ||

        head.y >= GRID

    ) {

        gameOver();

        return;
    }


    /* BODY */

    const bodyHit =
        snake.some(
            (part, index) => {

                if (
                    index ===
                    snake.length - 1
                ) {

                    return false;
                }


                return (

                    part.x === head.x &&

                    part.y === head.y

                );
            }
        );


    if (bodyHit) {

        gameOver();

        return;
    }


    /* MOVE */

    snake.unshift(head);


    /* FOOD */

    if (

        head.x === food.x &&

        head.y === food.y

    ) {

        score += 10;


        scoreElement.textContent =
            score;


        gameStats.foodCollected++;


        if (
            snake.length >
            gameStats.longestSnake
        ) {

            gameStats.longestSnake =
                snake.length;
        }


        createFood();


        beep(720, 0.08);

        vibrate(25);


    } else {

        snake.pop();
    }


    draw();
}


/* =========================================
   GAME OVER
========================================= */

function gameOver() {

    clearInterval(gameTimer);


    gameRunning = false;

    gamePaused = false;


    gameStats.gamesPlayed++;


    if (
        score >
        gameStats.highScore
    ) {

        gameStats.highScore =
            score;
    }


    saveStats();

    updateStatsUI();


    beep(180, 0.18);

    vibrate([
        60,
        40,
        60
    ]);


    overlayIcon.textContent =
        "💥";


    overlayTitle.textContent =
        "Game Over!";


    overlayText.textContent =
        "Score: " +
        score +
        "  •  Best: " +
        gameStats.highScore;


    overlayButton.textContent =
        "PLAY AGAIN";


    gameOverlay.style.display =
        "flex";
}


/* =========================================
   PAUSE / RESUME
========================================= */

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
            "Press resume when you're ready.";


        overlayButton.textContent =
            "RESUME";


        gameOverlay.style.display =
            "flex";


    } else {

        pauseButton.textContent =
            "⏸";


        gameOverlay.style.display =
            "none";
    }
}


/* =========================================
   KEYBOARD CONTROLS
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (
            key === " " &&
            gameRunning
        ) {

            event.preventDefault();

            togglePause();

            return;
        }


        if (!gameRunning) {
            return;
        }


        /* UP */

        if (

            (
                key === "arrowup" ||
                key === "w"
            ) &&

            direction.y !== 1

        ) {

            nextDirection = {
                x: 0,
                y: -1
            };
        }


        /* DOWN */

        else if (

            (
                key === "arrowdown" ||
                key === "s"
            ) &&

            direction.y !== -1

        ) {

            nextDirection = {
                x: 0,
                y: 1
            };
        }


        /* LEFT */

        else if (

            (
                key === "arrowleft" ||
                key === "a"
            ) &&

            direction.x !== 1

        ) {

            nextDirection = {
                x: -1,
                y: 0
            };
        }


        /* RIGHT */

        else if (

            (
                key === "arrowright" ||
                key === "d"
            ) &&

            direction.x !== -1

        ) {

            nextDirection = {
                x: 1,
                y: 0
            };
        }


        if (

            key === "arrowup" ||
            key === "arrowdown" ||
            key === "arrowleft" ||
            key === "arrowright"

        ) {

            event.preventDefault();
        }

    }
);


/* =========================================
   SWIPE CONTROL
   ANYWHERE INSIDE GAME AREA
========================================= */

let touchStartX = 0;

let touchStartY = 0;


gameArea.addEventListener(
    "touchstart",
    function(event) {

        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

    },
    {
        passive: true
    }
);


gameArea.addEventListener(
    "touchend",
    function(event) {

        if (!gameRunning) {
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


        const minimum =
            20;


        if (

            Math.abs(dx) < minimum &&

            Math.abs(dy) < minimum

        ) {

            return;
        }


        /* HORIZONTAL */

        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            if (

                dx > 0 &&

                direction.x !== -1

            ) {

                nextDirection = {
                    x: 1,
                    y: 0
                };

            }

            else if (

                dx < 0 &&

                direction.x !== 1

            ) {

                nextDirection = {
                    x: -1,
                    y: 0
                };
            }
        }


        /* VERTICAL */

        else {

            if (

                dy > 0 &&

                direction.y !== -1

            ) {

                nextDirection = {
                    x: 0,
                    y: 1
                };

            }

            else if (

                dy < 0 &&

                direction.y !== 1

            ) {

                nextDirection = {
                    x: 0,
                    y: -1
                };
            }
        }

    },
    {
        passive: true
    }
);


/* =========================================
   DASHBOARD BUTTONS
========================================= */

playButton.addEventListener(
    "click",
    function() {

        showScreen(gameScreen);

        setTimeout(
            startGame,
            50
        );
    }
);


statsButton.addEventListener(
    "click",
    function() {

        updateStatsUI();

        showScreen(statsScreen);
    }
);


howButton.addEventListener(
    "click",
    function() {

        showScreen(howScreen);
    }
);


settingsButton.addEventListener(
    "click",
    function() {

        showScreen(settingsScreen);
    }
);


/* =========================================
   BACK BUTTONS
========================================= */

statsBack.addEventListener(
    "click",
    function() {

        showScreen(dashboard);
    }
);


howBack.addEventListener(
    "click",
    function() {

        showScreen(dashboard);
    }
);


settingsBack.addEventListener(
    "click",
    function() {

        showScreen(dashboard);
    }
);


/* =========================================
   HOME FROM GAME
========================================= */

homeButton.addEventListener(
    "click",
    function() {

        clearInterval(gameTimer);

        gameRunning = false;

        gamePaused = false;

        updateStatsUI();

        showScreen(dashboard);
    }
);


/* =========================================
   PAUSE BUTTON
========================================= */

pauseButton.addEventListener(
    "click",
    function() {

        togglePause();
    }
);


/* =========================================
   OVERLAY BUTTON
========================================= */

overlayButton.addEventListener(
    "click",
    function() {

        if (gamePaused) {

            togglePause();

        } else {

            startGame();
        }
    }
);


/* =========================================
   SETTINGS
========================================= */

const savedSound =
    localStorage.getItem(
        "snakeRushSound"
    );


const savedVibration =
    localStorage.getItem(
        "snakeRushVibration"
    );


if (savedSound !== null) {

    soundToggle.checked =
        savedSound === "true";
}


if (savedVibration !== null) {

    vibrationToggle.checked =
        savedVibration === "true";
}


soundToggle.addEventListener(
    "change",
    function() {

        localStorage.setItem(
            "snakeRushSound",
            soundToggle.checked
        );
    }
);


vibrationToggle.addEventListener(
    "change",
    function() {

        localStorage.setItem(
            "snakeRushVibration",
            vibrationToggle.checked
        );
    }
);


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    function() {

        resizeCanvas();
    }
);


/* =========================================
   INITIALIZE
========================================= */

updateStatsUI();

createSnake();

createFood();

resizeCanvas();

draw();
