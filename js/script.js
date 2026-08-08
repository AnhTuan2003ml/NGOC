/**
 * Thiệp mời tốt nghiệp — Nguyễn Thị Bích Ngọc / NEU
 * --------------------------------------------------
 * Chỉ cần sửa EVENT_CONFIG nếu có lịch lễ chính xác.
 * Nhạc nền dùng YouTube và lặp vô hạn sau khi khách bấm "Mở thiệp mời".
 */

const EVENT_CONFIG = {
  time: "08:15 SÁNG",
  day: "22-08-2026",
  date: "THỨ BẢY, 22-08-2026",
  youtubeVideoId: "jLRQfIxxeU4"
};

const gate = document.getElementById("open-gate");
const openButton = document.getElementById("open-invitation");
const guestNameInput = document.getElementById("guest-name-input");
const invitationGuestName = document.getElementById("invitation-guest-name");
const musicToggle = document.getElementById("music-toggle");
const youtubeAudio = document.getElementById("youtube-audio");

let youtubeIframe = null;
let musicPlaying = false;

function applyEventConfig() {
  document.getElementById("event-time").textContent = EVENT_CONFIG.time;
  document.getElementById("event-day").textContent = EVENT_CONFIG.day;
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

function createSakuraPetal(index, total) {
  const petal = document.createElement("span");
  const size = 8 + Math.random() * 9;
  const duration = 8.5 + Math.random() * 7;
  const drift = -140 + Math.random() * 280;
  const rotation = 1.5 + Math.random() * 3.5;
  const delay = (duration / total) * index + Math.random() * 1.5;

  petal.className = "sakura-petal";
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
  const fragment = document.createDocumentFragment();

  container.replaceChildren();

  for (let index = 0; index < count; index += 1) {
    fragment.appendChild(createSakuraPetal(index, count));
  }

  container.appendChild(fragment);
  container.dataset.sakuraReady = "true";
}

function refreshSakuraDensity() {
  window.clearTimeout(sakuraResizeTimer);
  sakuraResizeTimer = window.setTimeout(startOriginalSakuraEffect, 180);
}

function createYoutubeAudio() {
  if (youtubeIframe) return;

  const id = EVENT_CONFIG.youtubeVideoId;
  const iframe = document.createElement("iframe");
  iframe.title = "Nhạc nền lễ tốt nghiệp";
  iframe.width = "1";
  iframe.height = "1";
  iframe.tabIndex = -1;
  iframe.setAttribute("allow", "autoplay; encrypted-media");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&enablejsapi=1`;

  youtubeAudio.replaceChildren(iframe);
  youtubeIframe = iframe;
  musicPlaying = true;
  updateMusicButton();
}

function sendYoutubeCommand(command) {
  if (!youtubeIframe || !youtubeIframe.contentWindow) return;

  youtubeIframe.contentWindow.postMessage(JSON.stringify({
    event: "command",
    func: command,
    args: []
  }), "*");
}

function updateMusicButton() {
  musicToggle.classList.toggle("is-playing", musicPlaying);
  musicToggle.setAttribute("aria-pressed", String(musicPlaying));
  musicToggle.setAttribute("aria-label", musicPlaying ? "Tắt nhạc" : "Bật nhạc");
  musicToggle.querySelector(".music-toggle__label").textContent = musicPlaying ? "Đang phát" : "Bật nhạc";
}

function toggleMusic() {
  if (!youtubeIframe) {
    createYoutubeAudio();
    return;
  }

  if (musicPlaying) {
    sendYoutubeCommand("pauseVideo");
    musicPlaying = false;
  } else {
    sendYoutubeCommand("playVideo");
    musicPlaying = true;
  }

  updateMusicButton();
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
  createYoutubeAudio();
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

window.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || gate.hidden) return;

  event.preventDefault();
  openInvitation();
});

window.addEventListener("resize", refreshSakuraDensity, { passive: true });

applyEventConfig();

const COUNTDOWN_TARGET = new Date(2026, 7, 22, 8, 15, 0);
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
