const TRACKS = [
  {
    id: "Sz0ew6pxa6Y",
    title: "Aye Mere Watan Ke Logo",
    artist: "Lata Mangeshkar",
    scene: "Flag just went up. Nobody talks.",
    art: "scene-flag.png",
    mood: { top: "rgba(18, 28, 48, 0.28)", bottom: "rgba(10, 16, 28, 0.58)" },
  },
  {
    id: "VHQ0w-9ITBI",
    title: "I Love My India",
    artist: "Pardes · Kavita Krishnamurthy",
    scene: "Girls in white. Ribbons flying. The dance begins.",
    art: "maidan.png",
    mood: { top: "rgba(20, 12, 6, 0.16)", bottom: "rgba(12, 8, 4, 0.55)" },
  },
  {
    id: "0XhRZd0rgX4",
    title: "Ae Watan",
    artist: "Arijit Singh · Raazi",
    scene: "Principal wipes his glasses. Pretends it is dust.",
    art: "scene-dust.png",
    mood: { top: "rgba(40, 22, 10, 0.22)", bottom: "rgba(28, 12, 6, 0.6)" },
  },
  {
    id: "jDn2bn7_YSM",
    title: "Maa Tujhe Salaam",
    artist: "A.R. Rahman",
    scene: "The village is at the gate. Everyone knows the chorus.",
    art: "scene-village.png",
    mood: { top: "rgba(24, 18, 8, 0.14)", bottom: "rgba(16, 10, 4, 0.52)" },
  },
  {
    id: "wF_B_aagLfI",
    title: "Teri Mitti",
    artist: "B Praak · Kesari",
    scene: "Mothers at the back. Quiet pride. Laddoos waiting.",
    art: "scene-mitti.png",
    mood: { top: "rgba(32, 16, 8, 0.26)", bottom: "rgba(18, 8, 4, 0.62)" },
  },
  {
    id: "1JRIhF3kh_8",
    title: "Mera Rang De Basanti",
    artist: "Sonu Nigam · The Legend of Bhagat Singh",
    scene: "Annual function. Girls dancing. The hall goes quiet.",
    art: "scene-stage.png",
    mood: { top: "rgba(12, 8, 20, 0.35)", bottom: "rgba(8, 4, 12, 0.7)" },
  },
  {
    id: "-5ef7epnR60",
    title: "Mere Desh Ki Dharti",
    artist: "Mahendra Kapoor · Upkar",
    scene: "White shoes. Leftover polish. Left-right-left.",
    art: "scene-parade.png",
    mood: { top: "rgba(22, 28, 16, 0.18)", bottom: "rgba(12, 16, 8, 0.55)" },
  },
  {
    id: "jDdlOoysg4s",
    title: "Aye Mere Pyare Watan",
    artist: "Manna Dey · Kabuliwala",
    scene: "The mic screeches. The paper shakes. Still, they clap.",
    art: "scene-speech.png",
    mood: { top: "rgba(20, 24, 32, 0.22)", bottom: "rgba(10, 12, 18, 0.58)" },
  },
];

const INTRO = {
  art: "intro.jpeg",
  mood: { top: "rgba(8, 4, 16, 0.18)", bottom: "rgba(4, 2, 10, 0.72)" },
};

let index = 0;
let player = null;
let seeking = false;
let usingSlotA = true;
let started = false;

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
  slotA: document.querySelector('[data-slot="a"]'),
  slotB: document.querySelector('[data-slot="b"]'),
  share: document.getElementById("share"),
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

function setSlideArt(slot, src) {
  slot.querySelectorAll("img").forEach((img) => {
    img.src = src;
  });
}

function applyMood(track) {
  const root = document.documentElement;
  root.style.setProperty("--mood-top", track.mood.top);
  root.style.setProperty("--mood-bottom", track.mood.bottom);
}

function crossfadeScene(src, instant, photo) {
  const incoming = usingSlotA ? els.slotB : els.slotA;
  const outgoing = usingSlotA ? els.slotA : els.slotB;

  setSlideArt(incoming, src);
  incoming.classList.toggle("is-photo", Boolean(photo));

  const go = () => {
    incoming.classList.add("is-on");
    outgoing.classList.remove("is-on");
    usingSlotA = !usingSlotA;
  };

  const img = incoming.querySelector(".hero-still");
  if (instant || img.complete) go();
  else img.addEventListener("load", go, { once: true });
}

function renderTrack(instant, { scene = true } = {}) {
  const t = TRACKS[index];
  els.cover.src = coverUrl(t.id);
  els.scene.textContent = t.scene;
  els.title.textContent = t.title;
  els.artist.textContent = t.artist;
  if (!scene) return;
  applyMood(t);
  crossfadeScene(t.art, instant, false);
}

function revealSongScene() {
  if (started) return;
  started = true;
  renderTrack(false, { scene: true });
}

function setPlayingUi(on) {
  els.iconPlay.classList.toggle("hidden", on);
  els.iconPause.classList.toggle("hidden", !on);
  els.cover.classList.toggle("playing", on);
}

function load(i, autoplay) {
  index = (i + TRACKS.length) % TRACKS.length;
  renderTrack(false, { scene: started });
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
        if (e.data === YT.PlayerState.PLAYING) {
          revealSongScene();
          setPlayingUi(true);
        }
        if (e.data === YT.PlayerState.PAUSED) setPlayingUi(false);
      },
    },
  });
};

els.play.addEventListener("click", () => {
  if (!player) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else {
    revealSongScene();
    player.playVideo();
  }
});

els.prev.addEventListener("click", () => load(index - 1, true));
els.next.addEventListener("click", () => load(index + 1, true));

const SHARE_URL = "https://15-august-nostalgia.vercel.app/";
const SHARE_TEXT =
  "before fancy functions. you once stood in the school maidan.\n" +
  SHARE_URL +
  "\n#15August #IndependenceDay #Nostalgia #Tiranga";

els.share.addEventListener("click", async () => {
  const payload = { title: "15 August Nostalgia", text: SHARE_TEXT, url: SHARE_URL };
  try {
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await navigator.clipboard.writeText(SHARE_TEXT);
    const label = els.share.querySelector("span");
    const prev = label.textContent;
    label.textContent = "Copied";
    els.share.classList.add("is-copied");
    setTimeout(() => {
      label.textContent = prev;
      els.share.classList.remove("is-copied");
    }, 1600);
  } catch {
    /* user cancelled share */
  }
});

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

TRACKS.forEach((t) => {
  const img = new Image();
  img.src = t.art;
});
new Image().src = INTRO.art;

tickClock();
fakeCrowd();
applyMood(INTRO);
renderTrack(true, { scene: false });
setInterval(tickClock, 1000);
setInterval(fakeCrowd, 12000);
