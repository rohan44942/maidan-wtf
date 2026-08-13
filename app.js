const TRACKS = [
  {
    id: "Sz0ew6pxa6Y",
    title: "Aye Mere Watan Ke Logo",
    artist: "Lata Mangeshkar",
    scene: "Flag just went up. Nobody talks.",
  },
  {
    id: "VHQ0w-9ITBI",
    title: "I Love My India",
    artist: "Pardes · Kavita Krishnamurthy",
    scene: "Girls in white. Ribbons flying. The dance begins.",
  },
  {
    id: "0XhRZd0rgX4",
    title: "Ae Watan",
    artist: "Arijit Singh · Raazi",
    scene: "Principal wipes his glasses. Pretends it is dust.",
  },
  {
    id: "jDn2bn7_YSM",
    title: "Maa Tujhe Salaam",
    artist: "A.R. Rahman",
    scene: "The village is at the gate. Everyone knows the chorus.",
  },
  {
    id: "wF_B_aagLfI",
    title: "Teri Mitti",
    artist: "B Praak · Kesari",
    scene: "Mothers at the back. Quiet pride. Laddoos waiting.",
  },
];

let index = 0;
let player = null;
let seeking = false;

const els = {
  clock: document.getElementById("clock"),
  online: document.getElementById("online-count"),
  cover: document.getElementById("cover"),
  scene: document.getElementById("scene"),
  title: document.getElementById("track-title"),
  artist: document.getElementById("track-artist"),
  seek: document.getElementById("seek"),
  play: document.getElementById("play"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  iconPlay: document.getElementById("icon-play"),
  iconPause: document.getElementById("icon-pause"),
};

function tickClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  els.clock.innerHTML = `${h}<span class="blink">:</span>${m}<span class="ampm">${ampm}</span>`;
}

function fakeCrowd() {
  els.online.textContent = String(180 + Math.floor(Math.random() * 90));
}

function coverUrl(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function renderTrack() {
  const t = TRACKS[index];
  els.cover.src = coverUrl(t.id);
  els.scene.textContent = t.scene;
  els.title.textContent = t.title;
  els.artist.textContent = t.artist;
}

function setPlayingUi(on) {
  els.iconPlay.classList.toggle("hidden", on);
  els.iconPause.classList.toggle("hidden", !on);
  els.cover.classList.toggle("playing", on);
}

function load(i, autoplay) {
  index = (i + TRACKS.length) % TRACKS.length;
  renderTrack();
  els.seek.value = 0;
  if (!player) return;
  player.loadVideoById(TRACKS[index].id);
  if (!autoplay) player.pauseVideo();
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("yt", {
    height: "1",
    width: "1",
    videoId: TRACKS[0].id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: location.origin,
    },
    events: {
      onStateChange(e) {
        if (e.data === YT.PlayerState.ENDED) load(index + 1, true);
        if (e.data === YT.PlayerState.PLAYING) setPlayingUi(true);
        if (e.data === YT.PlayerState.PAUSED) setPlayingUi(false);
      },
    },
  });
};

els.play.addEventListener("click", () => {
  if (!player) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
});

els.prev.addEventListener("click", () => load(index - 1, true));
els.next.addEventListener("click", () => load(index + 1, true));

els.seek.addEventListener("pointerdown", () => {
  seeking = true;
});
els.seek.addEventListener("pointerup", () => {
  seeking = false;
  if (!player || !player.getDuration) return;
  const dur = player.getDuration() || 0;
  player.seekTo((Number(els.seek.value) / 100) * dur, true);
});

setInterval(() => {
  if (!player || seeking || typeof player.getCurrentTime !== "function") return;
  const dur = player.getDuration();
  if (!dur) return;
  els.seek.value = (player.getCurrentTime() / dur) * 100;
}, 400);

tickClock();
fakeCrowd();
renderTrack();
setInterval(tickClock, 1000);
setInterval(fakeCrowd, 12000);
