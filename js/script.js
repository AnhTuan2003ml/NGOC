/**
 * Thiệp mời tốt nghiệp — Nguyễn Ngọc Duy / FTU
 * --------------------------------------------------
 * Chỉ cần sửa EVENT_CONFIG nếu có lịch lễ chính xác.
 * Nhạc MP3 lặp lại sau khi khách bấm "Mở thiệp mời".
 * Hiệu ứng nền: lá thu vàng + coin, kim cương, đô-la, sao 3 cánh rơi (COIN_SVGS).
 */

const EVENT_CONFIG = {
  time: "TỪ 8H ĐẾN 10H SÁNG",
  date: "THỨ BẢY, 19.09.2026"
};

const gate = document.getElementById("open-gate");
const openButton = document.getElementById("open-invitation");
const guestNameInput = document.getElementById("guest-name-input");
const invitationGuestName = document.getElementById("invitation-guest-name");
const musicToggle = document.getElementById("music-toggle");
const backgroundAudio = document.getElementById("background-audio");
let musicPlaying = false;

function applyEventConfig() {
  document.getElementById("event-time").textContent = EVENT_CONFIG.time;
  document.getElementById("event-date").textContent = EVENT_CONFIG.date;
}

/**
 * Một số WebView (Zalo, Messenger, Safari iOS) báo 100dvh sai lúc mới mở và chỉ
 * sửa lại sau khi người dùng kéo màn. Đồng bộ chiều cao thật vào --vh để thiệp
 * luôn khít viewport ngay từ đầu.
 */
function isTextInputFocused() {
  const element = document.activeElement;
  return !!element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA");
}

let committedViewportHeight = 0;
let keyboardClosingUntil = 0;

function syncViewportHeight() {
  // Khi bàn phím ảo đang mở (ô nhập tên đang focus), WebView co innerHeight lại;
  // không ghi giá trị đó vào --vh, nếu không thiệp sẽ bị thu nhỏ vĩnh viễn.
  if (isTextInputFocused()) return;

  const height = window.innerHeight;
  if (!height) return;

  // Vừa rời ô nhập: bàn phím còn đang đóng (có animation), viewport tạm thời
  // vẫn nhỏ. Bỏ qua giá trị nhỏ hơn trong ~1s; các lần đo sau sẽ chốt giá trị đúng.
  if (Date.now() < keyboardClosingUntil && height < committedViewportHeight) return;

  committedViewportHeight = height;
  document.documentElement.style.setProperty("--vh", `${Math.round(height)}px`);
}

/* Đo lại vài lần vì bàn phím đóng / toolbar WebView co giãn có animation. */
function scheduleViewportSync() {
  [60, 300, 700, 1200].forEach((delay) => window.setTimeout(syncViewportHeight, delay));
}

function onGuestInputBlur() {
  keyboardClosingUntil = Date.now() + 1000;
  scheduleViewportSync();
}

/* Rời ô nhập chủ động (bấm "Mở thiệp mời"): đặt khoá trước khi blur để không
   phụ thuộc vào việc WebView có phát sự kiện blur hay không. */
function releaseGuestInput() {
  keyboardClosingUntil = Date.now() + 1000;
  guestNameInput?.blur();
  scheduleViewportSync();
}

syncViewportHeight();
scheduleViewportSync();
window.addEventListener("resize", syncViewportHeight, { passive: true });
window.addEventListener("orientationchange", scheduleViewportSync, { passive: true });
window.addEventListener("pageshow", scheduleViewportSync, { passive: true });
window.visualViewport?.addEventListener("resize", syncViewportHeight, { passive: true });
guestNameInput?.addEventListener("blur", onGuestInputBlur);

let sakuraResizeTimer = null;

function getSakuraPetalCount() {
  const width = window.innerWidth;

  if (width >= 1440) return 42;
  if (width >= 1024) return 34;
  if (width >= 768) return 26;
  return 18;
}

/* Vật rơi cùng lá — coin vàng (B), coin bạc (ETH), coin xanh (T),
   kim cương, tờ đô-la và ngôi sao 3 cánh. `ratio` = rộng / cao. */
const COIN_SVGS = [
  { ratio: 1, svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#e2b13c" stroke="#a8741a" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#fff0a0" stroke-width="2" opacity=".85"/><text x="32" y="44" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="33" fill="#7a5210">B</text><path d="M28.5 13v5M35.5 13v5M28.5 46v5M35.5 46v5" stroke="#7a5210" stroke-width="3" stroke-linecap="round"/></svg>' },
  { ratio: 1, svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#d7d9df" stroke="#8f929c" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#fff" stroke-width="2" opacity=".85"/><path d="M32 13l12.5 20L32 40.5 19.5 33z" fill="#6b6f7d"/><path d="M32 44.5l12.5-8L32 52l-12.5-15.5z" fill="#8f929c"/></svg>' },
  { ratio: 1, svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#3ba17b" stroke="#23744f" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#c9f1de" stroke-width="2" opacity=".8"/><path d="M19 18h26v8h-9v4.5c7 .5 11.5 2 11.5 3.6S43 37.3 36 37.8V48h-8V37.8c-7-.5-11.5-2-11.5-3.7S21 30.9 28 30.5V26h-9z" fill="#fff"/></svg>' },
  { ratio: 1.15, svg: '<svg viewBox="0 0 64 56" aria-hidden="true"><path d="M14 4h36l12 16-30 34L2 20z" fill="#8fd0f5"/><path d="M2 20h60L32 54z" fill="#4ea3e0"/><path d="M22 20L32 54l10-34z" fill="#7cc4f2"/><path d="M14 4l8 16 10-16 10 16 8-16M2 20h60" fill="none" stroke="#eaf7ff" stroke-width="2" stroke-linejoin="round"/><path d="M14 4L2 20l12 0M50 4l12 16-12 0" fill="none" stroke="#2f7fbf" stroke-width="1.4" stroke-linejoin="round" opacity=".7"/></svg>' },
  { ratio: 2, svg: '<svg viewBox="0 0 96 48" aria-hidden="true"><rect x="1" y="1" width="94" height="46" rx="4" fill="#5fae72" stroke="#2f6f3f" stroke-width="2"/><rect x="7" y="7" width="82" height="34" rx="2" fill="none" stroke="#d8efd9" stroke-width="1.6"/><circle cx="48" cy="24" r="11" fill="#d8efd9"/><text x="48" y="30" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="17" fill="#2f6f3f">$</text><text x="13" y="20" font-family="Georgia, serif" font-weight="700" font-size="10" fill="#d8efd9">$</text><text x="76" y="38" font-family="Georgia, serif" font-weight="700" font-size="10" fill="#d8efd9">$</text></svg>' },
  { ratio: 1, svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#f4f4f6" stroke="#8f929c" stroke-width="2"/><circle cx="32" cy="32" r="26" fill="none" stroke="#c9cbd2" stroke-width="3"/><path d="M32 32 29 10l3-4 3 4z" fill="#6b6f7d"/><path d="M32 32 29 10l3-4 3 4z" fill="#6b6f7d" transform="rotate(120 32 32)"/><path d="M32 32 29 10l3-4 3 4z" fill="#6b6f7d" transform="rotate(240 32 32)"/><circle cx="32" cy="32" r="3" fill="#6b6f7d"/></svg>' }
];

function createFallingCoin(index, total) {
  const coin = document.createElement("span");
  const kind = COIN_SVGS[index % COIN_SVGS.length];
  const size = 22 + Math.random() * 14;
  const duration = 9.5 + Math.random() * 7;
  const drift = -110 + Math.random() * 220;
  const spin = 540 + Math.random() * 900;
  const delay = (duration / total) * index + Math.random() * 2;

  coin.className = "falling-coin";
  coin.innerHTML = kind.svg;
  coin.style.left = `${Math.random() * 100}vw`;
  coin.style.width = `${(size * kind.ratio).toFixed(1)}px`;
  coin.style.height = `${size}px`;
  coin.style.setProperty("--fall-duration", `${duration.toFixed(2)}s`);
  coin.style.setProperty("--drift-x", `${drift.toFixed(1)}px`);
  coin.style.setProperty("--drift-mid", `${(drift * 0.38).toFixed(1)}px`);
  coin.style.setProperty("--drift-back", `${(drift * -0.22).toFixed(1)}px`);
  coin.style.setProperty("--spin", `${spin.toFixed(0)}deg`);
  coin.style.setProperty("--fall-delay", `-${delay.toFixed(2)}s`);
  coin.style.setProperty("--petal-opacity", (0.8 + Math.random() * 0.2).toFixed(2));

  return coin;
}

function createSakuraPetal(index, total) {
  const petal = document.createElement("span");
  const size = 26 + Math.random() * 18;
  const duration = 8.5 + Math.random() * 7;
  const drift = -140 + Math.random() * 280;
  const rotation = 1.5 + Math.random() * 3.5;
  const delay = (duration / total) * index + Math.random() * 1.5;

  petal.className = "autumn-leaf";
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.width = `${size}px`;
  petal.style.height = `${size * (0.68 + Math.random() * 0.30)}px`;
  petal.style.setProperty("--fall-duration", `${duration.toFixed(2)}s`);
  petal.style.setProperty("--drift-x", `${drift.toFixed(1)}px`);
  petal.style.setProperty("--drift-mid", `${(drift * 0.38).toFixed(1)}px`);
  petal.style.setProperty("--drift-back", `${(drift * -0.22).toFixed(1)}px`);
  petal.style.setProperty("--rot-1", `${(120 * rotation).toFixed(1)}deg`);
  petal.style.setProperty("--rot-2", `${(240 * rotation).toFixed(1)}deg`);
  petal.style.setProperty("--rot-3", `${(360 * rotation).toFixed(1)}deg`);
  petal.style.setProperty("--fall-delay", `-${delay.toFixed(2)}s`);
  petal.style.setProperty("--petal-opacity", (0.55 + Math.random() * 0.35).toFixed(2));

  return petal;
}

function startOriginalSakuraEffect() {
  const container = document.querySelector(".sakura-falling");
  if (!container) return;

  const count = getSakuraPetalCount();
  const coinCount = Math.max(6, Math.round(count * 0.55));
  const fragment = document.createDocumentFragment();

  container.replaceChildren();

  for (let index = 0; index < count; index += 1) {
    fragment.appendChild(createSakuraPetal(index, count));
  }

  for (let index = 0; index < coinCount; index += 1) {
    fragment.appendChild(createFallingCoin(index, coinCount));
  }

  container.appendChild(fragment);
  container.dataset.sakuraReady = "true";
}

function refreshSakuraDensity() {
  window.clearTimeout(sakuraResizeTimer);
  sakuraResizeTimer = window.setTimeout(startOriginalSakuraEffect, 180);
}

async function playMusic() {
  try {
    await backgroundAudio.play();
  } catch {
    musicPlaying = false;
    updateMusicButton();
  }
}

function updateMusicButton() {
  musicToggle.classList.toggle("is-playing", musicPlaying);
  musicToggle.setAttribute("aria-pressed", String(musicPlaying));
  musicToggle.setAttribute("aria-label", musicPlaying ? "Tắt nhạc" : "Bật nhạc");
  musicToggle.querySelector(".music-toggle__label").textContent = musicPlaying ? "Đang phát" : "Bật nhạc";
}

function toggleMusic() {
  if (!backgroundAudio.paused) {
    backgroundAudio.pause();
  } else {
    playMusic();
  }
}

function applyGuestName() {
  if (!invitationGuestName) return;

  const guestName = guestNameInput?.value.trim().replace(/\s+/g, " ") || "Bạn";
  invitationGuestName.textContent = guestName;
}

function openInvitation() {
  releaseGuestInput();
  applyGuestName();
  gate.classList.add("is-opened");
  document.body.classList.remove("is-locked");
  document.body.classList.add("invitation-open");
  playMusic();
  setupReveal();

  window.setTimeout(() => {
    gate.hidden = true;
  }, 720);
}

function setupReveal() {
  const elements = [...document.querySelectorAll(".reveal")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  elements.forEach((element, index) => {
    if (reducedMotion) {
      element.classList.add("is-visible");
      return;
    }

    window.setTimeout(() => {
      element.classList.add("is-visible");
    }, 70 + (index * 85));
  });
}

openButton.addEventListener("click", openInvitation);
musicToggle.addEventListener("click", toggleMusic);
backgroundAudio.addEventListener("playing", () => {
  musicPlaying = true;
  updateMusicButton();
});
backgroundAudio.addEventListener("pause", () => {
  musicPlaying = false;
  updateMusicButton();
});
backgroundAudio.addEventListener("error", () => {
  musicPlaying = false;
  updateMusicButton();
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || gate.hidden) return;

  event.preventDefault();
  openInvitation();
});

window.addEventListener("resize", refreshSakuraDensity, { passive: true });

applyEventConfig();

const COUNTDOWN_TARGET = new Date("2026-09-19T08:00:00+07:00");
const countdownElements = {
  days: document.getElementById("cd-days"),
  hours: document.getElementById("cd-hours"),
  minutes: document.getElementById("cd-minutes"),
  seconds: document.getElementById("cd-seconds"),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const diff = Math.max(0, COUNTDOWN_TARGET.getTime() - Date.now());
  countdownElements.days.textContent = pad(Math.floor(diff / 86400000));
  countdownElements.hours.textContent = pad(Math.floor(diff / 3600000) % 24);
  countdownElements.minutes.textContent = pad(Math.floor(diff / 60000) % 60);
  countdownElements.seconds.textContent = pad(Math.floor(diff / 1000) % 60);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startOriginalSakuraEffect, { once: true });
} else {
  startOriginalSakuraEffect();
}
