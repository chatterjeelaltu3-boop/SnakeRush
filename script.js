
(function() {
  // ---------- DOM refs ----------
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  const finalScore = document.getElementById('finalScore');
  const finalBest = document.getElementById('finalBest');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const pauseToggleBtn = document.getElementById('pauseToggleBtn');
  const gamesPlayedSpan = document.getElementById('gamesPlayed');
  const totalFoodSpan = document.getElementById('totalFood');

  // speed buttons
  const speedBtns = document.querySelectorAll('.speed-btn');
  // settings toggles
  const soundToggle = document.getElementById('soundToggle');
  const vibrationToggle = document.getElementById('vibrationToggle');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const settingsOpener = document.getElementById('settingsOpener');

  // ---------- game state ----------
  const BOARD_SIZE = 20;
  let snake = [{x: 10, y: 10}];
  let food = {x: 15, y: 10};
  let direction = 'right';
  let nextDirection = 'right';
  let score = 0;
  let highScore = parseInt(localStorage.getItem('snakerush_highscore')) || 0;
  let gamesPlayed = parseInt(localStorage.getItem('snakerush_games')) || 0;
  let totalFoodEaten = parseInt(localStorage.getItem('snakerush_totalFood')) || 0;
  let gameRunning = false;
  let gamePaused = false;
  let gameLoopInterval = null;
  let speed = 130;
  let soundEnabled = localStorage.getItem('snakerush_sound') !== 'off';
  let vibrationEnabled = localStorage.getItem('snakerush_vibration') !== 'off';

  // for touch
  let touchStartX = 0, touchStartY = 0;

  // ---------- helpers ----------
  function updateUIStats() {
    highScoreDisplay.textContent = highScore;
    gamesPlayedSpan.textContent = gamesPlayed;
    totalFoodSpan.textContent = totalFoodEaten;
  }

  function playBeep(freq = 400, duration = 120) {
    if (!soundEnabled) return;
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      setTimeout(() => { osc.stop(); }, duration);
    } catch (_) {}
  }

  function vibrate(ms = 50) {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }

  // ---------- game logic ----------
  function resetGame() {
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
      gameLoopInterval = null;
    }
    snake = [{x: 10, y: 10}];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameRunning = true;
    gamePaused = false;
    pauseToggleBtn.textContent = '⏸️ Pause';
    gameOverOverlay.classList.remove('show');
    scoreDisplay.textContent = '0';
    generateFood();
    drawCanvas();
  }

  function generateFood() {
    const maxAttempts = 500;
    for (let i = 0; i < maxAttempts; i++) {
      const fx = Math.floor(Math.random() * BOARD_SIZE);
      const fy = Math.floor(Math.random() * BOARD_SIZE);
      if (!snake.some(seg => seg.x === fx && seg.y === fy)) {
        food = {x: fx, y: fy};
        return;
      }
    }
    gameOver();
  }

  function moveSnake() {
    if (!gameRunning || gamePaused) return;

    direction = nextDirection;

    const head = snake[0];
    let newHead = { ...head };
    switch (direction) {
      case 'right': newHead.x++; break;
      case 'left':  newHead.x--; break;
      case 'up':    newHead.y--; break;
      case 'down':  newHead.y++; break;
      default: return;
    }

    if (newHead.x < 0 || newHead.x >= BOARD_SIZE || newHead.y < 0 || newHead.y >= BOARD_SIZE) {
      gameOver();
      return;
    }

    const isEating = (newHead.x === food.x && newHead.y === food.y);

    let newSnake = [newHead, ...snake];
    if (!isEating) {
      newSnake.pop();
    }

    const headCollision = newSnake.slice(1).some(seg => seg.x === newHead.x && seg.y === newHead.y);
    if (headCollision) {
      gameOver();
      return;
    }

    snake = newSnake;

    if (isEating) {
      score += 10;
      scoreDisplay.textContent = score;
      totalFoodEaten++;
      localStorage.setItem('snakerush_totalFood', totalFoodEaten);
      totalFoodSpan.textContent = totalFoodEaten;
      playBeep(600, 100);
      vibrate(30);
      generateFood();
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakerush_highscore', highScore);
        highScoreDisplay.textContent = highScore;
      }
    }

    drawCanvas();
  }

  function gameOver() {
    if (!gameRunning) return;
    gameRunning = false;
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
      gameLoopInterval = null;
    }
    gamesPlayed++;
    localStorage.setItem('snakerush_games', gamesPlayed);
    gamesPlayedSpan.textContent = gamesPlayed;
    finalScore.textContent = score;
    finalBest.textContent = highScore;
    gameOverOverlay.classList.add('show');
    playBeep(300, 300);
    vibrate(100);
  }

  // ---------- drawing ----------
  function drawCanvas() {
    const size = canvas.width / BOARD_SIZE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = '#1e3b25';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= BOARD_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(canvas.width, i * size);
      ctx.stroke();
    }

    // food
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f5d742';
    ctx.fillStyle = '#ff3b2e';
    ctx.beginPath();
    ctx.arc(food.x * size + size/2, food.y * size + size/2, size/2 - 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ff6b4a';
    ctx.beginPath();
    ctx.arc(food.x * size + size/2 - 2, food.y * size + size/2 - 3, size/4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // snake
    snake.forEach((seg, index) => {
      const x = seg.x * size, y = seg.y * size;
      const radius = 4;
      ctx.fillStyle = index === 0 ? '#5ed46a' : '#3ba34b';
      ctx.shadowBlur = index === 0 ? 12 : 6;
      ctx.shadowColor = index === 0 ? '#8fe69b' : '#277a34';
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, size - 2, size - 2, radius);
      ctx.fill();
      
      // eyes on head
      if (index === 0) {
        ctx.fillStyle = '#f5f9f0';
        ctx.shadowBlur = 0;
        let ex1, ey1, ex2, ey2;
        const off = size/4;
        if (direction === 'right') {
          ex1 = x + size - off; ey1 = y + off; ex2 = x + size - off; ey2 = y + size - off;
        } else if (direction === 'left') {
          ex1 = x + off; ey1 = y + off; ex2 = x + off; ey2 = y + size - off;
        } else if (direction === 'up') {
          ex1 = x + off; ey1 = y + off; ex2 = x + size - off; ey2 = y + off;
        } else {
          ex1 = x + off; ey1 = y + size - off; ex2 = x + size - off; ey2 = y + size - off;
        }
        ctx.beginPath();
        ctx.arc(ex1, ey1, 3, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex2, ey2, 3, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#0d1f0d';
        ctx.beginPath();
        ctx.arc(ex1 + (direction==='right'?1.5: direction==='left'?-1.5:0), ey1 + (direction==='down'?1.5: direction==='up'?-1.5:0), 1.2, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex2 + (direction==='right'?1.5: direction==='left'?-1.5:0), ey2 + (direction==='down'?1.5: direction==='up'?-1.5:0), 1.2, 0, 2*Math.PI);
        ctx.fill();
      }
    });
    ctx.shadowBlur = 0;
  }

  // roundRect polyfill
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };

  // ---------- controls ----------
  function changeDirection(newDir) {
    if (!gameRunning || gamePaused) return;
    const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
    if (newDir !== opposites[direction]) {
      nextDirection = newDir;
    }
  }

  // keyboard
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w','W','A','a','s','S','d','D'].includes(key)) {
      e.preventDefault();
    }
    switch (key) {
      case 'ArrowUp': case 'w': case 'W': changeDirection('up'); break;
      case 'ArrowDown': case 's': case 'S': changeDirection('down'); break;
      case 'ArrowLeft': case 'a': case 'A': changeDirection('left'); break;
      case 'ArrowRight': case 'd': case 'D': changeDirection('right'); break;
      default: break;
    }
  });

  // touch swipe
  canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!touchStartX || !touchStartY) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? 'right' : 'left');
    } else {
      changeDirection(dy > 0 ? 'down' : 'up');
    }
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    touchStartX = 0; touchStartY = 0;
  });

  // pause
  pauseToggleBtn.addEventListener('click', () => {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    pauseToggleBtn.textContent = gamePaused ? '▶️ Play' : '⏸️ Pause';
    drawCanvas();
  });

  // play again
  playAgainBtn.addEventListener('click', () => {
    resetGame();
    startGameLoop();
  });

  // speed
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      speed = parseInt(btn.dataset.speed);
      localStorage.setItem('snakerush_speed', speed);
      if (gameRunning) {
        if (gameLoopInterval) {
          clearInterval(gameLoopInterval);
          gameLoopInterval = null;
        }
        startGameLoop();
      }
    });
  });

  // load saved speed
  const savedSpeed = localStorage.getItem('snakerush_speed');
  if (savedSpeed) {
    const spd = parseInt(savedSpeed);
    speedBtns.forEach(btn => {
      if (parseInt(btn.dataset.speed) === spd) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    speed = spd;
  }

  // settings modal
  settingsOpener.addEventListener('click', () => {
    settingsModal.classList.add('show');
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('show');
    localStorage.setItem('snakerush_sound', soundEnabled ? 'on' : 'off');
    localStorage.setItem('snakerush_vibration', vibrationEnabled ? 'on' : 'off');
  });

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? 'ON' : 'OFF';
  });

  vibrationToggle.addEventListener('click', () => {
    vibrationEnabled = !vibrationEnabled;
    vibrationToggle.textContent = vibrationEnabled ? 'ON' : 'OFF';
  });

  // init toggles
  soundToggle.textContent = soundEnabled ? 'ON' : 'OFF';
  vibrationToggle.textContent = vibrationEnabled ? 'ON' : 'OFF';

  // ---------- game loop ----------
  function startGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (!gameRunning) return;
    gameLoopInterval = setInterval(() => {
      moveSnake();
    }, speed);
  }

  // ---------- start ----------
  function init() {
    highScoreDisplay.textContent = highScore;
    updateUIStats();
    resetGame();
    startGameLoop();
  }

  init();

  // close settings with escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal.classList.contains('show')) {
      settingsModal.classList.remove('show');
      localStorage.setItem('snakerush_sound', soundEnabled ? 'on' : 'off');
      localStorage.setItem('snakerush_vibration', vibrationEnabled ? 'on' : 'off');
    }
  });

})();
