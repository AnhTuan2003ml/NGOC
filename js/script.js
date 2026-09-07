/**
 * Thiệp mời tốt nghiệp — Nguyễn Ngọc Duy / FTU
 * --------------------------------------------------
 * Chỉ cần sửa EVENT_CONFIG nếu có lịch lễ chính xác.
 * Nhạc MP3 lặp lại sau khi khách bấm "Mở thiệp mời".
 * Hiệu ứng nền: lá thu vàng + đồng coin rơi (COIN_SVGS).
 */

const EVENT_CONFIG = {
  time: "8:00 – 10:00 AM",
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

let sakuraResizeTimer = null;

function getSakuraPetalCount() {
  const width = window.innerWidth;

  if (width >= 1440) return 42;
  if (width >= 1024) return 34;
  if (width >= 768) return 26;
  return 18;
}

/* Đồng coin rơi cùng lá — 3 kiểu: vàng (B), bạc (kim cương), xanh (T). */
const COIN_SVGS = [
  '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#e2b13c" stroke="#a8741a" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#fff0a0" stroke-width="2" opacity=".85"/><text x="32" y="44" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="33" fill="#7a5210">B</text><path d="M28.5 13v5M35.5 13v5M28.5 46v5M35.5 46v5" stroke="#7a5210" stroke-width="3" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#d7d9df" stroke="#8f929c" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#fff" stroke-width="2" opacity=".85"/><path d="M32 13l12.5 20L32 40.5 19.5 33z" fill="#6b6f7d"/><path d="M32 44.5l12.5-8L32 52l-12.5-15.5z" fill="#8f929c"/></svg>',
  '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#3ba17b" stroke="#23744f" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#c9f1de" stroke-width="2" opacity=".8"/><path d="M19 18h26v8h-9v4.5c7 .5 11.5 2 11.5 3.6S43 37.3 36 37.8V48h-8V37.8c-7-.5-11.5-2-11.5-3.7S21 30.9 28 30.5V26h-9z" fill="#fff"/></svg>'
];

function createFallingCoin(index, total) {
  const coin = document.createElement("span");
  const size = 22 + Math.random() * 14;
  const duration = 9.5 + Math.random() * 7;
  const drift = -110 + Math.random() * 220;
  const spin = 540 + Math.random() * 900;
  const delay = (duration / total) * index + Math.random() * 2;

  coin.className = "falling-coin";
  coin.innerHTML = COIN_SVGS[index % COIN_SVGS.length];
  coin.style.left = `${Math.random() * 100}vw`;
  coin.style.width = `${size}px`;
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
  const coinCount = Math.max(6, Math.round(count * 0.4));
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
