/* ─────────────────────────────────────
   Events data — data-driven, scalable
   Supports 12 fixed + custom events.
   Only the rendered count changes, not
   the architecture.
───────────────────────────────────── */
const MAP_URL = "https://maps.app.goo.gl/kssXPyTuTPUazfYu7";

const EVENTS = [
  {
    id: "mehendi",
    icon: "assets/event/pn-evt-ico-mehendi-x-v01.webp",
    name: "Mehendi",
    date: "01 Dec 2026", time: "3:00 PM",
    venue: "Banquet Lawns",
    note: "henna, hues, and laughter",
    map: MAP_URL
  },
  
  {
    id: "sangeet",
    icon: "assets/event/pn-evt-ico-sangeet-x-v01.webp",
    name: "Sangeet",
    date: "01 Dec 2026", time: "6:00 PM",
    venue: "Banquet Lawns",
    note: "An evening of music and performances",
    map: MAP_URL
  },

  {
    id: "haldi",
    icon: "assets/event/pn-evt-ico-haldi-x-v01.webp",
    name: "Haldi",
    date: "02 Dec 2026", time: "10:00 AM",
    venue: "Lakeside Courtyard",
    note: "A sun-soaked morning with traditional turmeric blessings",
    map: MAP_URL
  },

  {
    id: "shaadi",
    icon: "assets/event/pn-evt-ico-shaadi-x-v01.webp",
    name: "Baarat Aagman",
    date: "02 Dec 2026", time: "7:00 PM",
    venue: "Outdoor Courtyard",
    note: "A grand, musical welcome for the groom",
    map: MAP_URL
  },

    {
    id: "reception",
    icon: "assets/event/pn-evt-ico-reception-x-v01.webp",
    name: "Preeti Bhoj",
    date: "02 Dec 2026", time: "7:00 PM",
    venue: "Banquet Lawns",
    note: "Candlelit dinner and celebration",
    map: MAP_URL
  },

  {
    id: "wedding",
    icon: "assets/event/mandap.webp",
    name: "Shubh <br> Vivaah",
    date: "02 Dec 2026", time: "11:00 PM",
    venue: "Wedding Hall",
    note: "Auspicious gathering for the pheras",
    map: MAP_URL
  }
];

/* ─────────────────────────────────────
   Config — asset paths
───────────────────────────────────── */
const A = {
  darkBg:      "assets/hero/pn-hro-bg-courtyard-dark-m-v03.webp",
  litBg:       "assets/hero/pn-hro-bg-courtyard-lit-m-v03.webp",
  darkBgDesktop: "assets/hero/pn-hro-bg-courtyard-dark-D-v03.webp",
  litBgDesktop:  "assets/hero/pn-hro-bg-courtyard-lit-d-v03.webp",
  rope:        "assets/hero/pn-hro-el-rope-hemp-pull-x-v01.webp",
  lotusClosed: "assets/hero/pn-rvl-btn-lotus-closed-x-v01.webp",
  lotusOpen:   "assets/hero/pn-rvl-btn-lotus-open-x-v01.webp",
  lotusGlow:   "assets/hero/pn-fx-ovl-lotus-glow-burst-x-v01.webp",
  jhoomer:     "assets/shared/pn-shr-mot-jhoomer-hanging-x-v01.webp",
  floralBush:  "assets/hero/pn-shr-mot-floral-bush-cluster-x-v01.webp",
  diya:        "assets/hero/pn-shr-mot-diya-glow-x-v01.webp"
};
const PULL_THRESHOLD = Math.min(112, Math.max(84, Math.round(window.innerHeight * 0.11)));

function getHeroBackgrounds() {
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  return {
    dark: desktop ? A.darkBgDesktop : A.darkBg,
    lit:  desktop ? A.litBgDesktop  : A.litBg
  };
}

/* ─────────────────────────────────────
   Sound — Web Audio API synthesised tones
   No audio files needed. Pure harmonics.
───────────────────────────────────── */
const Sound = {
  _ctx: null,

  get ctx() {
    if (!this._ctx) {
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {}
    }
    return this._ctx;
  },

  _play(fn) {
    if (rmq) return;
    try {
      const c = this.ctx;
      if (!c) return;
      if (c.state === "suspended") {
        c.resume().then(fn).catch(() => {});
      } else {
        fn();
      }
    } catch (_) {}
  },

  /* Soft temple bell — layered harmonic sines, played on rope pull */
  bell() {
    this._play(() => {
      const c = this.ctx;
      const now = c.currentTime;
      // Three harmonic partials: fundamental + octave + fifth
      [[528, 0.30, 2.0], [1056, 0.14, 1.4], [792, 0.10, 1.7]].forEach(([freq, vol, dur]) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.start(now);
        osc.stop(now + dur + 0.05);
      });
    });
  },

  /* Ambient shimmer — lamps igniting; played when lights come on */
  ambient() {
    this._play(() => {
      const c = this.ctx;
      const now = c.currentTime;
      // Four low harmonic tones that swell and fade
      [[220, 0.055, 4.0], [330, 0.040, 3.5], [440, 0.048, 4.8], [660, 0.028, 3.2]].forEach(([f, v, d], i) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        osc.frequency.value = f;
        const start = now + i * 0.18;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(v, start + 0.55);
        g.gain.exponentialRampToValueAtTime(0.0001, start + d);
        osc.start(start);
        osc.stop(start + d + 0.1);
      });
    });
  },

  /* Lotus bloom tone — rising harmonic, gentle opening; played on lotus tap */
  lotus() {
    this._play(() => {
      const c = this.ctx;
      const now = c.currentTime;
      // Rising arpeggio: three notes bloom outward
      [[396, 0.20, 1.6], [528, 0.15, 1.4], [792, 0.09, 1.1]].forEach(([f, v, d], i) => {
        const osc = c.createOscillator();
        const g   = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        const start = now + i * 0.10;
        // Each note rises slightly from below pitch for a "blooming" feel
        osc.frequency.setValueAtTime(f * 0.88, start);
        osc.frequency.exponentialRampToValueAtTime(f, start + 0.28);
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(v, start + 0.18);
        g.gain.exponentialRampToValueAtTime(0.0001, start + d);
        osc.start(start);
        osc.stop(start + d + 0.1);
      });
    });
  },

  init() {} /* kept for API compatibility */
};

/* ─────────────────────────────────────
   DOM refs
───────────────────────────────────── */
const introEl      = document.getElementById("intro");
const ropeButton   = document.getElementById("ropeButton");
const ropeImg      = document.getElementById("ropeImg");
const ropeHalo     = ropeButton.querySelector(".rope-halo");
const pullFeedback = document.getElementById("pullFeedback");
const lotusButton  = document.getElementById("lotusButton");
const lotusIconImg = document.getElementById("lotusIconImg");
const lotusGlow    = document.getElementById("lotusGlowBurst");
const skipBtn      = document.getElementById("skipIntro");
const floatingMenu = document.getElementById("floatingMenu");
const menuToggle   = document.getElementById("menuToggle");
const bgMusic      = document.getElementById("bgMusic");
const musicToggle  = document.getElementById("musicToggle");

const rmq = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Background music helpers ── */
/* One-time "Tap here to mute" bubble the first time music starts */
let _musicHintShown = false;
function showMusicHint() {
  _musicHintShown = true;
  setTimeout(() => {
    musicToggle.classList.add("show-hint");
    setTimeout(() => musicToggle.classList.remove("show-hint"), 6000);
  }, 1200);
}

function setBgMusicState(playing) {
  if (playing && !_musicHintShown) showMusicHint();
  musicToggle.classList.toggle("is-playing", playing);
  musicToggle.setAttribute("aria-pressed", playing ? "true" : "false");
  musicToggle.setAttribute("aria-label",   playing ? "Pause music" : "Play music");
}

function syncBgMusicState() {
  setBgMusicState(!bgMusic.paused && !bgMusic.ended);
}

function playBgMusic() {
  bgMusic.muted = false;
  bgMusic.volume = 1;
  return bgMusic.play().then(syncBgMusicState);
}

function pauseBgMusic() {
  bgMusic.pause();
  syncBgMusicState();
}

musicToggle.addEventListener("click", e => {
  e.stopPropagation();
  musicToggle.classList.remove("show-hint");
  if (bgMusic.paused) {
    playBgMusic().catch(syncBgMusicState);
  } else {
    pauseBgMusic();
  }
});

["play", "playing", "pause", "ended", "emptied", "error"].forEach(evt => {
  bgMusic.addEventListener(evt, syncBgMusicState);
});

let _musicRetries = 0;
bgMusic.addEventListener('error', () => {
  const err = bgMusic.error;
  if (err && err.code === MediaError.MEDIA_ERR_NETWORK && _musicRetries < 2) {
    _musicRetries++;
    setTimeout(() => { bgMusic.load(); playBgMusic().catch(() => {}); }, 4000);
  }
});

/* ─────────────────────────────────────
   Build gold dust
───────────────────────────────────── */
function buildDust() {
  const el = document.getElementById("introDust");
  for (let i = 0; i < 32; i++) {
    const d = document.createElement("div");
    d.className = "dust-particle";
    const s = 1 + Math.random() * 2.8;
    const l = 22 + Math.random() * 56;
    const b = 8 + Math.random() * 60;
    const dur = 7 + Math.random() * 10;
    const del = Math.random() * 8;
    d.style.cssText = `width:${s}px;height:${s}px;left:${l}%;bottom:${b}%;animation-duration:${dur}s;animation-delay:${del}s`;
    el.appendChild(d);
  }
}

/* ─────────────────────────────────────
   Build petals
───────────────────────────────────── */
function buildPetals() {
  const el = document.getElementById("introPetals");
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    const l   = 6 + Math.random() * 88;
    const b   = Math.random() * 18;
    const dur = 10 + Math.random() * 14;
    const del = Math.random() * 10;
    const sz  = 5 + Math.random() * 7;
    p.style.cssText = `left:${l}%;bottom:${b}%;width:${sz}px;height:${sz*.62}px;animation-duration:${dur}s;animation-delay:${del}s`;
    el.appendChild(p);
  }
}

/* ─────────────────────────────────────
   Rope resistance curve
───────────────────────────────────── */
function resist(raw) {
  const easy = PULL_THRESHOLD * .38;
  const firm = PULL_THRESHOLD * .82;
  if (raw <= easy) return raw * .92;
  if (raw <= firm) return easy * .92 + (raw - easy) * .58;
  return easy * .92 + (firm - easy) * .58 + (raw - firm) * .30;
}

/* ─────────────────────────────────────
   Multi-layer parallax
   Each layer has a different depth multiplier.
   bg (farthest) → florals (closest)
───────────────────────────────────── */
let pxFrame = 0;
let currentNx = 0, currentNy = 0;

function setParallax(nx, ny) {
  currentNx = nx; currentNy = ny;
  const el = introEl;
  /* Background — far, slow */
  el.style.setProperty("--px-bg-x",  `${(-nx * 13).toFixed(2)}px`);
  el.style.setProperty("--px-bg-y",  `${(-ny * 8).toFixed(2)}px`);
  /* Jhoomer — ceiling lamp, moderate */
  el.style.setProperty("--px-jhm-x", `${(nx * 22).toFixed(2)}px`);
  el.style.setProperty("--px-jhm-y", `${(ny * 14).toFixed(2)}px`);
  /* Florals — foreground, fast */
  el.style.setProperty("--px-flr-x", `${(nx * 52).toFixed(2)}px`);
  el.style.setProperty("--px-flr-y", `${(ny * 34).toFixed(2)}px`);
  /* Diyas — mid-ground floor */
  el.style.setProperty("--px-dya-x", `${(nx * 30).toFixed(2)}px`);
  el.style.setProperty("--px-dya-y", `${(ny * 19).toFixed(2)}px`);
}

function queueParallax(nx, ny) {
  if (rmq || introEl.classList.contains("is-complete")) return;
  if (pxFrame) cancelAnimationFrame(pxFrame);
  pxFrame = requestAnimationFrame(() => { setParallax(nx, ny); pxFrame = 0; });
}

/* ─────────────────────────────────────
   Device orientation (gyroscope) — mobile parallax
───────────────────────────────────── */
let gyroEnabled = false;
function enableGyro() {
  if (gyroEnabled || rmq) return;
  gyroEnabled = true;
  window.addEventListener("deviceorientation", e => {
    if (introEl.classList.contains("is-complete") || isDragging) return;
    /* gamma = left/right tilt (-90 to 90), beta = forward/back (0 to 180) */
    const nx = Math.max(-1, Math.min(1, (e.gamma || 0) / 18));
    /* Portrait mode: subtract 45° (typical hold angle) */
    const ny = Math.max(-1, Math.min(1, ((e.beta  || 0) - 45) / 22));
    queueParallax(nx, ny);
  }, { passive: true });
}

/* Request permission on iOS 13+ */
if (typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function") {
  /* iOS — request on first touch */
  document.addEventListener("touchstart", () => {
    DeviceOrientationEvent.requestPermission()
      .then(r => { if (r === "granted") enableGyro(); })
      .catch(() => {});
  }, { once: true });
} else {
  /* Android / non-iOS — no permission needed */
  window.addEventListener("load", () => {
    if ("DeviceOrientationEvent" in window) enableGyro();
  });
}

/* ─────────────────────────────────────
   Pointer parallax (desktop)
───────────────────────────────────── */
if (!rmq) {
  introEl.addEventListener("pointermove", e => {
    if (isDragging || gyroEnabled) return;
    const r = introEl.getBoundingClientRect();
    queueParallax(
      Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width  - .5) * 2)),
      Math.max(-1, Math.min(1, ((e.clientY - r.top)  / r.height - .5) * 2))
    );
  }, { passive: true });
  introEl.addEventListener("pointerleave", () => queueParallax(0, 0), { passive: true });
}

/* ─────────────────────────────────────
   Hydrate — wire assets into DOM
───────────────────────────────────── */
function hydrate() {
  const heroBg = getHeroBackgrounds();
  document.getElementById("introBgDark").src    = heroBg.dark;
  document.getElementById("introBgLit").src     = heroBg.lit;
  // document.getElementById("introJhoomer").src   = A.jhoomer;
  document.getElementById("introFloralLeft").src  = A.floralBush;
  document.getElementById("introFloralRight").src = A.floralBush;
  document.getElementById("introDiyaLeft").src  = A.diya;
  document.getElementById("introDiyaRight").src = A.diya;
  ropeImg.src        = A.rope;
  lotusIconImg.src   = A.lotusClosed;
  lotusGlow.src      = A.lotusGlow;
  const lotusOpenImg = document.getElementById("lotusOpenImg");
  if (lotusOpenImg) {
    lotusOpenImg.src = A.lotusOpen;
    new Image().src  = A.lotusOpen; /* preload */
  }

  /* Preload lit bg */
  new Image().src = heroBg.lit;

  buildDust();
  buildPetals();
  applyGrandparentsMode();
  renderEvents();
  renderStars();
  renderBirds();
  initEvtParallax();
  renderGallery();
  renderTTK();

  setTimeout(() => { if (!triggered) introEl.classList.add("is-waiting"); }, 1100);
  setTimeout(() => { if (!triggered) ropeButton.classList.add("rope-ready", "rope-idle"); }, 1900);
}

/* ─────────────────────────────────────
   Farman observer — drives the 3-phase
   scroll animation per royal scroll card
───────────────────────────────────── */

/* Scroll-lock: first farman, first visit in session only.
   Uses body position:fixed to freeze the page without snap-back jitter.
   On repeat visits the lock is skipped so returning guests aren't surprised. */
let farmanScrollLocked = false;
let farmanLockScrollTop = 0;
const FARMAN_SESSION_KEY = "pn-farman-seen";

function engageFarmanLock() {
  if (farmanScrollLocked || rmq) return;
  try { if (sessionStorage.getItem(FARMAN_SESSION_KEY)) return; } catch (_) {}
  farmanScrollLocked = true;
  farmanLockScrollTop = window.scrollY;
  /* Freeze page at current position — no rubber-band snap-back */
  document.body.style.position   = 'fixed';
  document.body.style.top        = `-${farmanLockScrollTop}px`;
  document.body.style.width      = '100%';
  document.body.style.overflowY  = 'scroll';
}

function releaseFarmanLockAndMark() {
  if (!farmanScrollLocked) return;
  farmanScrollLocked = false;
  document.body.style.position  = '';
  document.body.style.top       = '';
  document.body.style.width     = '';
  document.body.style.overflowY = '';
  window.scrollTo({ top: farmanLockScrollTop, behavior: 'instant' });
  try { sessionStorage.setItem(FARMAN_SESSION_KEY, "1"); } catch (_) {}
}
function releaseFarmanLock() { releaseFarmanLockAndMark(); }

let firstFarmanSeen = false;

/* Spawn floating gold dust particles inside an open farman */
function spawnFarmanDust(farmanEl) {
  const layer = farmanEl.querySelector(".farman-dust-layer");
  if (!layer || rmq) return;
  /* Fewer particles on mobile — reduces JS workload during animation */
  const count = window.matchMedia("(min-width: 768px)").matches ? 14 : 8;
  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "farman-dust-dot";
    const sz = 2 + Math.random() * 3.5;
    d.style.cssText = [
      `width:${sz}px`, `height:${sz}px`,
      `left:${15 + Math.random() * 70}%`,
      `bottom:${10 + Math.random() * 55}%`,
      `--dur:${3.5 + Math.random() * 3}s`,
      `--del:${Math.random() * 4}s`,
      `--dx:${(Math.random() - .5) * 18}px`
    ].join(";");
    layer.appendChild(d);
  }
}

const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

/* Desktop only: open all events beyond the 3rd simultaneously once event 3 is open */
function openRemainingFarmans() {
  const container = document.getElementById("evtStops");
  if (!container) return;
  container.querySelectorAll(".farman-stop").forEach(el => {
    const idx = parseInt(el.dataset.farmanIndex ?? "0", 10);
    if (idx < 3 || el.classList.contains("is-open")) return;
    farmanObserver.unobserve(el);
    const stagger = (idx - 3) * 220;
    setTimeout(() => {
      el.classList.add("is-entering", "is-unrolling", "is-open");
      spawnFarmanDust(el);
    }, stagger);
  });
}

const farmanObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    farmanObserver.unobserve(el);

    const idx = parseInt(el.dataset.farmanIndex ?? "0", 10);

    /* Desktop: events 4+ open via openRemainingFarmans — if observer fires for them
       (user scrolled past), snap open instantly to avoid double-triggering animation */
    if (isDesktop() && idx >= 3) {
      el.classList.add("is-entering", "is-unrolling", "is-open");
      spawnFarmanDust(el);
      return;
    }

    const skipAnim = rmq || idx >= 4;

    if (skipAnim) {
      el.classList.add("is-entering", "is-unrolling", "is-open");
      spawnFarmanDust(el);
      return;
    }

    const isFirst = !firstFarmanSeen;
    if (isFirst) firstFarmanSeen = true;

    /* Phase 1 — rolled scroll rises and floats gently (~900ms) */
    el.classList.add("is-entering");

    // Scroll lock removed — position:fixed on body triggers pull-to-refresh on mobile

    /* Phase 2 — begin unrolling; brief pause so rolled scroll is seen */
    setTimeout(() => el.classList.add("is-unrolling"), 620);

    /* Phase 3 — is-open fires when clip-path transition ends (860ms + 60ms delay)
       Content fades in during is-unrolling so there is no blank gap */
    const openWrap = el.querySelector(".farman-open-wrap");

    function onUnrollEnd(ev) {
      if (ev && ev.propertyName !== "clip-path") return;
      openWrap.removeEventListener("transitionend", onUnrollEnd);
      el.classList.add("is-open");
      spawnFarmanDust(el);
      /* Desktop: trigger events 4+ the moment event 3 fully opens */
      if (isDesktop() && idx === 2 && EVENTS.length > 3) openRemainingFarmans();
    }

    openWrap.addEventListener("transitionend", onUnrollEnd);

    /* Safety fallback — covers 620ms phase2 delay + 860ms transition + 60ms CSS delay */
    setTimeout(() => {
      if (!el.classList.contains("is-open")) {
        openWrap.removeEventListener("transitionend", onUnrollEnd);
        el.classList.add("is-open");
        spawnFarmanDust(el);
        if (isDesktop() && idx === 2 && EVENTS.length > 3) openRemainingFarmans();
      }
    }, 1800);
  });
}, { threshold: 0.12, rootMargin: "0px 0px 0% 0px" });

/* ─────────────────────────────────────
   Render events section — Farman design
   Each ceremony gets its own royal scroll
───────────────────────────────────── */
function renderEvents() {
  const container = document.getElementById("evtStops");
  if (!container) return;

  /* Ornamental gold divider between farmans */
  const INTER_SVG = `<svg width="88" height="18" viewBox="0 0 88 18" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="fgl" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stop-color="rgba(216,169,87,0)"/>
        <stop offset="100%" stop-color="rgba(216,169,87,.48)"/>
      </linearGradient>
      <linearGradient id="fgr" x1="56" y1="0" x2="88" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stop-color="rgba(216,169,87,.48)"/>
        <stop offset="100%" stop-color="rgba(216,169,87,0)"/>
      </linearGradient>
    </defs>
    <line x1="0"  y1="9" x2="32" y2="9" stroke="url(#fgl)" stroke-width="1"/>
    <circle cx="37" cy="9" r="1.8" fill="rgba(216,169,87,.38)"/>
    <circle cx="44" cy="9" r="3.2" fill="rgba(216,169,87,.58)"/>
    <circle cx="51" cy="9" r="1.8" fill="rgba(216,169,87,.38)"/>
    <line x1="56" y1="9" x2="88" y2="9" stroke="url(#fgr)" stroke-width="1"/>
  </svg>`;

  /* Lotus divider inserted at the midpoint of the farman list */
  const LOTUS_AFTER_INDEX = Math.floor((EVENTS.length - 1) / 2);

  /* Map SVG pin — keeps the premium feel, no emoji */
  const MAP_PIN_SVG = `<svg width="11" height="14" viewBox="0 0 11 14" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;margin-right:4px">
    <path d="M5.5 0C2.46 0 0 2.46 0 5.5c0 4.12 5.5 8.5 5.5 8.5S11 9.62 11 5.5C11 2.46 8.54 0 5.5 0Z"
          fill="currentColor" opacity=".72"/>
    <circle cx="5.5" cy="5.5" r="2" fill="#fff" opacity=".88"/>
  </svg>`;

  EVENTS.forEach((evt, i) => {
    const noteHtml = evt.note
      ? `<p class="farman-note">${evt.note}</p>` : "";
    const mapHtml  = evt.map
      ? `<a class="farman-map" href="${evt.map}" target="_blank"
            rel="noreferrer" aria-label="Open ${evt.venue} on Google Maps">
           ${MAP_PIN_SVG}Open in Maps</a>` : "";

    const article = document.createElement("article");

    /* Alternate left / right alignment; mark main event */
    const isMain   = evt.id === "shaadi";
    const side     = i % 2 === 0 ? "farman-left" : "farman-right";
    article.className = `farman-stop ${side}${isMain ? " farman-stop--main" : ""}`;
    article.setAttribute("role", "listitem");
    article.setAttribute("data-event", evt.id);
    article.setAttribute("data-farman-index", i);

    article.innerHTML = `
      <div class="farman-rolled-wrap" aria-hidden="true">
        <img class="farman-rolled-img"
             src="assets/event/pn-evt-farman-rolled-x-v01.webp"
             alt="" draggable="false" decoding="async">
      </div>
      <div class="farman-open-wrap">
        <img class="farman-parchment-img"
             src="assets/event/pn-evt-farman-open-x-v01.webp"
             alt="" aria-hidden="true" draggable="false" decoding="async">
        <div class="farman-dust-layer" aria-hidden="true"></div>
        <div class="farman-content" aria-label="${evt.name} ceremony details">
          <img class="farman-motif"
               src="${evt.icon}" alt="${evt.name} motif" decoding="async">
          <h3 class="farman-name">${evt.name}</h3>
          <div class="farman-rule" aria-hidden="true"></div>
          <p class="farman-datetime">${evt.date} &middot; ${evt.time}</p>
          <p class="farman-venue">${evt.venue}</p>
          ${noteHtml}${mapHtml}${evt.map ? `<div class="farman-map-rule" aria-hidden="true"></div>` : ""}
        </div>
      </div>`.trim();

    container.appendChild(article);
    farmanObserver.observe(article);

    /* Divider between scrolls */
    if (i < EVENTS.length - 1) {
      const inter = document.createElement("div");

      if (i === LOTUS_AFTER_INDEX) {
        /* Lotus motif at midpoint — visual breath between ceremonies */
        inter.className = "farman-inter farman-inter--lotus";
        inter.setAttribute("aria-hidden", "true");
        inter.innerHTML = `<img src="assets/invite/pn-inv-div-lotus-divider-x-v01.webp"
             alt="" decoding="async" loading="lazy">`;
      } else {
        /* Standard gold diamond ornament */
        inter.className = "farman-inter";
        inter.setAttribute("aria-hidden", "true");
        inter.innerHTML = INTER_SVG;
      }

      container.appendChild(inter);
      observer.observe(inter);
    }
  });
}

/* ─────────────────────────────────────
   Events parallax — peacock & elephant
   drift upward slowly as you scroll
   through the section
───────────────────────────────────── */
function initEvtParallax() {
  const section  = document.getElementById("events");
  const peacock  = document.getElementById("evtPeacock");
  const elephant = document.getElementById("evtElephant");
  if (!section || !peacock || !elephant || rmq) return;

  /* Peacock/elephant now sit mid-section with CSS drift animations.
     Scroll parallax is kept subtle (18px max) so it adds depth without
     fighting the animation transform. */
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect  = section.getBoundingClientRect();
      const h     = section.offsetHeight;
      const p     = Math.max(0, Math.min(1, -rect.top / h));
      const shift = (p * 18).toFixed(1);
      peacock.style.transform  = `translateY(-${shift}px)`;
      elephant.style.transform = `scaleX(-1) translateY(-${shift}px)`;
      ticking = false;
    });
  }, { passive: true });
}

/* ─────────────────────────────────────
   Starfield — open night sky canvas
   Stars are weighted to the upper half
   of the section (the "sky" area above
   the farmans). Pauses automatically
   when section is off-screen.
───────────────────────────────────── */
function renderStars() {
  const canvas  = document.getElementById("evtStars");
  const section = document.getElementById("events");
  if (!canvas || !section) return;

  const ctx = canvas.getContext("2d");
  let raf = null, active = false;

  function resize() {
    canvas.width  = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* Build star data once */
  const mobile = window.innerWidth < 768;
  const COUNT  = mobile ? 80 : 150;

  const stars = Array.from({ length: COUNT }, () => {
    /* 68 % of stars in the upper 55 % — the open sky zone */
    const inSky = Math.random() < 0.68;
    return {
      x:     Math.random(),
      y:     inSky ? Math.random() * 0.55 : 0.55 + Math.random() * 0.30,
      r:     0.45 + Math.random() * 1.55,         /* 0.45 – 2 px radius */
      base:  0.22 + Math.random() * 0.62,         /* resting brightness */
      spd:   0.18 + Math.random() * 0.65,         /* twinkle speed (slow) */
      phase: Math.random() * 6.2832,
      warm:  Math.random() > 0.52,                /* warm ivory vs cool blue-white */
    };
  });

  function draw(ms) {
    if (!active) return;
    const t = ms * 0.001;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      /* Gentle sine-wave twinkle */
      const pulse = 0.30 + 0.70 * (Math.sin(t * s.spd + s.phase) * 0.5 + 0.5);
      const alpha = s.base * pulse;
      const sx = s.x * W, sy = s.y * H;

      /* Star dot */
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, 6.2832);
      ctx.fillStyle = s.warm
        ? `rgba(255,238,205,${alpha})`   /* warm ivory-gold */
        : `rgba(215,228,255,${alpha})`;  /* cool blue-white */
      ctx.fill();

      /* Soft glow halo on larger stars only */
      if (s.r > 1.15) {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 4.5);
        g.addColorStop(0, s.warm
          ? `rgba(255,232,170,${alpha * 0.26})`
          : `rgba(180,210,255,${alpha * 0.26})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * 4.5, 0, 6.2832);
        ctx.fillStyle = g;
        ctx.fill();
      }
    }

    raf = requestAnimationFrame(draw);
  }

  /* Only animate while the section is on-screen — saves battery */
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !active) {
      active = true;
      raf = requestAnimationFrame(draw);
    } else if (!e.isIntersecting && active) {
      active = false;
      cancelAnimationFrame(raf);
    }
  }, { threshold: 0 });
  io.observe(section);

  /* Also pause on tab switch */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && active) {
      active = false;
      cancelAnimationFrame(raf);
    }
  });
}

/* ─────────────────────────────────────
   Flying birds — ambient scene layer
───────────────────────────────────── */
function renderBirds() {
  const container = document.getElementById("evtBirds");
  if (!container || rmq) return;

  /* top%, width px, dur s, delay s, drift px */
  const FLOCK = [
    { top:  7, w: 24, dur: 30, del:    0, drift: -16 },
    { top: 13, w: 16, dur: 38, del:  -11, drift:  -8 },
    { top: 19, w: 28, dur: 24, del:  -20, drift: -24 },
    { top: 10, w: 14, dur: 44, del:   -6, drift: -10 },
    { top: 25, w: 20, dur: 28, del:  -33, drift: -18 },
    { top:  5, w: 18, dur: 35, del:  -17, drift: -12 },
  ];

  FLOCK.forEach(b => {
    const el = document.createElement("span");
    el.className = "evt-bird";
    el.style.setProperty("--bird-top",   `${b.top}%`);
    el.style.setProperty("--bird-w",     `${b.w}px`);
    el.style.setProperty("--bird-dur",   `${b.dur}s`);
    el.style.setProperty("--bird-del",   `${b.del}s`);
    el.style.setProperty("--bird-drift", `${b.drift}px`);
    container.appendChild(el);
  });
}

/* ─────────────────────────────────────
   INVITE — Grandparents config
   Set to false if no grandparents names.
   The top block will show a divine
   blessings message instead.
────────────────────────────────────── */
let HAS_GRANDPARENTS = true;

function applyGrandparentsMode() {
  const blessing    = document.querySelector(".inv-blessing");
  const blessingAlt = document.querySelector(".inv-blessing-alt");
  const kicker      = document.querySelector(".inv-kicker");
  if (!blessing || !blessingAlt) return;
  if (HAS_GRANDPARENTS) {
    blessingAlt.style.display = "none";
  } else {
    blessing.style.display = "none";
    kicker.style.display   = "none";
  }
}

/* ─────────────────────────────────────
   GALLERY — Hanging Frames
   ─────────────────────────────────────
   Add your photos here. Each entry has:
     src     — path inside assets/gallery/
     caption — short label shown in lightbox
     orient  — "landscape" | "portrait" | "hero"
               (matches the frame PNG assets)

   Works with 1, 2, 3, or 4 photos.
   Leave src blank ("") to show an upload
   placeholder instead.
────────────────────────────────────── */
const GALLERY_PHOTOS = [
  { src: "", caption: "Together",      orient: "hero"      },
  { src: "", caption: "Getting ready", orient: "portrait"  },
  { src: "", caption: "The ceremony",  orient: "landscape" },
  { src: "", caption: "Celebrations",  orient: "portrait"  },
];

/* Frame assets — one WebP per orientation */
const GAL_FRAMES = {
  landscape: "assets/gallery/pn-gal-fr-hanging-landscape-x-v01.webp",
  portrait:  "assets/gallery/pn-gal-fr-hanging-portrait-x-v01.webp",
  hero:      "assets/gallery/pn-gal-fr-hanging-hero-arch-x-v01.webp",
};

/* ── Lightbox state ── */
let lbPhotos  = [];   // only filled photos (no placeholders)
let lbIndex   = 0;

function openLightbox(photos, index) {
  lbPhotos = photos;
  lbIndex  = index;
  const lb = document.getElementById("galLightbox");
  lb.hidden = false;
  lb.classList.toggle("single", photos.length === 1);
  document.body.style.overflow = "hidden";
  showLbPhoto(lbIndex);
}
function closeLightbox() {
  const lb = document.getElementById("galLightbox");
  lb.hidden = true;
  document.body.style.overflow = "";
}
function showLbPhoto(i) {
  const p = lbPhotos[i];
  const img = document.getElementById("galLbImg");
  const cap = document.getElementById("galLbCaption");
  img.style.opacity = "0";
  img.style.transform = "scale(.94)";
  img.src = p.src;
  img.alt = p.caption;
  cap.textContent = p.caption;
  img.onload = () => {
    img.style.transition = "opacity 300ms ease, transform 400ms cubic-bezier(.16,1,.3,1)";
    img.style.opacity = "1";
    img.style.transform = "scale(1)";
  };
}
function lbNav(dir) {
  lbIndex = (lbIndex + dir + lbPhotos.length) % lbPhotos.length;
  showLbPhoto(lbIndex);
}

/* ── Spawn gold dust inside frame ── */
function spawnGalDust(container) {
  if (rmq) return;
  for (let i = 0; i < 10; i++) {
    const d = document.createElement("div");
    d.className = "gal-dust-dot";
    const sz = 1.5 + Math.random() * 3;
    d.style.cssText = [
      `width:${sz}px`, `height:${sz}px`,
      `left:${20 + Math.random() * 60}%`,
      `bottom:${10 + Math.random() * 60}%`,
      `--dur:${3 + Math.random() * 3.5}s`,
      `--del:${Math.random() * 5}s`,
      `--dx:${(Math.random() - .5) * 20}px`,
    ].join(";");
    container.appendChild(d);
  }
}

/* ── Render gallery ── */
function renderGallery() {
  const wall = document.getElementById("galWall");
  if (!wall) return;

  /* Filter to only the photos we actually have */
  const filledPhotos = GALLERY_PHOTOS.filter(p => p.src && p.src.trim() !== "");

  /* Stagger entry delays */
  const DELAYS = [0, 160, 80, 240];

  GALLERY_PHOTOS.forEach((photo, i) => {
    const slot = document.createElement("div");
    slot.className = `gal-frame-slot gal-slot-${photo.orient}`;
    slot.setAttribute("role", "listitem");
    slot.style.transitionDelay = `${DELAYS[i] || 0}ms`;

    const inner = document.createElement("div");
    inner.className = "gal-frame-inner";

    /* Gold dust layer */
    const dust = document.createElement("div");
    dust.className = "gal-frame-dust";

    /* Photo area or placeholder */
    const photoWrap = document.createElement("div");
    photoWrap.className = "gal-photo-wrap";

    if (photo.src && photo.src.trim() !== "") {
      /* Real photo */
      const img = document.createElement("img");
      img.className = "gal-photo";
      img.src = photo.src;
      img.alt = photo.caption;
      img.decoding = "async";
      img.loading = "lazy";
      const photoIndex = filledPhotos.indexOf(photo);
      photoWrap.addEventListener("click", () => openLightbox(filledPhotos, photoIndex));
      photoWrap.appendChild(img);
    } else {
      /* Upload placeholder */
      const ph = document.createElement("div");
      ph.className = "gal-placeholder";
      ph.innerHTML = `
        <div class="gal-placeholder-icon">+</div>
        <p class="gal-placeholder-label">Tap to add photo</p>`;
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.className = "gal-file-input";
      fileInput.addEventListener("change", ev => {
        const file = ev.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        photo.src = url;
        photo.caption = file.name.replace(/\.[^.]+$/, "");
        /* Swap placeholder for real image */
        const img = document.createElement("img");
        img.className = "gal-photo";
        img.src = url;
        img.alt = photo.caption;
        photoWrap.innerHTML = "";
        photoWrap.appendChild(img);
        /* Re-trigger curtain reveal */
        photoWrap.style.clipPath = "inset(100% 0 0 0)";
        requestAnimationFrame(() => {
          setTimeout(() => { photoWrap.style.clipPath = "inset(0% 0 0 0)"; }, 40);
        });
        /* Enable lightbox for this new photo */
        const newFilled = GALLERY_PHOTOS.filter(p => p.src && p.src.trim() !== "");
        const idx = newFilled.indexOf(photo);
        photoWrap.addEventListener("click", () => openLightbox(newFilled, idx));
        spawnGalDust(dust);
      });
      ph.appendChild(fileInput);
      photoWrap.appendChild(ph);
    }

    /* Frame PNG on top */
    const frameImg = document.createElement("img");
    frameImg.className = "gal-frame-img";
    frameImg.src = GAL_FRAMES[photo.orient];
    frameImg.alt = "";
    frameImg.setAttribute("aria-hidden", "true");
    frameImg.decoding = "async";
    frameImg.draggable = false;

    inner.appendChild(dust);
    inner.appendChild(photoWrap);
    inner.appendChild(frameImg);
    slot.appendChild(inner);

    /* Caption */
    const cap = document.createElement("p");
    cap.className = "gal-frame-caption";
    cap.textContent = photo.caption;
    slot.appendChild(cap);

    wall.appendChild(slot);

    /* Intersection observer for curtain-reveal + sway */
    galFrameObserver.observe(slot);
  });

  /* Wire lightbox controls */
  document.getElementById("galLbClose").addEventListener("click", closeLightbox);
  document.getElementById("galLbPrev").addEventListener("click", () => lbNav(-1));
  document.getElementById("galLbNext").addEventListener("click", () => lbNav(1));
  document.getElementById("galLightbox").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  document.addEventListener("keydown", e => {
    if (document.getElementById("galLightbox").hidden) return;
    if (e.key === "Escape")      closeLightbox();
    if (e.key === "ArrowLeft")   lbNav(-1);
    if (e.key === "ArrowRight")  lbNav(1);
  });
}

/* ── Gallery frame intersection observer ── */
const galFrameObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    galFrameObserver.unobserve(e.target);
    e.target.classList.add("in-view");
    /* Spawn dust after curtain finishes */
    const dust = e.target.querySelector(".gal-frame-dust");
    if (dust) setTimeout(() => spawnGalDust(dust), 1100);
  });
}, { threshold: 0.22, rootMargin: "0px 0px -5% 0px" });


function revealSite() {
  introEl.classList.add("is-complete");
  document.body.classList.remove("intro-active");
  floatingMenu.classList.add("is-visible");
  /* Trigger staggered invite text animations */
  const inviteSection = document.getElementById("invite");
  if (inviteSection) {
    setTimeout(() => inviteSection.classList.add("invite-active"), 180);
  }
  /* Start rose petal shower from birds */
  if (typeof window._startPetalShower === 'function') window._startPetalShower();
}

/* ─────────────────────────────────────
   Rose petal shower — canvas-based particles
   Petals fall from the bird zone (~8-14% from top) toward the card.
   Each petal is a soft ellipse with a randomised tint, rotation, and
   lateral drift to mimic real petals tumbling in still air.
───────────────────────────────────── */
(function initPetalShower() {
  /*
   * Real rose petal physics
   * ─────────────────────────────────────────────────────────────────
   * A rose petal in still air does three things:
   *   1. Falls slowly — air resistance keeps terminal velocity low
   *   2. Rocks/tilts side-to-side (autorotation) — the flat face
   *      alternately catches and spills air, creating a lazy pendulum
   *   3. Drifts horizontally in a gentle sinusoidal path
   *
   * We model this with:
   *   • Very low terminal vy (~0.55 px/frame) — almost no gravity accel
   *   • A "rock" angle (θ) that oscillates like a pendulum; its cosine
   *     drives scaleX so the petal appears to tilt in 3-D
   *   • A slow sine-wave lateral drift (no burst velocity)
   *   • Slow spin (vr) — petals barely rotate axially
   *   • Occasional "uplift" pause — vy momentarily drops to near-zero
   * ─────────────────────────────────────────────────────────────────
   */
  const SPAWN_INTERVAL_MS = 900;
  const MAX_PETALS        = 8;
  const PETAL_SRC         = 'assets/invite/petal.webp';

  let petalImg = null, imgReady = false, petalInterval = null;
  const _img  = new Image();
  _img.onload  = () => { petalImg = _img; imgReady = true; };
  _img.onerror = () => console.warn('[PetalShower] petal.webp not found');
  _img.src = PETAL_SRC;

  let canvas, ctx, W, H, dpr;
  let petals  = [];
  let running = false;
  let rafActive = false;
  let birdEls = [];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getBirdPos(el) {
    const b = el.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();
    return { x: b.left - c.left + b.width * 0.5,
             y: b.top  - c.top  + b.height * 0.5 };
  }

  function pickBirdPos() {
    const cRect   = canvas.getBoundingClientRect();
    const visible = birdEls.filter(el => {
      if (!el) return false;
      const b  = el.getBoundingClientRect();
      const bx = b.left - cRect.left;
      return bx > -b.width && bx < W + b.width;
    });
    if (!visible.length) {
      return { x: W * (0.15 + Math.random() * 0.70), y: H * 0.08 };
    }
    const el  = visible[Math.floor(Math.random() * visible.length)];
    const pos = getBirdPos(el);
    // scatter within the wing-span area only — no upward burst
    pos.x += (Math.random() - 0.5) * 24;
    pos.y += Math.random() * 14;          // only downward from body
    return pos;
  }

  function makePetal() {
    const pos = pickBirdPos();

    // ── Size: large enough to feel real ──
    const size = 26 + Math.random() * 22;   // 26–48 px

    // ── Fall speed: very gentle, like a feather ──
    // Terminal velocity reached almost immediately; tiny accel after
    const vyBase    = 1.20 + Math.random() * 0.60;   // 1.20–1.80 px/frame
    const fallAccel = 0.0015 + Math.random() * 0.001; // barely perceptible gravity

    // ── Lateral drift: pure sine wave, no initial horizontal burst ──
    const driftAmp  = 18 + Math.random() * 22;   // 18–40 px amplitude
    const driftFreq = 0.018 + Math.random() * 0.014; // one sway per ~60-90 frames
    const driftOff  = Math.random() * Math.PI * 2;   // phase offset

    // ── Rock / tilt: pendulum oscillation that drives 3-D perspective ──
    // θ oscillates between -maxRock and +maxRock
    const rockAmp   = 0.55 + Math.random() * 0.35;  // 0.55–0.90 rad (~30–50°)
    const rockFreq  = 0.022 + Math.random() * 0.018; // slightly different from drift
    const rockOff   = Math.random() * Math.PI * 2;

    // ── Axial spin: barely there ──
    const vr = (Math.random() - 0.5) * 0.008;   // very slow axial rotation

    // ── Uplift: random chance to pause / drift up momentarily ──
    // modelled as a slow sine on vy itself
    const upliftAmp  = 0.08 + Math.random() * 0.07;
    const upliftFreq = 0.008 + Math.random() * 0.006;
    const upliftOff  = Math.random() * Math.PI * 2;

    return {
      x: pos.x, y: pos.y,
      vy: vyBase, vyBase, fallAccel,
      driftAmp, driftFreq, driftOff,
      rockAmp, rockFreq, rockOff,
      vr, rot: Math.random() * Math.PI * 2,
      upliftAmp, upliftFreq, upliftOff,
      size, life: 0,
    };
  }

  function drawPetal(p) {
    // Fade in gently over 20 frames
    const fadeIn  = Math.min(1, p.life / 20);
    // Fade out over bottom 80px
    const fadeOut = Math.min(1, Math.max(0, (H - p.y) / 80));
    const alpha   = fadeIn * fadeOut;
    if (alpha <= 0 || !imgReady) return;

    // Rock angle drives scaleX (left-right tilt in perspective)
    const θ      = p.rockAmp * Math.sin(p.life * p.rockFreq + p.rockOff);
    const scaleX = Math.cos(θ);          // 1 = face-on, 0 = edge-on
    // scaleY gets a very subtle companion tilt (much smaller)
    const scaleY = 1 - Math.abs(Math.sin(θ)) * 0.15;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(scaleX, scaleY);
    const h = p.size / 2;
    ctx.drawImage(petalImg, -h, -h, p.size, p.size);
    ctx.restore();
  }

  function tick() {
    if (!rafActive) return;
    ctx.clearRect(0, 0, W, H);
    petals = petals.filter(p => p.y < H + p.size);

    for (const p of petals) {
      // Lateral position: pure sine drift (no persistent vx)
      p.x = p.x + p.driftAmp * Math.cos(p.life * p.driftFreq + p.driftOff) * p.driftFreq;

      // Vertical: slow terminal velocity + barely-there gravity + uplift pulse
      const uplift = p.upliftAmp * Math.sin(p.life * p.upliftFreq + p.upliftOff);
      p.vy = Math.min(p.vyBase + p.life * p.fallAccel, 2.4); // cap at 2.4 px/frame
      p.y += Math.max(0.05, p.vy - uplift);  // never negative (no shooting upward)

      // Very slow axial spin
      p.rot  += p.vr;
      p.life++;
      drawPetal(p);
    }

    requestAnimationFrame(tick);
  }

  function spawnOne() {
    if (petals.length < MAX_PETALS) petals.push(makePetal());
  }

  function start() {
    if (running) return;
    running = true;
    canvas  = document.getElementById('invitePetals');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    birdEls = [
      document.getElementById('invBirdA'),
      document.getElementById('invBirdB'),
    ];
    resize();
    window.addEventListener('resize', resize);
    new IntersectionObserver(entries => {
      const vis = entries[0].isIntersecting;
      if (vis && !rafActive) { rafActive = true; requestAnimationFrame(tick); }
      else if (!vis) {
        rafActive = false;
        if (petalInterval) { clearInterval(petalInterval); petalInterval = null; }
      }
    }, { rootMargin: '100px' }).observe(canvas);
    setTimeout(() => {
      spawnOne();
      petalInterval = setInterval(spawnOne, SPAWN_INTERVAL_MS);
    }, 2200);
  }

  window._startPetalShower = start;
})();


let triggered = false;
let _musicStarted = false;
function triggerIntro() {
  if (triggered) return;
  triggered = true;
  Sound.bell(); /* soft bell chime — the pull lands */
  if (ropeFrame) {
    cancelAnimationFrame(ropeFrame);
    ropeFrame = 0;
  }
  hidePullFeedback();

  introEl.classList.remove("is-waiting");
  ropeButton.classList.remove("rope-idle");
  ropeButton.classList.remove("is-pulling");

  if (rmq) {
    introEl.classList.add("is-lit","show-names","show-date","show-venue","show-lotus");
    return;
  }

  /* 1 — rope snap down hard */
  ropeButton.style.willChange = "transform, opacity, filter";
  ropeButton.style.transition = "transform 85ms cubic-bezier(.18,0,.6,1)";
  ropeButton.style.transform  = "translateX(-50%) rotate(5deg)";
  ropeImg.style.transition    = "transform 85ms ease";
  ropeImg.style.transform     = "scaleY(1.66)";

  if (navigator.vibrate) { try { navigator.vibrate([14, 22, 88]); } catch(_) {} }

  /* 2 — elastic rebound */
  setTimeout(() => {
    ropeButton.style.transition = "transform 680ms cubic-bezier(.2,.92,.22,1)";
    ropeButton.style.transform  = "translateX(-50%) rotate(-2.2deg)";
    ropeImg.style.transition    = "transform 680ms cubic-bezier(.2,.92,.22,1)";
    ropeImg.style.transform     = "scaleY(1.16)";
  }, 85);

  /* Cinematic flash — golden burst from top, like a lamp igniting */
  setTimeout(() => {
    const flash = document.createElement("div");
    flash.style.cssText = [
      "position:absolute", "inset:0", "z-index:16", "pointer-events:none",
      "background:radial-gradient(ellipse 110% 80% at 50% 5%,",
      "  rgba(255,218,100,.92) 0%,",
      "  rgba(255,190,60,.44) 30%,",
      "  rgba(255,160,40,.12) 58%,",
      "  transparent 76%)",
      "animation:cinemaFlash 1300ms ease-out forwards"
    ].join(";");
    introEl.appendChild(flash);
    setTimeout(() => flash.remove(), 1400);
  }, 140);

  /* 3 — lights on — slightly delayed so flash leads */
  setTimeout(() => {
    introEl.classList.add("is-lit");
    Sound.ambient(); /* shimmer as lamps ignite */
  }, 200);

  /* 4 — cascade text */
  setTimeout(() => introEl.classList.add("show-names"),  1200);
  setTimeout(() => introEl.classList.add("show-date"),   2200);
  setTimeout(() => introEl.classList.add("show-venue"),  2550);
  setTimeout(() => introEl.classList.add("show-lotus"),  3100);
}

/* ─────────────────────────────────────
   Rope drag — pointer events
───────────────────────────────────── */
let isDragging = false, dragStartY = 0;
let ropeTargetY = 0;
let ropeVisualY = 0;
let ropeVelocityY = 0;
let ropeSwing = 0;
let ropeLastRaw = 0;
let ropeFrame = 0;
let ropePointerOffset = 0;
let ropePeakRaw = 0;
let pullFeedbackTimer = 0;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function applyRopePhysicsFrame() {
  const spring = isDragging ? .26 : .18;
  const damping = isDragging ? .70 : .60;

  ropeVelocityY = (ropeVelocityY + (ropeTargetY - ropeVisualY) * spring) * damping;
  ropeVisualY += ropeVelocityY;

  const progress = Math.min(ropeLastRaw / PULL_THRESHOLD, 1);
  const tasselDrop = ropeVisualY;
  const rotation = clamp(ropePointerOffset * 10 + ropeVelocityY * .11 + ropeSwing, -13, 13);
  const stretch = 1 + clamp(tasselDrop / (PULL_THRESHOLD * 1.45), 0, .66) + clamp(Math.abs(ropeVelocityY) * .012, 0, .095);
  const haloScale = 1 + progress * .76 + clamp(Math.abs(ropeVelocityY) * .01, 0, .15);

  ropeButton.style.transform = `translateX(-50%) rotate(${rotation.toFixed(2)}deg)`;
  ropeImg.style.transform = `scaleY(${stretch.toFixed(3)})`;
  ropeHalo.style.opacity = String(.24 + progress * .72);
  ropeHalo.style.transform = `translateX(-50%) translateY(${(tasselDrop * .28).toFixed(2)}px) scale(${haloScale.toFixed(3)})`;

  if (!isDragging && ropeTargetY === 0 && Math.abs(ropeVisualY) < .45 && Math.abs(ropeVelocityY) < .45) {
    ropeVisualY = 0;
    ropeVelocityY = 0;
    ropeLastRaw = 0;
    ropePointerOffset = 0;
    ropeButton.style.transform = "";
    ropeImg.style.transform = "";
    ropeHalo.style.opacity = "";
    ropeHalo.style.transform = "";
    ropeFrame = 0;
    return;
  }

  ropeFrame = requestAnimationFrame(applyRopePhysicsFrame);
}

function startRopePhysics() {
  if (!ropeFrame) ropeFrame = requestAnimationFrame(applyRopePhysicsFrame);
}

function hidePullFeedback() {
  if (pullFeedbackTimer) {
    clearTimeout(pullFeedbackTimer);
    pullFeedbackTimer = 0;
  }
  pullFeedback.classList.remove("is-visible");
}

function showPullFeedback() {
  if (triggered || rmq) return;
  hidePullFeedback();
  pullFeedback.classList.add("is-visible");
  pullFeedbackTimer = setTimeout(() => {
    pullFeedback.classList.remove("is-visible");
    pullFeedbackTimer = 0;
  }, 1900);
}

function snapBack() {
  ropeTargetY = 0;
  ropeLastRaw = 0;
  ropeSwing = clamp(ropeVelocityY * -.08, -5.5, 5.5);
  ropeButton.classList.remove("is-pulling");
  ropeButton.style.transition = "none";
  ropeImg.style.transition = "none";
  ropeHalo.style.transition = "none";
  startRopePhysics();
  setTimeout(() => { if (!triggered && !isDragging) ropeButton.classList.add("rope-idle"); }, 760);
}

ropeButton.addEventListener("pointerdown", e => {
  if (triggered) return;
  /* iOS/Safari: WebAudio AudioContext must also be resumed inside a gesture stack */
  try { const sc = Sound.ctx; if (sc && sc.state === "suspended") sc.resume(); } catch (_) {}
  e.preventDefault();
  isDragging = true; dragStartY = e.clientY;
  ropePeakRaw = 0;
  hidePullFeedback();
  /* bell fires on pointerdown so it doesn't wait for threshold */
  ropeButton.classList.add("rope-ready");
  ropeButton.classList.remove("rope-idle");
  ropeButton.classList.add("is-pulling");
  ropeButton.style.transition = "none";
  ropeButton.style.willChange = "transform";
  ropeImg.style.transition    = "none";
  ropeHalo.style.transition   = "none";
  ropeTargetY = ropeVisualY;
  ropeVelocityY = 0;
  ropeLastRaw = 0;
  const rect = ropeButton.getBoundingClientRect();
  ropePointerOffset = clamp((e.clientX - (rect.left + rect.width / 2)) / rect.width, -1, 1);
  startRopePhysics();
  ropeButton.setPointerCapture(e.pointerId);
});

ropeButton.addEventListener("pointermove", e => {
  if (!isDragging || triggered) return;
  e.preventDefault();
  const raw    = Math.max(0, e.clientY - dragStartY);
  const visual = resist(raw);
  const rect = ropeButton.getBoundingClientRect();
  const nextOffset = clamp((e.clientX - (rect.left + rect.width / 2)) / rect.width, -1, 1);

  ropeTargetY = visual;
  ropeLastRaw = raw;
  ropePeakRaw = Math.max(ropePeakRaw, raw);
  ropeSwing = clamp((nextOffset - ropePointerOffset) * 18 + (visual - ropeVisualY) * .034, -8.5, 8.5);
  ropePointerOffset = nextOffset;
  startRopePhysics();

  if (raw >= PULL_THRESHOLD) { isDragging = false; triggerIntro(); }
});

ropeButton.addEventListener("pointerup", e => {
  if (ropeButton.hasPointerCapture(e.pointerId)) ropeButton.releasePointerCapture(e.pointerId);
  isDragging = false;
  if (!triggered) {
    if (ropePeakRaw > PULL_THRESHOLD * .18) showPullFeedback();
    snapBack();
  }
});
ropeButton.addEventListener("pointercancel", () => {
  isDragging = false;
  if (!triggered) {
    if (ropePeakRaw > PULL_THRESHOLD * .18) showPullFeedback();
    snapBack();
  }
});
ropeButton.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); triggerIntro(); }
});
ropeButton.addEventListener("click", () => { if (!triggered && rmq) triggerIntro(); });

/* ─────────────────────────────────────
   Lotus tap — 5-phase bloom sequence
   Phase 1  (0–200ms)   : lotus breathes in — slight scale-down
   Phase 2  (200–600ms) : swells to 1.15×, golden glow intensifies
   Phase 3  (600–1000ms): cross-fade closed → open (opacity, not src swap)
   Phase 4  (800ms)     : glow burst expands outward
   Phase 5  (1200ms)    : scene fades into invite section
───────────────────────────────────── */
lotusButton.addEventListener("click", () => {
  if (lotusButton.classList.contains("is-animating")) return;
  lotusButton.classList.add("is-animating");

  /* Music starts on the lotus tap, once per visit; a later Home → lotus keeps the guest's mute choice */
  if (!_musicStarted) {
    playBgMusic().then(() => { _musicStarted = true; }).catch(syncBgMusicState);
  }

  if (rmq) { revealSite(); return; }

  Sound.lotus();

  /* Phase 1 — breath in */
  lotusButton.classList.add("lotus-phase-1");

  /* Phase 2 — anticipation swell */
  setTimeout(() => {
    lotusButton.classList.remove("lotus-phase-1");
    lotusButton.classList.add("lotus-phase-2");
  }, 200);

  /* Phase 3 — cross-fade closed → open */
  setTimeout(() => {
    lotusButton.classList.remove("lotus-phase-2");
    lotusButton.classList.add("lotus-phase-3");

    /* Fade out closed image */
    lotusIconImg.style.transition = "opacity 400ms ease";
    lotusIconImg.style.opacity    = "0";

    /* Fade in open image */
    const openImg = document.getElementById("lotusOpenImg");
    if (openImg) {
      openImg.style.transition = "opacity 420ms ease 80ms";
      openImg.style.opacity    = "1";
    }
  }, 600);

  /* Phase 4 — full glow burst + is-open class */
  setTimeout(() => {
    lotusButton.classList.remove("lotus-phase-3");
    lotusButton.classList.add("is-open");
  }, 860);

  /* Phase 5 — reveal site */
  setTimeout(revealSite, 1200);
});
skipBtn.addEventListener("click", revealSite);

/* ─────────────────────────────────────
   Floating nav
───────────────────────────────────── */
menuToggle.addEventListener("click", e => {
  e.stopPropagation(); // prevent this click from immediately triggering the outside-click listener
  const open = floatingMenu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".menu-link").forEach(a =>
  a.addEventListener("click", e => {
    /* Home — re-show the intro in its lit state (names visible, lotus ready to tap) */
    if (a.id === "menuHome") {
      e.preventDefault();
      /* Reset lotus back to closed, ready to tap again */
      lotusButton.classList.remove("is-open", "is-animating", "lotus-phase-1", "lotus-phase-2", "lotus-phase-3");
      lotusIconImg.style.transition = "none";
      lotusIconImg.style.opacity = "1";
      var openImg = document.getElementById("lotusOpenImg");
      if (openImg) { openImg.style.transition = "none"; openImg.style.opacity = "0"; }
      /* Allow lotus to be triggered again */
      triggered = false;
      /* Hide nav — revealSite() re-adds is-visible when lotus is tapped */
      floatingMenu.classList.remove("is-visible");
      /* Show intro in lit state — names/date/venue/lotus all visible */
      introEl.classList.remove("is-complete");
      introEl.classList.add("is-lit", "show-names", "show-date", "show-venue", "show-lotus");
      document.body.classList.add("intro-active");
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    floatingMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

/* Click anywhere outside the menu panel closes it */
document.addEventListener("click", e => {
  if (!floatingMenu.classList.contains("is-open")) return;
  if (!floatingMenu.contains(e.target)) {
    floatingMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

/* ─────────────────────────────────────
   Scroll reveal
───────────────────────────────────── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (document.body.classList.contains("intro-active") && e.target.closest(".invite-section")) return;
    if (e.isIntersecting) { e.target.classList.add("in-view"); observer.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
document.querySelectorAll(".reveal-item").forEach(el => observer.observe(el));

/* ═══════════════════════════════════════════════════════════════
   THINGS TO KNOW — Dynamic Guest Info Board
   ttkObserver and TTK_ITEMS defined BEFORE hydrate() runs
   so they are fully initialised when renderTTK() is called.
═══════════════════════════════════════════════════════════════ */

const TTK_BASE = "assets/ttk/";

/* ── Card data — 4 enabled by default for preview ── */
const TTK_ITEMS = [
  {
    type:        "dress-code",
    enabled:     true,
    title:       "Dress Code",
    description: "Festive Indian elegance. Sarees, lehengas and sherwanis are warmly encouraged.",
    icon:        TTK_BASE + "pn-ttk-ico-dress-code-x-v01.webp",
    linkLabel:   null, linkUrl: null, custom: false,
  },
  {
    type:        "venue",
    enabled:     true,
    title:       "Venue",
    description: "Blessings Banquets and Resort. All celebrations will take place within the resort.",
    icon:        TTK_BASE + "pn-ttk-ico-venue-x-v01.webp",
    linkLabel:   null,
    linkUrl:     null,
    custom:      false,
  },
  {
    type:        "stay-options",
    enabled:     true,
    title:       "Stay Options",
    description: "A curated block of rooms have been reserved within the resort.",
    icon:        TTK_BASE + "pn-ttk-ico-stay-options-x-v01.webp",
    linkLabel:   null, linkUrl: null, custom: false,
  },
  {
    type:        "hashtag",
    enabled:     true,
    title:       "Wedding Hashtag",
    description: "Share your favourite moments with #ShubhPalBegins.",
    icon:        TTK_BASE + "pn-ttk-ico-hashtag-x-v01.webp",
    linkLabel:   null, linkUrl: null, custom: false,
  },
  /* ── Remaining cards — set enabled: true to activate ── */
  {
    type: "transport", enabled: false, title: "Transport",
    description: "Complimentary shuttle service between the airport and the palace.",
    icon: TTK_BASE + "pn-ttk-ico-transport-x-v01.webp", linkLabel: null, linkUrl: null, custom: false,
  },
  {
    type: "gift-registry", enabled: false, title: "Gift Registry",
    description: "Your presence is the greatest gift. A registry link is available for those who wish.",
    icon: TTK_BASE + "pn-ttk-ico-gift-registry-x-v01.webp", linkLabel: "View Registry", linkUrl: "#", custom: false,
  },
  {
    type: "food", enabled: false, title: "Food",
    description: "A lavish spread of vegetarian and non-vegetarian dishes will be served at all events.",
    icon: TTK_BASE + "pn-ttk-ico-food-x-v01.webp", linkLabel: null, linkUrl: null, custom: false,
  },
  {
    type: "weather", enabled: false, title: "Weather",
    description: "December in Udaipur is pleasant, so expect clear skies and cool evenings.",
    icon: TTK_BASE + "pn-ttk-ico-weather-x-v01.webp", linkLabel: null, linkUrl: null, custom: false,
  },
  {
    type: "parking", enabled: false, title: "Parking",
    description: "Valet parking is available at the main palace entrance.",
    icon: TTK_BASE + "pn-ttk-ico-parking-x-v01.webp", linkLabel: null, linkUrl: null, custom: false,
  },
  {
    type: "kids-welcome", enabled: false, title: "Kids Welcome",
    description: "Children are warmly welcome. A dedicated kids' zone will be available at all events.",
    icon: TTK_BASE + "pn-ttk-ico-kids-welcome-x-v01.webp", linkLabel: null, linkUrl: null, custom: false,
  },
  {
    type: "photography", enabled: false, title: "Photography",
    description: "A professional photographer will be present. Guests are welcome to capture moments freely.",
    icon: TTK_BASE + "pn-ttk-ico-photography-x-v01.webp", linkLabel: null, linkUrl: null, custom: false,
  },
  {
    type: "whatsapp-group", enabled: false, title: "WhatsApp Group",
    description: "Join our wedding group for live updates and celebration news.",
    icon: TTK_BASE + "pn-ttk-ico-whatsapp-group-x-v01.webp", linkLabel: "Join Group", linkUrl: "#", custom: false,
  },
];

/* ── Scroll-reveal observer — defined before hydrate() ── */
const ttkObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in-view");
    ttkObserver.unobserve(e.target);
  });
}, { threshold: 0.10, rootMargin: "0px 0px -5% 0px" });

function renderTTK() {
  const grid = document.getElementById("ttkGrid");
  if (!grid) return;
  const active = TTK_ITEMS.filter(item => item.enabled);
  if (!active.length) return;
  const count = active.length;
  if (count === 1) grid.classList.add("ttk-grid--single");

  active.forEach((item, i) => {
    const isLastOdd = count > 1 && count % 2 !== 0 && i === count - 1;
    const card = buildTTKCard(item, isLastOdd);
    if (!rmq) card.style.transitionDelay = `${i * 80}ms`;
    grid.appendChild(card);
    ttkObserver.observe(card);
  });
}

function buildTTKCard(item, isLastOdd) {
  const a = document.createElement("article");
  a.className = "ttk-card" + (isLastOdd ? " ttk-card--last-odd" : "");
  a.setAttribute("role", "listitem");

  /* Icon wrap — holds glow ring + icon */
  const wrap = document.createElement("div");
  wrap.className = "ttk-card-icon-wrap";

  const icon = document.createElement("img");
  icon.className = "ttk-card-icon";
  icon.src = item.icon; icon.alt = ""; icon.decoding = "async"; icon.loading = "lazy";
  icon.setAttribute("aria-hidden", "true");

  /* After spring transition ends, mark as sprung so CSS animation takes over cleanly */
  icon.addEventListener("transitionend", () => {
    icon.classList.add("icon-sprung");
  }, { once: true });

  wrap.appendChild(icon);

  const rule = document.createElement("div");
  rule.className = "ttk-card-rule"; rule.setAttribute("aria-hidden", "true");

  const title = document.createElement("h3");
  title.className = "ttk-card-title"; title.textContent = item.title;

  const body = document.createElement("p");
  body.className = "ttk-card-body"; body.textContent = item.description;

  a.appendChild(wrap); a.appendChild(rule); a.appendChild(title); a.appendChild(body);

  if (item.linkLabel && item.linkUrl) {
    const lnk = document.createElement("a");
    lnk.className = "ttk-card-link"; lnk.href = item.linkUrl;
    lnk.textContent = "↗ " + item.linkLabel;
    if (item.linkUrl.startsWith("http")) { lnk.target = "_blank"; lnk.rel = "noreferrer"; }
    a.appendChild(lnk);
  }
  return a;
}

/* ═══════════════════════════════════════════════════════════════
   SHAADIPATH — Phase 1 config override (runs before hydrate)
   Reads window.__WEDDING_CONFIG__ injected by the preview pipeline
   and overrides the data arrays so render functions use live data.
═══════════════════════════════════════════════════════════════ */
(function applyConfigPhase1() {
  var C = (typeof window !== 'undefined') ? window.__WEDDING_CONFIG__ : null;
  if (!C) return;

  /* Format ISO date "2026-12-13" → "13 Dec 2026" for event cards */
  function fmtEvDate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    var d = parseInt(parts[2], 10), m = parseInt(parts[1], 10), y = parts[0];
    var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d + ' ' + (mo[m - 1] || '') + ' ' + y;
  }

  /* Override EVENTS array in-place */
  if (C.events && C.events.length > 0) {
    var mapped = C.events.map(function(ev) {
      return {
        id:    ev.id,
        icon:  ev.icon,
        name:  ev.name,
        date:  fmtEvDate(ev.date),
        time:  ev.time  || '',
        venue: ev.venue || '',
        note:  ev.desc  || '',
        map:   ev.mapsLink || ''
      };
    });
    EVENTS.splice(0, EVENTS.length);
    mapped.forEach(function(e) { EVENTS.push(e); });
  }

  /* Override GALLERY_PHOTOS in-place */
  if (C.gallery) {
    if (!C.gallery.show || C.gallery.layout === 'skip') {
      GALLERY_PHOTOS.splice(0);
    } else {
      var photos = (C.gallery.photos || []).filter(Boolean);
      if (photos.length > 0) {
        var ORIENTS = ['hero', 'portrait', 'landscape', 'portrait'];
        var bride = (C.couple && C.couple.bride) || '';
        var groom = (C.couple && C.couple.groom) || '';
        var caption = bride && groom ? bride + ' & ' + groom : '';
        var maxPhotos = parseInt(C.gallery.layout, 10) || 4;
        var newPhotos = photos.slice(0, maxPhotos).map(function(src, i) {
          return { src: src, caption: caption, orient: ORIENTS[i] || 'portrait' };
        });
        GALLERY_PHOTOS.splice(0, GALLERY_PHOTOS.length);
        newPhotos.forEach(function(p) { GALLERY_PHOTOS.push(p); });
      }
    }
  }

  /* Override TTK enabled/descriptions */
  if (C.thingsToKnow && C.thingsToKnow.length > 0) {
    // Builder IDs that differ from template type strings
    var TTK_ID_MAP = {
      dresscode: 'dress-code', hotel: 'stay-options', gifts: 'gift-registry',
      kids: 'kids-welcome', whatsapp: 'whatsapp-group', photos: 'photography',
    };
    TTK_ITEMS.forEach(function(item) { item.enabled = false; });
    C.thingsToKnow.forEach(function(ttk) {
      // Match by id only — custom items have ctk_ ids and never match predefined entries
      var resolvedType = TTK_ID_MAP[ttk.id] || ttk.id;
      var match = ttk.id && !ttk.id.startsWith('ctk_')
        ? TTK_ITEMS.find(function(item) { return item.type === resolvedType; })
        : null;
      if (match) {
        match.title = ttk.label || match.title;
        match.description = ttk.value || match.description;
        match.enabled = true;
        if (ttk.iconKey) match.icon = TTK_BASE + ttk.iconKey;
        if (ttk.mapsLink) {
          match.linkLabel = 'Open in Maps';
          match.linkUrl = ttk.mapsLink;
        }
      } else if (ttk.label) {
        var iconFile = ttk.iconKey || 'pn-ttk-ico-custom-note-x-v01.webp';
        TTK_ITEMS.push({
          type: ttk.id || ('custom-' + TTK_ITEMS.length),
          enabled: true,
          title: ttk.label,
          description: ttk.value || '',
          icon: TTK_BASE + iconFile,
          linkLabel: null, linkUrl: null, custom: true,
        });
      }
    });
  }

  /* Override grandparents flag */
  if (C.invite) {
    HAS_GRANDPARENTS = !!(C.invite.showGrandparents);
  }

  /* Hide TTK section if turned off in builder */
  if (C.showThingsToKnow === false) {
    TTK_ITEMS.forEach(function(item) { item.enabled = false; });
    var ttkSec = document.getElementById('things');
    if (ttkSec) ttkSec.style.display = 'none';
  }
})();

/* ─────────────────────────────────────
   Init
───────────────────────────────────── */
hydrate();
Sound.init();
/* ═══════════════════════════════════════════════════════════════
   RSVP — Royal Night Finale
   Fireworks, fountain, calendar links, reveal sequencer
═══════════════════════════════════════════════════════════════ */

/* ── Wedding event data (sourced from EVENTS above) ── */
const RSVP_EVENT = {
  title:    "Aarav & Meera's Wedding",
  // Shaadi on 13 Dec 2026, 9:30 AM, 3 hours, IST (UTC+5:30)
  startUTC: "20261213T040000Z", // 09:30 IST → 04:00 UTC
  endUTC:   "20261213T070000Z", // 12:30 IST → 07:00 UTC
  location: "The Oberoi Udaivilas, Udaipur, Rajasthan, India",
  description: "Join us for the wedding of Aarav & Meera. Dress code: Traditional Indian attire."
};

/* ── Calendar link builders ── */
function buildGCalLink(e) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text:   e.title,
    dates:  `${e.startUTC}/${e.endUTC}`,
    location: e.location,
    details:  e.description
  });
  return "https://calendar.google.com/calendar/render?" + p.toString();
}

function buildICSContent(e) {
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pichwai Noor//Wedding//EN",
    "BEGIN:VEVENT",
    `DTSTART:${e.startUTC}`,
    `DTEND:${e.endUTC}`,
    `DTSTAMP:${now}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${e.location}`,
    `DESCRIPTION:${e.description}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function wireCalendarButtons() {
  const gcal = document.getElementById("rsvpGcalBtn");
  const ical = document.getElementById("rsvpIcalBtn");
  if (!gcal || !ical) return;

  // If Phase 2 already wired real couple URLs, don't overwrite with demo data
  const cfg = (typeof window !== 'undefined') && window.__WEDDING_CONFIG__;
  if (cfg && cfg.calendarUrls) return;

  gcal.href = buildGCalLink(RSVP_EVENT);

  // iCal: data URI (works cross-browser; download attr triggers save)
  const icsBlob = new Blob([buildICSContent(RSVP_EVENT)], { type: "text/calendar" });
  ical.href = URL.createObjectURL(icsBlob);
}

/* ── Fireworks ── */
function initRSVPFireworks(canvas) {
  const ctx = canvas.getContext("2d");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  let W, H;
  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Colour palette: ivory, blush, dusty rose, carmine
  const PALETTES = [
    ["rgba(247,238,220,", "rgba(235,210,190,"],  // ivory
    ["rgba(223,176,180,", "rgba(200,148,160,"],  // blush rose
    ["rgba(191,155,168,", "rgba(166,120,140,"],  // dusty rose
    ["rgba(180,100,118,", "rgba(140,70,90,"],    // carmine
  ];

  const bursts = [];

  function spawnBurst() {
    // Only upper 38% of sky
    const x = W * (.18 + Math.random() * .64);
    const y = H * (.04 + Math.random() * .34);
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const particleCount = 36 + Math.floor(Math.random() * 22);
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - .5) * .3;
      const speed = 1.2 + Math.random() * 2.6;
      particles.push({
        angle, speed,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        x, y,
        life: 1,
        decay: .012 + Math.random() * .010,
        size: .8 + Math.random() * 1.4,
        col: palette[Math.floor(Math.random() * palette.length)]
      });
    }
    bursts.push({ particles, age: 0 });
  }

  // Burst scheduling — started only when section enters view
  const BURST_DELAYS = [600, 2200, 3800, 5200, 6400, 7800];
  const CYCLE = 7000;
  let burstStarted = false;
  function startBursts() {
    if (burstStarted) return;
    burstStarted = true;
    BURST_DELAYS.forEach(d => setTimeout(function schedBurst() {
      if (!document.getElementById("rsvp")) return;
      spawnBurst();
      setTimeout(schedBurst, CYCLE);
    }, d));
  }

  let rafId;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let b = bursts.length - 1; b >= 0; b--) {
      const burst = bursts[b];
      let allDead = true;
      for (const p of burst.particles) {
        p.x += p.vx * .72;
        p.y += p.vy * .72 + .04; // very slight gravity
        p.vx *= .97;
        p.vy *= .97;
        p.life -= p.decay;
        if (p.life <= 0) continue;
        allDead = false;
        const a = Math.max(0, p.life * p.life); // quadratic fade = elegant bloom
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.col + a.toFixed(3) + ")";
        ctx.fill();
      }
      if (allDead) bursts.splice(b, 1);
    }
    rafId = requestAnimationFrame(frame);
  }

  // Start bursts and render only when section is in view
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { startBursts(); if (!rafId) frame(); }
      else { cancelAnimationFrame(rafId); rafId = 0; }
    });
  }, { threshold: 0.05 });
  io.observe(canvas.closest(".rsvp-section"));
}

/* ── Scroll-reveal orchestrator ── */
function initRSVPReveal() {
  const section = document.getElementById("rsvp");
  if (!section) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      section.classList.add("rsvp-alive");
      io.unobserve(section);
    });
  }, { threshold: 0.08 });
  io.observe(section);
}

/* ── Boot ── */
function initRSVP() {
  wireCalendarButtons();
  initRSVPReveal();
  const canvas = document.getElementById("rsvpFireworksCanvas");
  if (canvas) initRSVPFireworks(canvas);
}

// Run after DOM is ready (script is deferred)
document.addEventListener("DOMContentLoaded", initRSVP);
// Also run immediately if DOM already loaded
if (document.readyState !== "loading") initRSVP();
/* ═══════════════════════════════════════════
   MEET THE COUPLE — Tree parting + content reveal
═══════════════════════════════════════════ */
(function () {
  const section   = document.getElementById("couple");
  const treeLeft  = document.getElementById("cplTreeLeft");
  const treeRight = document.getElementById("cplTreeRight");

  if (!section || !treeLeft || !treeRight) return;

  /* ── Preflight: set trees to fully closed via direct transform ── */
  treeLeft.style.transform  = "translateX(0%)";
  treeRight.style.transform = "translateX(0%)";

  let rafPending  = false;
  let fullyOpen   = false;
  let contentFired = false;

  /* Content elements to reveal once trees have parted enough */
  const contentEls = section.querySelectorAll(".cpl-header, .cpl-story");

  function getTreeTravelPct() {
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    if (w >= 1536) return 130;
    if (w >= 1280) return 124;
    if (w >= 1024) return 116;
    if (w >= 768) return 108;
    return 100;
  }

  function setTreeTravel(pct) {
    treeLeft.style.transform  = `translateX(-${pct}%)`;
    treeRight.style.transform = `translateX(${pct}%)`;
  }

  function updateTrees() {
    rafPending = false;
    if (fullyOpen) return;

    const rect = section.getBoundingClientRect();
    const winH = window.innerHeight;

    /*
      progress 0 → section bottom just enters viewport (rect.bottom = winH)
      progress 1 → section centre reaches mid-screen

      Using rect.bottom as anchor so animation starts the instant
      ANY part of the section becomes visible from below.
    */
    const startPos = winH + section.offsetHeight * 0.15;
    const endPos   = winH * 0.5;
    const raw      = 1 - (rect.bottom - endPos) / (startPos - endPos);
    const progress = Math.max(0, Math.min(1, raw));

    /* Ease-out quart — snappy open, luxurious finish */
    const ease = 1 - Math.pow(1 - progress, 4);

    /* Apply transform directly — no CSS variable middleman */
    const pct = (ease * getTreeTravelPct()).toFixed(3);
    setTreeTravel(pct);

    /* At 40% open, fade in the content with staggered delay */
    if (!contentFired && progress > 0.40) {
      contentFired = true;
      contentEls.forEach((el, i) => {
        el.style.opacity   = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = `opacity 700ms cubic-bezier(.16,1,.3,1) ${i * 180}ms,
                               transform 800ms cubic-bezier(.16,1,.3,1) ${i * 180}ms`;
        /* Force reflow so transition fires */
        void el.offsetHeight;
        el.style.opacity   = "1";
        el.style.transform = "translateY(0)";
      });
    }

    if (progress >= 1) {
      fullyOpen = true;
      setTreeTravel(getTreeTravelPct());
    }
  }

  /* Start content hidden */
  contentEls.forEach(el => {
    el.style.opacity   = "0";
    el.style.transform = "translateY(20px)";
  });

  window.addEventListener("scroll", () => {
    if (!rafPending && !fullyOpen) {
      rafPending = true;
      requestAnimationFrame(updateTrees);
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    if (fullyOpen) setTreeTravel(getTreeTravelPct());
  }, { passive: true });

  /* Run on load in case section is already in view */
  updateTrees();
})();

/* ═══════════════════════════════════════════════════════════════
   SHAADIPATH — Phase 2 config override (runs after all init)
   Patches text DOM elements: intro names, invite, RSVP, closing,
   calendar links, and music. Arrays were already handled in Phase 1.
═══════════════════════════════════════════════════════════════ */
(function applyConfigPhase2() {
  var C = (typeof window !== 'undefined') ? window.__WEDDING_CONFIG__ : null;
  if (!C) return;

  var couple = C.couple || {};
  var invite = C.invite || {};
  var story  = C.story  || {};
  var gallery = C.gallery || {};
  var rsvp   = C.rsvp   || {};
  var music  = C.music  || {};

  var MONTHS_LONG = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

  function fmtLong(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' ' + (MONTHS_LONG[parseInt(p[1], 10) - 1] || '') + ' ' + p[0];
  }
  function fmtDot(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' · ' + (MONTHS_LONG[parseInt(p[1], 10) - 1] || '') + ' · ' + p[0];
  }

  /* ── Page title ── */
  if (couple.bride && couple.groom) {
    document.title = couple.bride + ' & ' + couple.groom;
  }

  /* ── Intro section names, date, venue ── */
  var introNames = document.getElementById('introNames');
  if (introNames && couple.bride && couple.groom) {
    var words = Array.from(introNames.querySelectorAll('.word')).filter(function(w) {
      return !w.classList.contains('amp-wrap');
    });
    if (words.length >= 2) {
      words[0].textContent = couple.bride;
      words[words.length - 1].textContent = couple.groom;
    }
  }
  var introDate = document.getElementById('introDate');
  if (introDate && couple.date) introDate.textContent = fmtDot(couple.date);
  var introVenue = document.getElementById('introVenue');
  if (introVenue && couple.venue) introVenue.textContent = couple.venue;

  /* ── Invite — couple names ── */
  var invNames = document.querySelector('.inv-names');
  if (invNames && couple.bride && couple.groom) {
    invNames.innerHTML = couple.bride + ' <span class="inv-amp">&amp;</span> ' + couple.groom;
  }

  /* ── Invite — parents ── */
  var invParents = document.querySelector('.inv-parents');
  if (invParents && (invite.brideFather || invite.groomFather)) {
    var bF = invite.brideFather || '', bM = invite.brideMother || '';
    var gF = invite.groomFather || '', gM = invite.groomMother || '';
    var isGroomFirst = invite.parentsOrder === 'groom_first';
    var line1 = (isGroomFirst ? 'S/O ' : 'D/O ') + bF + ' &amp; ' + bM;
    var line2 = (isGroomFirst ? 'D/O ' : 'S/O ') + gF + ' &amp; ' + gM;
    invParents.innerHTML = '<p>' + line1 + '</p><p>' + line2 + '</p>';
  }

  /* ── Invite — date and venue ── */
  var invDate = document.querySelector('.inv-date');
  if (invDate && couple.date) invDate.textContent = fmtLong(couple.date);
  var invVenue = document.querySelector('.inv-venue');
  if (invVenue && couple.venue) invVenue.textContent = couple.venue;

  /* ── Invite — grandparents text ── */
  if (HAS_GRANDPARENTS && invite.showGrandparents) {
    var blessing = document.querySelector('.inv-blessing');
    if (blessing) {
      var blessPs = Array.from(blessing.querySelectorAll('p:not(.inv-overline)'));
      if (blessPs.length >= 2) {
        var brideGPText = [invite.brideGF, invite.brideGM].filter(Boolean).join(' & ');
        var groomGPText = [invite.groomGF, invite.groomGM].filter(Boolean).join(' & ');
        if (brideGPText) {
          blessPs[0].textContent = brideGPText;
        } else {
          blessPs[0].style.display = 'none';
        }
        if (groomGPText) {
          blessPs[1].textContent = groomGPText;
        } else {
          blessPs[1].style.display = 'none';
        }
      }
    }
  }

  /* ── Couple section — hide if story disabled ── */
  if (story.show === false) {
    var coupleSection = document.getElementById('couple');
    if (coupleSection) coupleSection.style.display = 'none';
    var coupleNavLink = document.querySelector('.menu-link[href="#couple"]');
    if (coupleNavLink) {
      coupleNavLink.style.display = 'none';
      var coupleNavDivider = coupleNavLink.previousElementSibling;
      if (coupleNavDivider && coupleNavDivider.classList.contains('menu-divider')) coupleNavDivider.style.display = 'none';
    }
  }

  /* ── Story paragraph + tags — respect storyMode ── */
  var storyMode = story.storyMode || 'tags';
  var storyBody = document.querySelector('.cpl-story-body');
  var tagsContainer = document.getElementById('cplTags');

  if (storyMode === 'story') {
    /* Story mode: replace paragraph with user text, hide tags */
    if (storyBody && story.storyText) storyBody.textContent = story.storyText;
    /* Tags container stays empty → auto-hidden via CSS :empty rule */
  } else {
    /* Tags mode: only clear demo paragraph if there are actual tags to show.
       If tags array is empty, leave the hardcoded demo text as a visual fallback. */
    if (story.tags && story.tags.length > 0) {
      if (storyBody) storyBody.textContent = '';
      if (tagsContainer) {
        tagsContainer.setAttribute('aria-hidden', 'false');
        story.tags.forEach(function(tag) {
          var chip = document.createElement('span');
          chip.className = 'cpl-tag-chip';
          chip.textContent = tag;
          tagsContainer.appendChild(chip);
        });
      }
    }
    /* else: no tags — leave .cpl-story-body as the template demo text */
  }

  /* ── Gallery section — hide if disabled ── */
  if (!gallery.show || gallery.layout === 'skip') {
    var galSection = document.getElementById('gallery');
    if (galSection) galSection.style.display = 'none';
    var galleryNavLink = document.querySelector('.menu-link[href="#gallery"]');
    if (galleryNavLink) {
      galleryNavLink.style.display = 'none';
      var galleryNavDivider = galleryNavLink.previousElementSibling;
      if (galleryNavDivider && galleryNavDivider.classList.contains('menu-divider')) galleryNavDivider.style.display = 'none';
    }
  }

  /* ── RSVP — headline ── */
  var headline = document.getElementById('rsvpHeadline');
  if (headline && rsvp.heading) {
    var joinEl = headline.querySelector('.rsvp-hl-join');
    var willEl = headline.querySelector('.rsvp-hl-will');
    if (joinEl) {
      joinEl.textContent = rsvp.heading;
      if (willEl) willEl.textContent = '';
    } else {
      headline.textContent = rsvp.heading;
    }
  }

  /* ── RSVP — body ── */
  var rsvpBody = document.querySelector('.rsvp-body');
  if (rsvpBody && rsvp.subtext) rsvpBody.textContent = rsvp.subtext;

  /* ── RSVP — form → Google Sheet (Apps Script web app, see tools/rsvp-sheet.gs) ── */
  initRSVPForm(rsvp.endpoint);

  /* ── Calendar links — use ShaadiPath pipeline URLs ── */
  if (C.calendarUrls) {
    var gcalBtn = document.getElementById('rsvpGcalBtn');
    var icalBtn = document.getElementById('rsvpIcalBtn');
    if (gcalBtn) gcalBtn.href = C.calendarUrls.google;
    if (icalBtn) {
      icalBtn.href = C.calendarUrls.apple;
      var dlName = ((couple.bride || 'bride') + '-' + (couple.groom || 'groom') + '-wedding.ics')
        .toLowerCase().replace(/\s+/g, '-');
      icalBtn.setAttribute('download', dlName);
    }
  }

  /* ── Closing section ── */
  var closingNames = document.querySelector('.closing-names');
  if (closingNames && couple.bride && couple.groom) {
    closingNames.textContent = couple.bride + ' & ' + couple.groom;
  }
  var closingDate = document.querySelector('.closing-date');
  if (closingDate && couple.date) closingDate.textContent = fmtDot(couple.date);

  /* ── Music ── */
  var audioEl = document.getElementById('bgMusic');
  if (audioEl) {
    if (music.enabled && music.src) audioEl.src = music.src;
    // Music toggle always visible — template always has a song (default or custom)
  }
})();


/* ═══════════════════════════════════
   RSVP form submission
═══════════════════════════════════ */
function initRSVPForm(endpoint) {
  var form = document.getElementById('rsvpForm');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = '1';
  var status = document.getElementById('rsvpStatus');
  var btn = form.querySelector('button[type="submit"]');
  var label = btn.querySelector('.rsvp-btn-inner');
  var guests = document.getElementById('rsvpGuestsField');
  var YES_NOTE = status.textContent;
  var NO_NOTE = 'We’ll truly miss you.';

  function setStatus(msg, state) {
    status.textContent = msg;
    status.dataset.state = state || '';
  }

  form.addEventListener('change', function (e) {
    if (e.target.name !== 'attending') return;
    var yes = e.target.value === 'Yes';
    guests.hidden = !yes;
    setStatus(yes ? YES_NOTE : NO_NOTE);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name;
    if (!name.value.trim()) {
      name.setAttribute('aria-invalid', 'true');
      name.focus();
      setStatus('Please tell us your name so we know who is coming.', 'error');
      return;
    }
    name.removeAttribute('aria-invalid');
    if (!endpoint) {
      setStatus("RSVPs aren't open just yet. Please try again in a little while.", 'error');
      return;
    }

    var data = new URLSearchParams(new FormData(form));
    if (data.get('attending') !== 'Yes') data.set('guests', '0');
    btn.disabled = true;
    label.textContent = 'SENDING…';
    setStatus('Sending your RSVP…');

    fetch(endpoint, { method: 'POST', body: data })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json || !json.ok) throw new Error((json && json.error) || 'rejected');
        var yes = data.get('attending') === 'Yes';
        form.reset();
        guests.hidden = false;
        label.textContent = 'RSVP RECEIVED';
        setStatus(yes
          ? 'Thank you! Your seat is saved. We can’t wait to celebrate with you.'
          : 'We’re heartbroken you can’t make it, but thank you for letting us know.', 'success');
        setTimeout(function () { btn.disabled = false; label.textContent = 'SEND MY RSVP'; }, 4000);
      })
      .catch(function () {
        btn.disabled = false;
        label.textContent = 'SEND MY RSVP';
        setStatus("We couldn't send your RSVP. Check your connection and tap Send again.", 'error');
      });
  });
}
