// --- 全コード省略なし、通常バリアのクールタイムが常に進むよう修正済み ---
// グローバル変数、初期化
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// プレイヤー設定（HP100、特別バリア対応）
const player = {
  x: canvas.width / 2 - 10,
  y: canvas.height - 45,
  w: 20,
  h: 10,
  hitbox: { offsetX: 5, offsetY: 2, size: 6 },
  speed: 5,
  slowSpeed: 2,
  color: "#4caf50",
  bullets: [],
  alive: true,
  cooldown: 0,
  hp: 100,
  maxHp: 100,
  barrierCount: 2,
  barrierActive: false,
  barrierCooldown: 0,
  barrierDuration: 60,
  barrierTimer: 0,
  specialReady: true,
  specialCooldown: 0,
  specialCooldownMax: 360,
  specialType: "normal",
  healSpecialReady: true,
  healSpecialCooldown: 0,
  healSpecialCooldownMax: 900,
  ammo: 100,
  maxAmmo: 100,
  reloading: false,
  reloadTime: 300,
  reloadTimer: 0,
  autofireInterval: 30,
  homingSpecialReady: true,
  homingSpecialCooldown: 0,
  homingSpecialCooldownMax: 360,
  specialBarrierActive: false,
  specialBarrierTimer: 0,
};

const cpu = {
  x: canvas.width / 2 - 20,
  y: 30,
  w: 40,
  h: 20,
  speed: 3,
  color: "#e91e63",
  bullets: [],
  alive: true,
  hp: 1000,
  vx: 3,
  vy: 0,
  moveTimer: 0,
  verticalFireTimer: 0,
  verticalFireInterval: 0,
  timeStopCardUsed: false,
  timeStopCardActive: false,
  timeStopCardTimer: 0,
  timeStopCardReady: false,
  timeStopCardWait: 0,
};

let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;
let spacePressed = false;
let barrierPressed = false;
let barrierInfoPressed = false;
let specialPressed = false;
let shiftPressed = false;
let reloadPressed = false;
let vPressed = false;
let vPressedPrev = false;
let hPressed = false;
let hPressedPrev = false;
let invincibleMode = false;

let gameover = false;
let winner = null;

const CPU_BULLET_SPEED = 1.5;
const BULLET_COUNT = 30;
const PLAYER_BULLET_SPEED = 7;
const BARRAGE_INTERVAL = 90;
const SPECIAL_INTERVAL = 600;
const SPECIAL_BULLET_COUNT = 60;
const SPECIAL_BULLET_SPEED = 6;
const BARRIER_COOLDOWN = 300;
const BARRIER_BULLET_COUNT = 60;
const BARRIER_BULLET_SPEED = 4;

const VERTICAL_FIRE_COOLDOWN = 180;
const VERTICAL_FIRE_DURATION = 120;
const VERTICAL_BULLET_RATE = 10;
const VERTICAL_BULLET_SPEED = 3.0;

const TIMESTOP_CARD_TRIGGER_TIME = 10 * 60;
const TIMESTOP_DURATION = 5 * 60;
const TIMESTOP_BULLET_COUNT = 360;
const TIMESTOP_BULLET_SPEED = 5;
const SPECIAL_BARRIER_DURATION = 20 * 60;

let verticalFireFrameCount = 0;

let barrierBullets = [];
let specialRainbowBullets = [];
let homingBullets = [];
let gameFrameCount = 0;
let gameStarted = false;
let loopFrameId = null;
let gameStartTime = null;

function startGameLoop() {
  if (gameStarted) return;
  gameStarted = true;
  loop();
}
window.startGameLoop = startGameLoop;

// イベントリスナ
document.addEventListener("keydown", (e) => {
  if (e.code === "Digit9") {
    invincibleMode = true;
    setTimeout(() => {
      alert("無敵モード発動！");
    }, 100);
  }
  if (e.code === "ArrowLeft") leftPressed = true;
  if (e.code === "ArrowRight") rightPressed = true;
  if (e.code === "ArrowUp") upPressed = true;
  if (e.code === "ArrowDown") downPressed = true;
  if (e.code === "Space") spacePressed = true;
  if (e.code === "KeyX") barrierPressed = true;
  if (e.code === "KeyZ") barrierInfoPressed = true;
  if (e.code === "KeyC") specialPressed = true;
  if (e.code === "KeyH") hPressed = true;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") shiftPressed = true;
  if (e.code === "KeyR") reloadPressed = true;
  if (e.code === "KeyV") vPressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") leftPressed = false;
  if (e.code === "ArrowRight") rightPressed = false;
  if (e.code === "ArrowUp") upPressed = false;
  if (e.code === "ArrowDown") downPressed = false;
  if (e.code === "Space") spacePressed = false;
  if (e.code === "KeyX") barrierPressed = false;
  if (e.code === "KeyZ") barrierInfoPressed = false;
  if (e.code === "KeyC") specialPressed = false;
  if (e.code === "KeyH") hPressed = false;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") shiftPressed = false;
  if (e.code === "KeyR") reloadPressed = false;
  if (e.code === "KeyV") vPressed = false;
});

// --- 描画系 ---
function drawBullets(bullets, color) {
  ctx.fillStyle = color;
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
}
function drawColorfulBullets(bullets) {
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    ctx.save();
    ctx.fillStyle = b.color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
function drawHomingBullets(bullets) {
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w, 0, Math.PI * 2);
    ctx.fillStyle = "#ff5050";
    ctx.shadowColor = "#ff5050";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
  }
}
function drawBarrier(player) {
  if (player.barrierActive) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      player.x + player.w / 2,
      player.y + player.h / 2,
      Math.max(player.w, player.h),
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = "rgba(0,200,255,0.7)";
    ctx.lineWidth = 5;
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.restore();
  }
  if (player.specialBarrierActive) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      player.x + player.w / 2,
      player.y + player.h / 2,
      Math.max(player.w, player.h) + 10,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = "rgba(255,215,0,0.88)";
    ctx.lineWidth = 8;
    ctx.shadowColor = "#ffe900";
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.restore();
  }
}

// --- 更新系 ---
function updateBullets(bullets) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.dx;
    b.y += b.dy;
    if (b.cpuBounce === undefined) b.cpuBounce = 0;
    if (b.isCpu) {
      let bounced = false;
      if ((b.x <= 0 && b.dx < 0) || (b.x + b.w >= canvas.width && b.dx > 0)) {
        if (b.cpuBounce < 1) {
          b.dx = -b.dx;
          b.cpuBounce++;
          bounced = true;
        }
      }
      if ((b.y <= 0 && b.dy < 0) || (b.y + b.h >= canvas.height && b.dy > 0)) {
        if (b.cpuBounce < 1 && !bounced) {
          b.dy = -b.dy;
          b.cpuBounce++;
        }
      }
      if (
        (b.x < -b.w || b.x > canvas.width + b.w ||
         b.y < -b.h || b.y > canvas.height + b.h) &&
        b.cpuBounce > 0
      ) {
        bullets.splice(i, 1);
        continue;
      }
    } else {
      if (
        b.y < 0 ||
        b.y > canvas.height ||
        b.x < 0 ||
        b.x > canvas.width
      ) {
        bullets.splice(i, 1);
        continue;
      }
    }
  }
}
function updateColorfulBullets(bullets) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].dx;
    bullets[i].y += bullets[i].dy;
    if (
      bullets[i].y < -20 ||
      bullets[i].y > canvas.height + 20 ||
      bullets[i].x < -20 ||
      bullets[i].x > canvas.width + 20
    ) {
      bullets.splice(i, 1);
    }
  }
}
function updateHomingBullets(bullets) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    const tx = cpu.x + cpu.w / 2;
    const ty = cpu.y + cpu.h / 2;
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    const dx = tx - bx;
    const dy = ty - by;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      const speed = 6;
      const ratio = speed / dist;
      b.dx = dx * ratio;
      b.dy = dy * ratio;
    }
    b.x += b.dx;
    b.y += b.dy;
    if (b.x < -20 || b.x > canvas.width + 20 || b.y < -20 || b.y > canvas.height + 20) {
      bullets.splice(i, 1);
    }
  }
}
function updateSpecialRainbowBullets() {
  for (let i = specialRainbowBullets.length - 1; i >= 0; i--) {
    const b = specialRainbowBullets[i];
    b.x += b.dx;
    b.y += b.dy;
    for (let j = cpu.bullets.length - 1; j >= 0; j--) {
      const c = cpu.bullets[j];
      if (
        b.x < c.x + c.w &&
        b.x + b.w > c.x &&
        b.y < c.y + c.h &&
        b.y + b.h > c.y
      ) {
        cpu.bullets.splice(j, 1);
      }
    }
    if (--b.lifetime <= 0) {
      specialRainbowBullets.splice(i, 1);
    }
  }
}

// --- 当たり判定 ---
function checkCollisionWithSmallHitbox(bullet, player) {
  const hitboxX = player.x + player.hitbox.offsetX;
  const hitboxY = player.y + player.hitbox.offsetY;
  const hitboxSize = player.hitbox.size;
  return (
    bullet.x < hitboxX + hitboxSize &&
    bullet.x + bullet.w > hitboxX &&
    bullet.y < hitboxY + hitboxSize &&
    bullet.y + bullet.h > hitboxY
  );
}
function checkCollisionWithBarrier(bullet, player) {
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const bx = bullet.x + bullet.w / 2;
  const by = bullet.y + bullet.h / 2;
  const barrierRadius = Math.max(player.w, player.h) + 2;
  const dist = Math.hypot(px - bx, py - by);
  return dist < barrierRadius;
}
function checkCollisionWithSpecialBarrier(bullet, player) {
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const bx = bullet.x + bullet.w / 2;
  const by = bullet.y + bullet.h / 2;
  const barrierRadius = Math.max(player.w, player.h) + 18;
  const dist = Math.hypot(px - bx, py - by);
  return dist < barrierRadius;
}
function checkCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// --- 発射/必殺技 ---
function fireBulletWithAngle(originX, originY, angleRad, speed, isCpu = false) {
  return {
    x: originX,
    y: originY,
    w: 4,
    h: 12,
    dx: Math.cos(angleRad) * speed,
    dy: Math.sin(angleRad) * speed,
    isCpu: isCpu,
    cpuBounce: 0
  };
}
function firePlayerBulletStraight() {
  return {
    x: player.x + player.w / 2 - 2,
    y: player.y - 6,
    w: 4,
    h: 12,
    dx: 0,
    dy: -PLAYER_BULLET_SPEED,
    isCpu: false,
    cpuBounce: 0
  };
}
function cpuBarrage() {
  const cx = cpu.x + cpu.w / 2;
  const cy = cpu.y + cpu.h;
  for (let i = 0; i < BULLET_COUNT; i++) {
    const angle = (2 * Math.PI) * (i / BULLET_COUNT);
    cpu.bullets.push(fireBulletWithAngle(cx - 2, cy, angle, CPU_BULLET_SPEED, true));
  }
}
function cpuSpecialBarrage() {
  const cx = cpu.x + cpu.w / 2;
  const cy = cpu.y + cpu.h;
  const offset = Math.PI / SPECIAL_BULLET_COUNT;
  for (let i = 0; i < SPECIAL_BULLET_COUNT; i++) {
    const angle = (2 * Math.PI) * (i / SPECIAL_BULLET_COUNT) + offset;
    cpu.bullets.push(fireBulletWithAngle(cx - 2, cy, angle, SPECIAL_BULLET_SPEED, true));
  }
}
function fireBarrierColorfulBullets() {
  barrierBullets = [];
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  for (let i = 0; i < BARRIER_BULLET_COUNT; i++) {
    const angle = (2 * Math.PI) * (i / BARRIER_BULLET_COUNT);
    const color = `hsl(${(i * 360 / BARRIER_BULLET_COUNT)}, 80%, 60%)`;
    barrierBullets.push({
      x: cx,
      y: cy,
      w: 8,
      h: 8,
      dx: Math.cos(angle) * BARRIER_BULLET_SPEED,
      dy: Math.sin(angle) * BARRIER_BULLET_SPEED,
      color: color
    });
  }
}
function usePlayerSpecial() {
  if (player.specialType === "normal") {
    if (!player.specialReady || gameover) return;
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    const radius = 150;
    let newRainbows = [];
    for (let i = cpu.bullets.length - 1; i >= 0; i--) {
      const b = cpu.bullets[i];
      const bx = b.x + b.w / 2;
      const by = b.y + b.h / 2;
      const dist = Math.hypot(px - bx, py - by);
      if (dist < radius) {
        for (let j = 0; j < 8; j++) {
          const angle = (2 * Math.PI) * (j / 8);
          const color = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
          newRainbows.push({
            x: bx,
            y: by,
            w: 10,
            h: 10,
            dx: Math.cos(angle) * 3,
            dy: Math.sin(angle) * 3,
            color: color,
            lifetime: 60
          });
        }
        cpu.bullets.splice(i, 1);
      }
    }
    specialRainbowBullets.push(...newRainbows);
    player.specialReady = false;
    player.specialCooldown = player.specialCooldownMax;
  } else if (player.specialType === "heal") {
    if (!player.healSpecialReady || gameover) return;
    player.hp = player.maxHp;
    player.healSpecialReady = false;
    player.healSpecialCooldown = player.healSpecialCooldownMax;
  }
}
function useHomingSpecial() {
  if (!player.homingSpecialReady || gameover) return;
  homingBullets.push({
    x: player.x + player.w / 2 - 7,
    y: player.y - 14,
    w: 14,
    h: 14,
    dx: 0,
    dy: -7,
    damage: 20
  });
  player.homingSpecialReady = false;
  player.homingSpecialCooldown = player.homingSpecialCooldownMax;
}

// --- CPU動き・イベント ---
function updateCpuMovement() {
  if (cpu.moveTimer <= 0) {
    const angle = Math.random() * Math.PI * 2;
    cpu.vx = Math.cos(angle) * cpu.speed * (0.5 + Math.random());
    cpu.vy = Math.sin(angle) * cpu.speed * (0.4 + Math.random() * 0.6);
    cpu.moveTimer = 40 + Math.random() * 80;
  }
  cpu.moveTimer--;
  cpu.x += cpu.vx;
  cpu.y += cpu.vy;
  if (cpu.x < 0) { cpu.x = 0; cpu.vx = Math.abs(cpu.vx);}
  if (cpu.x + cpu.w > canvas.width) { cpu.x = canvas.width - cpu.w; cpu.vx = -Math.abs(cpu.vx);}
  if (cpu.y < 0) { cpu.y = 0; cpu.vy = Math.abs(cpu.vy);}
  if (cpu.y + cpu.h > canvas.height / 2) { cpu.y = canvas.height / 2 - cpu.h; cpu.vy = -Math.abs(cpu.vy);}
}
function activateTimeStopCard() {
  cpu.timeStopCardActive = true;
  cpu.timeStopCardTimer = TIMESTOP_DURATION;
  player.specialBarrierActive = true;
  player.specialBarrierTimer = SPECIAL_BARRIER_DURATION;
}
function fireTimeStopBulletBarrage() {
  const cx = cpu.x + cpu.w / 2;
  const cy = cpu.y + cpu.h / 2;
  for (let i = 0; i < TIMESTOP_BULLET_COUNT; i++) {
    const angle = (2 * Math.PI) * (i / TIMESTOP_BULLET_COUNT);
    cpu.bullets.push(fireBulletWithAngle(cx, cy, angle, TIMESTOP_BULLET_SPEED, true));
  }
}
function cpuFireVerticalBullets() {
  if (cpu.verticalFireTimer > 0) {
    verticalFireFrameCount++;
    if (verticalFireFrameCount % VERTICAL_BULLET_RATE === 0) {
      const px = cpu.x + cpu.w / 2;
      const left = cpu.x + 5;
      const right = cpu.x + cpu.w - 5;
      cpu.bullets.push({
        x: px - 2,
        y: cpu.y + cpu.h,
        w: 4,
        h: 12,
        dx: 0,
        dy: VERTICAL_BULLET_SPEED,
        isCpu: true,
        cpuBounce: 0
      });
      cpu.bullets.push({
        x: left - 2,
        y: cpu.y + cpu.h,
        w: 4,
        h: 12,
        dx: 0,
        dy: VERTICAL_BULLET_SPEED,
        isCpu: true,
        cpuBounce: 0
      });
      cpu.bullets.push({
        x: right - 2,
        y: cpu.y + cpu.h,
        w: 4,
        h: 12,
        dx: 0,
        dy: VERTICAL_BULLET_SPEED,
        isCpu: true,
        cpuBounce: 0
      });
    }
    cpu.verticalFireTimer--;
    if (cpu.verticalFireTimer <= 0) {
      verticalFireFrameCount = 0;
      cpu.verticalFireInterval = VERTICAL_FIRE_COOLDOWN;
    }
  } else {
    if (cpu.verticalFireInterval > 0) {
      cpu.verticalFireInterval--;
    } else {
      cpu.verticalFireTimer = VERTICAL_FIRE_DURATION;
      verticalFireFrameCount = 0;
    }
  }
}

// --- メインループ ---
function loop() {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameStartTime === null) gameStartTime = performance.now();
  gameFrameCount++;

  // --- バリアのクールタイムを常に進行させる ---
  if (player.barrierCooldown > 0) {
    player.barrierCooldown--;
    if (player.barrierCooldown < 0) player.barrierCooldown = 0;
  }

  // --- 時止めカード発動判定 ---
  if (!cpu.timeStopCardUsed && gameFrameCount >= TIMESTOP_CARD_TRIGGER_TIME) {
    cpu.timeStopCardUsed = true;
    activateTimeStopCard();
  }
  // --- 時止め中処理 ---
  if (cpu.timeStopCardActive) {
    cpu.timeStopCardTimer--;
    if (cpu.timeStopCardTimer === 0) {
      cpu.timeStopCardActive = false;
      fireTimeStopBulletBarrage();
    }
  }
  // --- 特別バリア管理 ---
  if (player.specialBarrierActive) {
    player.specialBarrierTimer--;
    if (player.specialBarrierTimer <= 0) {
      player.specialBarrierActive = false;
    }
  }

  // 必殺技タイプ切替
  if (vPressed && !vPressedPrev) {
    player.specialType = player.specialType === "normal" ? "heal" : "normal";
  }
  vPressedPrev = vPressed;

  // 追尾弾必殺技発動
  if (hPressed && !hPressedPrev) {
    useHomingSpecial();
  }
  hPressedPrev = hPressed;

  // クールタイム
  if (!player.specialReady && player.specialType === "normal") {
    player.specialCooldown--;
    if (player.specialCooldown <= 0) {
      player.specialReady = true;
      player.specialCooldown = 0;
    }
  }
  if (!player.healSpecialReady && player.specialType === "heal") {
    player.healSpecialCooldown--;
    if (player.healSpecialCooldown <= 0) {
      player.healSpecialReady = true;
      player.healSpecialCooldown = 0;
    }
  }
  if (!player.homingSpecialReady) {
    player.homingSpecialCooldown--;
    if (player.homingSpecialCooldown <= 0) {
      player.homingSpecialReady = true;
      player.homingSpecialCooldown = 0;
    }
  }

  // リロード
  if (player.reloading) {
    player.reloadTimer--;
    if (player.reloadTimer <= 0) {
      player.reloading = false;
      player.ammo = player.maxAmmo;
    }
  }

  // --- バリア発動中の管理 ---
  if (player.barrierActive) {
    player.barrierTimer--;
    if (player.barrierTimer <= 0) {
      player.barrierActive = false;
    }
  }

  // --- 時止め中は動けない ---
  let canAct = !cpu.timeStopCardActive && !gameover && player.alive && cpu.alive;
  if (canAct) {
    let moveSpeed = shiftPressed ? player.slowSpeed : player.speed;
    if (leftPressed && player.x > 0) player.x -= moveSpeed;
    if (rightPressed && player.x + player.w < canvas.width) player.x += moveSpeed;
    if (upPressed && player.y > 0) player.y -= moveSpeed;
    if (downPressed && player.y + player.h < canvas.height) player.y += moveSpeed;

    if (!player.barrierActive && !player.reloading && player.ammo > 0 && spacePressed && player.cooldown === 0) {
      player.bullets.push(firePlayerBulletStraight());
      player.cooldown = player.autofireInterval;
      player.ammo--;
    }
    if (player.cooldown > 0) player.cooldown--;

    if (!player.reloading && reloadPressed && player.ammo < player.maxAmmo) {
      player.reloading = true;
      player.reloadTimer = player.reloadTime;
    }

    if (
      barrierPressed &&
      !player.barrierActive &&
      player.barrierCooldown <= 0 &&
      player.barrierCount > 0
    ) {
      player.barrierActive = true;
      player.barrierTimer = player.barrierDuration;
      player.barrierCount--;
      player.barrierCooldown = BARRIER_COOLDOWN;
      fireBarrierColorfulBullets();
    }
    if (specialPressed) {
      usePlayerSpecial();
    }
    updateCpuMovement();
    if (cpu.barrageCooldown === undefined) cpu.barrageCooldown = 0;
    if (cpu.barrageCooldown <= 0) {
      cpuBarrage();
      cpu.barrageCooldown = BARRAGE_INTERVAL;
    }
    cpu.barrageCooldown--;
    if (cpu.specialCooldown === undefined) cpu.specialCooldown = 0;
    if (cpu.specialCooldown <= 0) {
      cpuSpecialBarrage();
      cpu.specialCooldown = SPECIAL_INTERVAL;
    }
    cpu.specialCooldown--;
    cpuFireVerticalBullets();
  }

  // --- 時止め中は弾も止まる ---
  if (!cpu.timeStopCardActive) {
    updateBullets(player.bullets);
    updateBullets(cpu.bullets);
    updateColorfulBullets(barrierBullets);
    updateSpecialRainbowBullets();
    updateHomingBullets(homingBullets);
  }

  // --- 判定 ---
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    if (checkCollision(player.bullets[i], cpu)) {
      cpu.hp -= 10;
      player.bullets.splice(i, 1);
      if (cpu.hp <= 0) {
        cpu.alive = false;
        winner = "あなた";
        gameover = true;
        // オンラインランキング連携
        if (typeof window.onGameClear === "function") {
          const clearTime = (performance.now() - gameStartTime) / 1000;
          window.onGameClear(clearTime, invincibleMode);
        }
      }
      break;
    }
  }
  for (let i = homingBullets.length - 1; i >= 0; i--) {
    const b = homingBullets[i];
    if (
      b.x < cpu.x + cpu.w &&
      b.x + b.w > cpu.x &&
      b.y < cpu.y + cpu.h &&
      b.y + b.h > cpu.y
    ) {
      cpu.hp -= b.damage;
      homingBullets.splice(i, 1);
      if (cpu.hp <= 0) {
        cpu.alive = false;
        winner = "あなた";
        gameover = true;
        if (typeof window.onGameClear === "function") {
          const clearTime = (performance.now() - gameStartTime) / 1000;
          window.onGameClear(clearTime, invincibleMode);
        }
      }
      break;
    }
  }
  for (let i = cpu.bullets.length - 1; i >= 0; i--) {
    if (player.specialBarrierActive && checkCollisionWithSpecialBarrier(cpu.bullets[i], player)) {
      cpu.bullets.splice(i, 1);
      continue;
    }
    if (player.barrierActive && checkCollisionWithBarrier(cpu.bullets[i], player)) {
      cpu.bullets.splice(i, 1);
      continue;
    }
    if (!invincibleMode && checkCollisionWithSmallHitbox(cpu.bullets[i], player)) {
      player.hp -= 5;
      cpu.bullets.splice(i, 1);
      if (player.hp <= 0) {
        player.alive = false;
        winner = "CPU";
        gameover = true;
      }
      break;
    } else if (invincibleMode && checkCollisionWithSmallHitbox(cpu.bullets[i], player)) {
      cpu.bullets.splice(i, 1);
      continue;
    }
  }

  // --- 描画 ---
  if (player.alive) {
    ctx.save();
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    if (invincibleMode) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#ff0";
      ctx.shadowBlur = 16;
      ctx.strokeRect(player.x - 2, player.y - 2, player.w + 4, player.h + 4);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
    drawBarrier(player);
  }
  if (cpu.alive) {
    ctx.fillStyle = cpu.color;
    ctx.fillRect(cpu.x, cpu.y, cpu.w, cpu.h);
  }
  drawBullets(player.bullets, "#fff");
  drawBullets(cpu.bullets, "#ffeb3b");
  drawColorfulBullets(barrierBullets);
  drawColorfulBullets(specialRainbowBullets);
  drawHomingBullets(homingBullets);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.fillText(`PLAYER HP: ${player.hp}/${player.maxHp}`, 10, canvas.height - 10);
  ctx.textAlign = "right";
  ctx.fillText(`CPU LIFE: ${Math.max(cpu.hp, 0)}`, canvas.width - 10, 20);
  ctx.save();
  ctx.fillStyle = "#333";
  ctx.fillRect(canvas.width / 2 - 150, 40, 300, 16);
  ctx.fillStyle = "#ff5090";
  ctx.fillRect(canvas.width / 2 - 150, 40, Math.max(0, cpu.hp / 1000 * 300), 16);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(canvas.width / 2 - 150, 40, 300, 16);
  ctx.restore();

  ctx.font = "18px sans-serif";
  ctx.fillStyle = player.reloading ? "#bbb" : (player.ammo === 0 ? "#ff5050" : "#00ffae");
  ctx.textAlign = "center";
  if (player.reloading) {
    ctx.fillText(`リロード中... (${(player.reloadTimer / 60).toFixed(1)}秒)`, canvas.width / 2, canvas.height - 50);
  } else if (player.ammo === 0) {
    ctx.fillText("弾切れ！Rキーでリロード", canvas.width / 2, canvas.height - 50);
  } else {
    ctx.fillText(`残弾数: ${player.ammo}/${player.maxAmmo}`, canvas.width / 2, canvas.height - 50);
  }
  if (invincibleMode) {
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#fff700";
    ctx.textAlign = "center";
    ctx.fillText("無敵モード", canvas.width / 2, 70);
  }
  if (cpu.timeStopCardActive) {
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#8ff";
    ctx.textAlign = "center";
    ctx.fillText("時が止まっている...", canvas.width / 2, canvas.height / 2 - 60);
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#ffe900";
    ctx.fillText(`特別バリア発動中`, canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = "22px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`時止め解除まで: ${(cpu.timeStopCardTimer/60).toFixed(1)}秒`, canvas.width / 2, canvas.height / 2 + 10);
  }
  if (player.specialBarrierActive && !cpu.timeStopCardActive) {
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#ffe900";
    ctx.textAlign = "center";
    ctx.fillText(`特別バリア残り: ${(player.specialBarrierTimer/60).toFixed(1)}秒`, canvas.width / 2, canvas.height / 2 + 80);
  }
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#ff5050";
  ctx.textAlign = "center";
  if (!gameover && cpu.alive) {
    ctx.fillText(`CPU必殺技まで: ${(cpu.specialCooldown / 60).toFixed(1)}秒`, canvas.width / 2, 30);
  }
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  let spText = "";
  if (player.specialType === "normal") {
    ctx.fillStyle = player.specialReady ? "#00ffae" : "#888";
    if (player.specialReady) {
      spText = "Cキー：必殺技発動（周囲の敵弾消去＋虹色弾幕）";
    } else {
      spText = `必殺技クールタイム: ${(player.specialCooldown / 60).toFixed(1)}秒`;
    }
  } else if (player.specialType === "heal") {
    ctx.fillStyle = player.healSpecialReady ? "#00ffae" : "#888";
    if (player.healSpecialReady) {
      spText = "Cキー：必殺技発動（体力全回復）";
    } else {
      spText = `全回復クールタイム: ${(player.healSpecialCooldown / 60).toFixed(1)}秒`;
    }
  }
  ctx.fillText(spText, canvas.width / 2, canvas.height - 25);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = player.homingSpecialReady ? "#00ffd0" : "#888";
  ctx.textAlign = "center";
  if (player.homingSpecialReady) {
    ctx.fillText("Hキー：追尾弾必殺技（CPUを追尾・20ダメージ）", canvas.width / 2, canvas.height - 100);
  } else {
    ctx.fillText(`追尾弾クールタイム: ${(player.homingSpecialCooldown / 60).toFixed(1)}秒`, canvas.width / 2, canvas.height - 100);
  }

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#f0f0f0";
  ctx.textAlign = "center";
  ctx.fillText("Vキー：必殺技切り替え", canvas.width / 2, canvas.height - 75);

  if (barrierInfoPressed && player.alive) {
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#00e6ff";
    ctx.textAlign = "left";
    let barrierMsg = `バリア残り:${player.barrierCount} `;
    if (player.barrierActive) {
      barrierMsg += "(発動中)";
    } else if (player.barrierCooldown > 0) {
      barrierMsg += `(クール:${(player.barrierCooldown / 60).toFixed(1)}秒)`;
    } else {
      barrierMsg += "(Xキーで発動)";
    }
    ctx.fillText(
      barrierMsg,
      player.x + player.w / 2 - 45,
      player.y - 10
    );
  }

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#00e6ff";
  ctx.textAlign = "center";
  if (player.barrierCooldown > 0) {
    ctx.fillText(
      `バリアクールタイム: ${(player.barrierCooldown / 60).toFixed(1)}秒`,
      canvas.width / 2,
      canvas.height / 2 + 60
    );
  }
  if (player.barrierActive) {
    ctx.font = "22px sans-serif";
    ctx.fillStyle = "#00e6ff";
    ctx.textAlign = "center";
    ctx.fillText("バリア中は弾を撃てません", canvas.width / 2, canvas.height - 80);
  }
  if (gameover) {
    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(winner + " の勝ち！", canvas.width / 2, canvas.height / 2);
    ctx.font = "18px sans-serif";
    ctx.fillText("F5でリトライ", canvas.width / 2, canvas.height / 2 + 40);
  } else {
    loopFrameId = requestAnimationFrame(loop);
  }
}