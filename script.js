/* =========================================================
   Shreya's Birthday Website — interactions & mini games
   ========================================================= */

/* ---------- Toast helper ---------- */
function showToast(msg, ms = 2200) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ============================================================
   SOUND ENGINE (Web Audio API — generated, no files needed)
   ============================================================ */
const SFX = {
  ctx: null,
  enabled: true,
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  /* play a single tone */
  tone(freq, dur = 0.15, type = 'sine', vol = 0.25, delay = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },
  pop()    { this.tone(180 + Math.random() * 120, 0.12, 'triangle', 0.3); },
  click()  { this.tone(440, 0.07, 'square', 0.12); },
  match()  { this.tone(660, 0.1, 'sine', 0.25); this.tone(880, 0.12, 'sine', 0.22, 0.1); },
  error()  { this.tone(160, 0.25, 'sawtooth', 0.2); },
  catchSfx(){ this.tone(700, 0.08, 'sine', 0.2); this.tone(950, 0.08, 'sine', 0.18, 0.06); },
  whoosh() { this.tone(300, 0.2, 'sine', 0.15); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.28, i * 0.12));
  },
  fanfare() {
    [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.2, 'square', 0.2, i * 0.1));
  }
};

/* ============================================================
   CONFETTI ENGINE
   ============================================================ */
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiRunning = false;

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const confettiColors = ['#ff4d8d', '#ffd166', '#8a2be2', '#2575fc', '#80ed99', '#ff7b00', '#ffffff'];

function spawnConfetti(amount = 120) {
  for (let i = 0; i < amount; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height,
      size: 6 + Math.random() * 8,
      color: confettiColors[(Math.random() * confettiColors.length) | 0],
      speedY: 2 + Math.random() * 4,
      speedX: -2 + Math.random() * 4,
      rot: Math.random() * 360,
      rotSpeed: -6 + Math.random() * 12,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(updateConfetti);
  }
}

function updateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach((p) => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rot += p.rotSpeed;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
  confettiPieces = confettiPieces.filter((p) => p.y < confettiCanvas.height + 30);
  if (confettiPieces.length > 0) {
    requestAnimationFrame(updateConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ============================================================
   HERO — celebrate button + cake
   ============================================================ */
document.getElementById('celebrate-btn').addEventListener('click', () => {
  spawnConfetti(180);
  SFX.fanfare();
  showToast('🎉 Hip Hip Hurray for Shreya! 🎉');
  tryPlayMusic();
});

const cake = document.getElementById('cake');
cake.addEventListener('click', () => {
  if (!cake.classList.contains('blown')) {
    cake.classList.add('blown');
    spawnConfetti(120);
    SFX.whoosh();
    SFX.win();
    showToast('🌬️ Make a wish, Shreya! ✨');
    setTimeout(() => cake.classList.remove('blown'), 4000);
  }
});

/* ============================================================
   COUNTDOWN to next July 4th
   ============================================================ */
function getNextBirthday() {
  const now = new Date();
  let year = now.getFullYear();
  let bday = new Date(year, 6, 4, 0, 0, 0); // July = month 6
  if (bday < now) bday = new Date(year + 1, 6, 4, 0, 0, 0);
  return bday;
}

function updateCountdown() {
  const now = new Date();
  const target = getNextBirthday();
  let diff = target - now;

  // Check if today is the birthday
  if (now.getMonth() === 6 && now.getDate() === 4) {
    document.getElementById('countdown-msg').textContent = "🎂 It's Shreya's Birthday TODAY! 🎂";
    document.querySelectorAll('.time-box span').forEach((s) => (s.textContent = '00'));
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* Check for birthday on load — auto confetti */
(function birthdayAutoCelebrate() {
  const now = new Date();
  if (now.getMonth() === 6 && now.getDate() === 4) {
    setTimeout(() => spawnConfetti(220), 800);
  }
})();

/* ============================================================
   ROTATING WISHES
   ============================================================ */
const wishes = [
  '"May all your wishes come true!" 🌟',
  '"Another year wiser & more wonderful!" 💫',
  '"Sparkle today like the 4th of July fireworks!" 🎆',
  '"Stay sweet, stay strong, stay Shreya!" 💖',
  '"Here\'s to cake, laughter & big dreams!" 🍰',
  '"You deserve all the happiness in the world!" 🌈'
];
let wishIdx = 0;
const wishEl = document.getElementById('rotating-wish');
setInterval(() => {
  wishEl.style.opacity = 0;
  setTimeout(() => {
    wishIdx = (wishIdx + 1) % wishes.length;
    wishEl.textContent = wishes[wishIdx];
    wishEl.style.opacity = 1;
  }, 500);
}, 3500);

/* ============================================================
   GALLERY — flip cards
   ============================================================ */
const galleryData = [
  { front: '🎂', back: 'Sweetest soul!' },
  { front: '🌸', back: 'Always blooming' },
  { front: '⭐', back: 'A true star' },
  { front: '🎀', back: 'Pure kindness' },
  { front: '🦋', back: 'Free spirit' },
  { front: '🌈', back: 'Full of color' },
  { front: '💝', back: 'So loved' },
  { front: '🎆', back: 'Born on the 4th!' }
];
const galleryGrid = document.getElementById('gallery-grid');
galleryData.forEach((g) => {
  const card = document.createElement('div');
  card.className = 'flip-card';
  card.innerHTML = `
    <div class="flip-inner">
      <div class="flip-front">${g.front}</div>
      <div class="flip-back">${g.back}</div>
    </div>`;
  galleryGrid.appendChild(card);
});

/* ============================================================
   MUSIC TOGGLE
   ============================================================ */
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');
let musicOn = false;

function tryPlayMusic() {
  if (!musicOn) {
    music.volume = 0.5;
    music.play().then(() => {
      musicOn = true;
      musicBtn.textContent = '🔊';
      musicBtn.classList.add('playing');
    }).catch(() => {/* autoplay blocked, ignore */});
  }
}

musicBtn.addEventListener('click', () => {
  if (musicOn) {
    music.pause();
    musicOn = false;
    musicBtn.textContent = '🔇';
    musicBtn.classList.remove('playing');
  } else {
    music.volume = 0.5;
    music.play().then(() => {
      musicOn = true;
      musicBtn.textContent = '🔊';
      musicBtn.classList.add('playing');
    }).catch(() => showToast('Tap anywhere first, then press play 🎵'));
  }
});

/* ============================================================
   GAME TABS
   ============================================================ */
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabBtns.forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.game-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('game-' + btn.dataset.game).classList.add('active');
    SFX.click();
  });
});

/* ============================================================
   GAME 1 — BALLOON POP
   ============================================================ */
const balloonArena = document.getElementById('balloon-arena');
const balloonScoreEl = document.getElementById('balloon-score');
const balloonTimeEl = document.getElementById('balloon-time');
const balloonStartBtn = document.getElementById('balloon-start');
let balloonScore = 0;
let balloonTime = 30;
let balloonSpawnTimer = null;
let balloonCountdownTimer = null;
const balloonEmojis = ['🎈', '🎈', '🎈', '🎀', '🎁'];

function startBalloonGame() {
  clearInterval(balloonSpawnTimer);
  clearInterval(balloonCountdownTimer);
  balloonArena.innerHTML = '';
  balloonScore = 0;
  balloonTime = 30;
  balloonScoreEl.textContent = '0';
  balloonTimeEl.textContent = '30';
  balloonStartBtn.textContent = 'Restart';

  balloonSpawnTimer = setInterval(spawnPopBalloon, 650);

  balloonCountdownTimer = setInterval(() => {
    balloonTime--;
    balloonTimeEl.textContent = balloonTime;
    if (balloonTime <= 0) endBalloonGame();
  }, 1000);
}

function spawnPopBalloon() {
  const b = document.createElement('div');
  b.className = 'pop-balloon';
  b.textContent = balloonEmojis[(Math.random() * balloonEmojis.length) | 0];
  const arenaWidth = balloonArena.clientWidth - 50;
  b.style.left = Math.random() * arenaWidth + 'px';
  b.style.top = balloonArena.clientHeight + 'px';
  b.style.filter = `hue-rotate(${(Math.random() * 360) | 0}deg)`;
  balloonArena.appendChild(b);

  const duration = 3000 + Math.random() * 2000;
  const start = performance.now();
  const startTop = balloonArena.clientHeight;
  function rise(now) {
    const progress = (now - start) / duration;
    if (progress >= 1 || !b.isConnected) {
      b.remove();
      return;
    }
    b.style.top = startTop - progress * (balloonArena.clientHeight + 60) + 'px';
    requestAnimationFrame(rise);
  }
  requestAnimationFrame(rise);

  b.addEventListener('click', () => {
    balloonScore++;
    balloonScoreEl.textContent = balloonScore;
    b.style.transform = 'scale(1.6)';
    b.style.opacity = '0';
    SFX.pop();
    spawnConfetti(12);
    setTimeout(() => b.remove(), 100);
  });
}

function endBalloonGame() {
  clearInterval(balloonSpawnTimer);
  clearInterval(balloonCountdownTimer);
  balloonArena.querySelectorAll('.pop-balloon').forEach((b) => b.remove());
  balloonArena.innerHTML = `<p class="arena-hint">⏰ Time's up! You popped <b>${balloonScore}</b> balloons!<br/>🎉 Press Start to play again.</p>`;
  balloonStartBtn.textContent = 'Start';
  spawnConfetti(80);
  SFX.win();
  showToast(`Great job Shreya! Score: ${balloonScore} 🎈`);
}

balloonStartBtn.addEventListener('click', startBalloonGame);

/* ============================================================
   GAME 2 — MEMORY MATCH
   ============================================================ */
const memoryGrid = document.getElementById('memory-grid');
const memoryMovesEl = document.getElementById('memory-moves');
const memoryMatchesEl = document.getElementById('memory-matches');
const memoryStartBtn = document.getElementById('memory-start');
const memoryIcons = ['🎂', '🎈', '🎁', '🍰', '🎉', '🌟', '🦋', '🌈'];
let memFirst = null;
let memLock = false;
let memMoves = 0;
let memMatches = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startMemoryGame() {
  memoryGrid.innerHTML = '';
  memFirst = null;
  memLock = false;
  memMoves = 0;
  memMatches = 0;
  memoryMovesEl.textContent = '0';
  memoryMatchesEl.textContent = '0/8';

  const deck = shuffle([...memoryIcons, ...memoryIcons]);
  deck.forEach((icon) => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.dataset.icon = icon;
    card.innerHTML = `
      <div class="mem-inner">
        <div class="mem-face mem-front">❓</div>
        <div class="mem-face mem-back">${icon}</div>
      </div>`;
    card.addEventListener('click', () => flipMemCard(card));
    memoryGrid.appendChild(card);
  });
}

function flipMemCard(card) {
  if (memLock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  SFX.click();

  if (!memFirst) {
    memFirst = card;
    return;
  }

  memMoves++;
  memoryMovesEl.textContent = memMoves;

  if (memFirst.dataset.icon === card.dataset.icon) {
    memFirst.classList.add('matched');
    card.classList.add('matched');
    memFirst = null;
    memMatches++;
    memoryMatchesEl.textContent = memMatches + '/8';
    SFX.match();
    spawnConfetti(15);
    if (memMatches === 8) {
      spawnConfetti(160);
      SFX.fanfare();
      showToast(`🏆 You won in ${memMoves} moves, Shreya!`);
    }
  } else {
    memLock = true;
    const first = memFirst;
    memFirst = null;
    SFX.error();
    setTimeout(() => {
      first.classList.remove('flipped');
      card.classList.remove('flipped');
      memLock = false;
    }, 800);
  }
}

memoryStartBtn.addEventListener('click', startMemoryGame);
startMemoryGame(); // init board

/* ============================================================
   GAME 3 — CATCH THE GIFTS
   ============================================================ */
const catchArena = document.getElementById('catch-arena');
const catchScoreEl = document.getElementById('catch-score');
const catchLivesEl = document.getElementById('catch-lives');
const catchStartBtn = document.getElementById('catch-start');
const basket = document.getElementById('basket');
let catchScore = 0;
let catchLives = 3;
let catchRunning = false;
let catchSpawnTimer = null;
let basketX = 0;
let fallingItems = [];

function moveBasket(clientX) {
  const rect = catchArena.getBoundingClientRect();
  let x = clientX - rect.left;
  x = Math.max(25, Math.min(rect.width - 25, x));
  basketX = x;
  basket.style.left = x + 'px';
}
catchArena.addEventListener('mousemove', (e) => moveBasket(e.clientX));
catchArena.addEventListener('touchmove', (e) => {
  if (e.touches[0]) moveBasket(e.touches[0].clientX);
}, { passive: true });

function startCatchGame() {
  if (catchRunning) return;
  catchArena.querySelectorAll('.falling, .arena-hint').forEach((el) => el.remove());
  fallingItems.forEach((f) => f.el.remove());
  fallingItems = [];
  catchScore = 0;
  catchLives = 3;
  catchScoreEl.textContent = '0';
  catchLivesEl.textContent = '3';
  catchRunning = true;
  catchStartBtn.textContent = 'Playing...';
  basketX = catchArena.clientWidth / 2;
  basket.style.left = basketX + 'px';

  catchSpawnTimer = setInterval(spawnFalling, 850);
  requestAnimationFrame(catchLoop);
}

function spawnFalling() {
  if (!catchRunning) return;
  const isBomb = Math.random() < 0.25;
  const el = document.createElement('div');
  el.className = 'falling';
  el.textContent = isBomb ? '💣' : ['🎁', '🍰', '🎈', '⭐'][(Math.random() * 4) | 0];
  const x = 20 + Math.random() * (catchArena.clientWidth - 50);
  el.style.left = x + 'px';
  el.style.top = '-40px';
  catchArena.appendChild(el);
  fallingItems.push({ el, x, y: -40, bomb: isBomb, speed: 2.2 + Math.random() * 2.2 });
}

function catchLoop() {
  if (!catchRunning) return;
  const arenaH = catchArena.clientHeight;
  const basketTop = arenaH - 55;

  for (let i = fallingItems.length - 1; i >= 0; i--) {
    const f = fallingItems[i];
    f.y += f.speed;
    f.el.style.top = f.y + 'px';

    // caught?
    if (f.y >= basketTop && f.y <= arenaH - 5 && Math.abs(f.x - basketX) < 38) {
      if (f.bomb) {
        SFX.error();
        loseLife();
      } else {
        catchScore++;
        catchScoreEl.textContent = catchScore;
        SFX.catchSfx();
        spawnConfetti(8);
      }
      f.el.remove();
      fallingItems.splice(i, 1);
      continue;
    }
    // missed
    if (f.y > arenaH) {
      if (!f.bomb) loseLife();
      f.el.remove();
      fallingItems.splice(i, 1);
    }
  }
  requestAnimationFrame(catchLoop);
}

function loseLife() {
  catchLives--;
  catchLivesEl.textContent = Math.max(0, catchLives);
  if (catchLives <= 0) endCatchGame();
}

function endCatchGame() {
  catchRunning = false;
  clearInterval(catchSpawnTimer);
  fallingItems.forEach((f) => f.el.remove());
  fallingItems = [];
  catchStartBtn.textContent = 'Start';
  const hint = document.createElement('p');
  hint.className = 'arena-hint';
  hint.innerHTML = `💔 Game Over!<br/>You caught <b>${catchScore}</b> gifts!<br/>🎁 Press Start to try again.`;
  catchArena.appendChild(hint);
  SFX.win();
  showToast(`Nice catching, Shreya! Score: ${catchScore} 🎁`);
  if (catchScore > 0) spawnConfetti(70);
}

catchStartBtn.addEventListener('click', startCatchGame);

/* ============================================================
   SFX TOGGLE
   ============================================================ */
const sfxBtn = document.getElementById('sfx-toggle');
sfxBtn.addEventListener('click', () => {
  SFX.enabled = !SFX.enabled;
  if (SFX.enabled) {
    SFX.init();
    SFX.match();
    sfxBtn.textContent = '🔔';
    showToast('Sound effects ON 🔔');
  } else {
    sfxBtn.textContent = '🔕';
    showToast('Sound effects OFF 🔕');
  }
});

/* ============================================================
   GAME 4 — SIMON SAYS (sound & color memory)
   ============================================================ */
const simonPads = Array.from(document.querySelectorAll('.simon-pad'));
const simonRoundEl = document.getElementById('simon-round');
const simonBestEl = document.getElementById('simon-best');
const simonStartBtn = document.getElementById('simon-start');
const simonMsg = document.getElementById('simon-msg');
const simonFreqs = [329.6, 440, 554.4, 659.3]; // E4, A4, C#5, E5
let simonSeq = [];
let simonInput = [];
let simonBest = 0;
let simonAcceptingInput = false;

function lightPad(idx, playSound = true) {
  const pad = simonPads[idx];
  pad.classList.add('lit');
  if (playSound) SFX.tone(simonFreqs[idx], 0.32, 'sine', 0.3);
  setTimeout(() => pad.classList.remove('lit'), 320);
}

function playSimonSequence() {
  simonAcceptingInput = false;
  simonMsg.textContent = '👀 Watch carefully...';
  let i = 0;
  const interval = setInterval(() => {
    lightPad(simonSeq[i]);
    i++;
    if (i >= simonSeq.length) {
      clearInterval(interval);
      setTimeout(() => {
        simonAcceptingInput = true;
        simonInput = [];
        simonMsg.textContent = '🎯 Your turn — repeat the sequence!';
      }, 500);
    }
  }, 700);
}

function nextSimonRound() {
  simonSeq.push((Math.random() * 4) | 0);
  simonRoundEl.textContent = simonSeq.length;
  setTimeout(playSimonSequence, 600);
}

function startSimon() {
  SFX.init();
  simonSeq = [];
  simonInput = [];
  simonRoundEl.textContent = '0';
  simonStartBtn.textContent = 'Restart';
  simonMsg.textContent = 'Get ready...';
  nextSimonRound();
}

simonPads.forEach((pad, idx) => {
  pad.addEventListener('click', () => {
    if (!simonAcceptingInput) return;
    lightPad(idx);
    simonInput.push(idx);
    const pos = simonInput.length - 1;
    if (simonInput[pos] !== simonSeq[pos]) {
      // wrong
      simonAcceptingInput = false;
      SFX.error();
      simonMsg.textContent = `❌ Oops! You reached round ${simonSeq.length - 1}. Press Restart!`;
      if (simonSeq.length - 1 > simonBest) {
        simonBest = simonSeq.length - 1;
        simonBestEl.textContent = simonBest;
      }
      simonStartBtn.textContent = 'Start';
      return;
    }
    if (simonInput.length === simonSeq.length) {
      // round complete
      simonAcceptingInput = false;
      SFX.match();
      spawnConfetti(20);
      simonMsg.textContent = '✅ Nice! Next round...';
      nextSimonRound();
    }
  });
});
simonStartBtn.addEventListener('click', startSimon);

/* ============================================================
   GAME 5 — WHACK THE CAKE
   ============================================================ */
const whackGrid = document.getElementById('whack-grid');
const whackScoreEl = document.getElementById('whack-score');
const whackTimeEl = document.getElementById('whack-time');
const whackStartBtn = document.getElementById('whack-start');
let whackScore = 0;
let whackTime = 20;
let whackRunning = false;
let whackPopTimer = null;
let whackCountdown = null;

// build 9 holes once
for (let i = 0; i < 9; i++) {
  const hole = document.createElement('div');
  hole.className = 'whack-hole';
  hole.innerHTML = '<span class="whack-mole"></span>';
  whackGrid.appendChild(hole);
}
const whackHoles = Array.from(whackGrid.children);

whackHoles.forEach((hole) => {
  hole.addEventListener('click', () => {
    if (!whackRunning || !hole.classList.contains('up') || hole.classList.contains('bonk')) return;
    const isBomb = hole.dataset.type === 'bomb';
    hole.classList.add('bonk');
    if (isBomb) {
      SFX.error();
      whackScore = Math.max(0, whackScore - 2);
      showToast('💥 Bomb! -2');
    } else {
      SFX.pop();
      whackScore++;
      spawnConfetti(8);
    }
    whackScoreEl.textContent = whackScore;
    setTimeout(() => { hole.classList.remove('up', 'bonk'); }, 120);
  });
});

function popMole() {
  if (!whackRunning) return;
  const available = whackHoles.filter((h) => !h.classList.contains('up'));
  if (available.length === 0) return;
  const hole = available[(Math.random() * available.length) | 0];
  const isBomb = Math.random() < 0.25;
  hole.dataset.type = isBomb ? 'bomb' : 'cake';
  hole.querySelector('.whack-mole').textContent = isBomb ? '💣' : '🎂';
  hole.classList.add('up');
  setTimeout(() => hole.classList.remove('up', 'bonk'), 800 + Math.random() * 500);
}

function startWhack() {
  clearInterval(whackPopTimer);
  clearInterval(whackCountdown);
  whackScore = 0;
  whackTime = 20;
  whackScoreEl.textContent = '0';
  whackTimeEl.textContent = '20';
  whackRunning = true;
  whackStartBtn.textContent = 'Restart';
  SFX.init();
  whackPopTimer = setInterval(popMole, 650);
  whackCountdown = setInterval(() => {
    whackTime--;
    whackTimeEl.textContent = whackTime;
    if (whackTime <= 0) endWhack();
  }, 1000);
}

function endWhack() {
  whackRunning = false;
  clearInterval(whackPopTimer);
  clearInterval(whackCountdown);
  whackHoles.forEach((h) => h.classList.remove('up', 'bonk'));
  whackStartBtn.textContent = 'Start';
  SFX.win();
  spawnConfetti(90);
  showToast(`🎂 Time's up! You scored ${whackScore}, Shreya!`);
}

whackStartBtn.addEventListener('click', startWhack);

/* ============================================================
   GAME 6 — SPIN THE WHEEL
   ============================================================ */
const wheelCanvas = document.getElementById('wheel-canvas');
const wheelCtx = wheelCanvas.getContext('2d');
const wheelSpinBtn = document.getElementById('wheel-spin');
const wheelResult = document.getElementById('wheel-result');
const wheelSegments = [
  { label: '🎁 A Gift!', color: '#ff4d8d' },
  { label: '🍰 Cake!', color: '#ffd166' },
  { label: '🤗 A Hug', color: '#8a2be2' },
  { label: '🎶 A Song', color: '#2575fc' },
  { label: '⭐ A Wish', color: '#80ed99' },
  { label: '💖 Love', color: '#ff7b00' },
  { label: '🎉 Party!', color: '#f72585' },
  { label: '😘 A Kiss', color: '#4dd0ff' }
];
let wheelAngle = 0;
let wheelSpinning = false;

function drawWheel() {
  const n = wheelSegments.length;
  const size = wheelCanvas.width;
  const r = size / 2;
  const arc = (Math.PI * 2) / n;
  wheelCtx.clearRect(0, 0, size, size);
  for (let i = 0; i < n; i++) {
    const start = i * arc;
    wheelCtx.beginPath();
    wheelCtx.moveTo(r, r);
    wheelCtx.arc(r, r, r, start, start + arc);
    wheelCtx.fillStyle = wheelSegments[i].color;
    wheelCtx.fill();
    // text
    wheelCtx.save();
    wheelCtx.translate(r, r);
    wheelCtx.rotate(start + arc / 2);
    wheelCtx.textAlign = 'right';
    wheelCtx.fillStyle = '#fff';
    wheelCtx.font = 'bold 15px Poppins, sans-serif';
    wheelCtx.fillText(wheelSegments[i].label, r - 14, 6);
    wheelCtx.restore();
  }
  // center hub
  wheelCtx.beginPath();
  wheelCtx.arc(r, r, 26, 0, Math.PI * 2);
  wheelCtx.fillStyle = '#fff';
  wheelCtx.fill();
  wheelCtx.font = '22px serif';
  wheelCtx.textAlign = 'center';
  wheelCtx.fillText('🎂', r, r + 8);
}
drawWheel();

function spinWheel() {
  if (wheelSpinning) return;
  wheelSpinning = true;
  wheelResult.textContent = '';
  SFX.whoosh();
  const n = wheelSegments.length;
  const arc = 360 / n;
  const turns = 4 + Math.random() * 3;
  const extra = Math.random() * 360;
  wheelAngle += turns * 360 + extra;
  wheelCanvas.style.transform = `rotate(${wheelAngle}deg)`;

  // ticking sounds during spin
  let ticks = 0;
  const tickTimer = setInterval(() => {
    SFX.tone(900, 0.04, 'square', 0.08);
    ticks++;
    if (ticks > 18) clearInterval(tickTimer);
  }, 180);

  setTimeout(() => {
    const normalized = ((wheelAngle % 360) + 360) % 360;
    // pointer at top (270deg in canvas terms). Segment under pointer:
    const idx = Math.floor(((360 - normalized + 270) % 360) / arc) % n;
    wheelResult.textContent = `You won: ${wheelSegments[idx].label}`;
    SFX.fanfare();
    spawnConfetti(140);
    wheelSpinning = false;
  }, 4100);
}
wheelSpinBtn.addEventListener('click', spinWheel);

/* ============================================================
   Welcome confetti + scroll reveal
   ============================================================ */
window.addEventListener('load', () => {
  setTimeout(() => spawnConfetti(90), 400);
});

// play music + init audio on first user interaction (browser autoplay policy)
document.body.addEventListener('click', () => {
  SFX.init();
  tryPlayMusic();
}, { once: true });
