/**
 * Thiệp mời tốt nghiệp — Nguyễn Thị Bích Ngọc / NEU
 * --------------------------------------------------
 * Chỉ cần sửa EVENT_CONFIG nếu có lịch lễ chính xác.
 * Nhạc nền dùng YouTube và lặp vô hạn sau khi khách bấm "Mở thiệp mời".
 */

const EVENT_CONFIG = {
  time: "ĐANG CẬP NHẬT",
  day: "LỊCH LỄ TỐT NGHIỆP",
  date: "NĂM 2026",
  youtubeVideoId: "jLRQfIxxeU4"
};

const gate = document.getElementById("open-gate");
const openButton = document.getElementById("open-invitation");
const musicToggle = document.getElementById("music-toggle");
const youtubeAudio = document.getElementById("youtube-audio");

let youtubeIframe = null;
let musicPlaying = false;

function applyEventConfig() {
  document.getElementById("event-time").textContent = EVENT_CONFIG.time;
  document.getElementById("event-day").textContent = EVENT_CONFIG.day;
  document.getElementById("event-date").textContent = EVENT_CONFIG.date;
}

function startOriginalSakuraEffect() {
  if (window.jQuery && typeof window.jQuery.fn.sakura === "function") {
    window.jQuery(".sakura-falling").sakura();
  }
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

function openInvitation() {
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
  if (event.key === "Enter" && !gate.hidden) openInvitation();
});

applyEventConfig();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startOriginalSakuraEffect, { once: true });
} else {
  startOriginalSakuraEffect();
}
