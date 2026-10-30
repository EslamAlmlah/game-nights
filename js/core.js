// Core: helpers, shared store, peer-to-peer link, live game engine.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const rand = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const other = id => (id === "mrb" ? "za3tr" : "mrb");
const PLAYERS = {
  mrb: { name: "Mr.B", emoji: "🦁", color: "#5ab0ff" },
  za3tr: { name: "Za3tr", emoji: "🌿", color: "#ff8fb3" }
};
// ?slot=x keeps separate saved data per tab, for testing two players in one browser.
const LS_PREFIX = "gn." + (new URLSearchParams(location.search).get("slot") || "") + ".";
const LS = {
  get(k, d) { try { const v = localStorage.getItem(LS_PREFIX + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)); } catch (e) {} }
};
// Loose comparison for typed answers in Arabic and English.
const norm = s => String(s || "").toLowerCase().trim()
  .replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
  .replace(/^ال/, "").replace(/^the\s+/, "").replace(/[^\p{L}\p{N}]/gu, "");

const App = {
  me: LS.get("me", null),
  code: LS.get("code", null),
  lang: LS.get("lang", (navigator.language || "").startsWith("ar") ? "ar" : "en"),
  store: null,
  live: null,       // { gid, s, ver }
  partner: null,    // partner's player id once connected
  skew: 0,          // host clock minus our clock (guest only)
  tab: "home"
};
const t = k => (I18N[App.lang] && I18N[App.lang][k]) || I18N.en[k] || k;
const L = o => (o ? (o[App.lang] || o.en) : "");
const pname = id => PLAYERS[id] ? PLAYERS[id].name : (id === "tie" ? t("tie") : id);
const hostNow = () => Date.now() + App.skew;

/* ---------- Shared store (merged on both devices) ---------- */
const emptyStore = () => ({ history: [], nights: [], current: { id: null, u: 0 }, next: { at: null, u: 0 } });
App.store = Object.assign(emptyStore(), LS.get("store", {}));

function mergeStore(a, b) {
  const out = emptyStore();
  const hist = new Map();
  [...(a.history || []), ...(b.history || [])].forEach(h => hist.set(h.id, h));
  out.history = [...hist.values()].sort((x, y) => x.ts - y.ts);
  const nights = new Map();
  [...(a.nights || []), ...(b.nights || [])].forEach(n => {
    const cur = nights.get(n.id);
    if (!cur || (n.u || 0) > (cur.u || 0)) nights.set(n.id, n);
  });
  out.nights = [...nights.values()].sort((x, y) => x.start - y.start);
  out.current = (b.current && b.current.u > (a.current ? a.current.u : 0)) ? b.current : (a.current || out.current);
  out.next = (b.next && b.next.u > (a.next ? a.next.u : 0)) ? b.next : (a.next || out.next);
  return out;
}

function saveStore() { LS.set("store", App.store); }

// Change the shared store locally, then push it to the partner.
function commit(mut) {
  mut(App.store);
  saveStore();
  Net.send({ t: "store", store: App.store });
  UI.render();
}

function receiveStore(incoming) {
  const before = new Set(App.store.history.map(h => h.id));
  App.store = mergeStore(App.store, incoming);
  saveStore();
  App.store.history.filter(h => !before.has(h.id)).forEach(h => UI.announce(h));
  UI.render();
}

function currentNight() {
  const id = App.store.current && App.store.current.id;
  return id ? App.store.nights.find(n => n.id === id) : null;
}
const themeOf = night => night ? DATA.themes.find(x => x.id === night.theme) : null;

// Record points. Only the host awards for live games, so nothing is counted twice.
function award(gid, res) {
  const night = currentNight();
  const th = themeOf(night);
  const mult = th && th.featured.includes(gid) ? 2 : 1;
  const p = { mrb: (res.pts.mrb || 0) * mult, za3tr: (res.pts.za3tr || 0) * mult };
  const entry = { id: uid(), ts: Date.now(), g: gid, n: night ? night.id : null, p, w: res.winner, m: mult, note: res.note || "" };
  commit(st => st.history.push(entry));
  UI.announce(entry);
  return p;
}

/* ---------- Network: PeerJS peer-to-peer, BroadcastChannel for local testing ---------- */
const Net = {
  status: "offline", open: false, isHost: false, peer: null, conn: null, timer: null,
  local: new URLSearchParams(location.search).has("local"),

  setStatus(s) { this.status = s; UI.renderStatus(); },

  start() {
    if (!App.code || !App.me) return;
    this.stop();
    if (this.local) return this.startLocal();
    if (!window.Peer) { this.setStatus("offline"); return; }
    this.becomeHost();
  },

  stop() {
    clearTimeout(this.timer);
    try { this.conn && this.conn.close(); } catch (e) {}
    try { this.peer && this.peer.destroy(); } catch (e) {}
    try { this.bc && this.bc.close(); } catch (e) {}
    this.conn = this.peer = this.bc = null; this.open = false;
  },

  hostId() { return "gamenight-" + String(App.code).toLowerCase().replace(/[^a-z0-9]/g, "") + "-host"; },

  // Whoever opens first claims the host id; the second device joins it.
  becomeHost() {
    this.setStatus("connecting");
    const p = new Peer(this.hostId(), { debug: 0 });
    this.peer = p;
    p.on("open", () => { if (this.peer !== p) return; this.isHost = true; this.setStatus("waiting"); });
    p.on("connection", c => { if (this.conn) try { this.conn.close(); } catch (e) {} this.attach(c); });
    p.on("disconnected", () => { if (this.peer === p) try { p.reconnect(); } catch (e) {} });
    p.on("error", e => {
      if (this.peer !== p) return;
      if (e.type === "unavailable-id") { p.destroy(); this.becomeGuest(); }
      else if (e.type !== "peer-unavailable") this.retry();
    });
  },

  becomeGuest() {
    this.setStatus("connecting");
    const p = new Peer({ debug: 0 });
    this.peer = p; this.isHost = false;
    p.on("open", () => {
      if (this.peer !== p) return;
      this.attach(p.connect(this.hostId(), { reliable: true }));
      this.timer = setTimeout(() => { if (!this.open && this.peer === p) this.retry(); }, 12000);
    });
    p.on("error", e => { if (this.peer === p) this.retry(e.type === "peer-unavailable" ? 800 : 3000); });
  },

  retry(ms = 3000) {
    this.stop();
    this.setStatus("connecting");
    this.timer = setTimeout(() => this.start(), ms + Math.random() * 800);
  },

  attach(c) {
    this.conn = c;
    c.on("open", () => { this.open = true; clearTimeout(this.timer); this.setStatus("connected"); this.hello(); });
    c.on("data", m => onMessage(m));
    const lost = () => {
      if (this.conn !== c) return;
      this.open = false; this.conn = null; App.partner = null;
      if (this.isHost) this.setStatus("waiting"); else this.retry(1000);
    };
    c.on("close", lost); c.on("error", lost);
  },

  startLocal() {
    const bc = new BroadcastChannel("gn-" + App.code); this.bc = bc;
    const myId = uid(); let decided = false;
    bc.onmessage = e => {
      const m = e.data;
      if (m.to && m.to !== myId) return;
      if (m.sys === "who" && this.isHost) bc.postMessage({ sys: "iam", from: myId, to: m.from });
      else if (m.sys === "iam" && !decided) {
        decided = true; this.isHost = false; this.open = true; this.setStatus("connected");
        bc.postMessage({ sys: "join", from: myId, to: m.from }); this.hello();
      } else if (m.sys === "join") { this.open = true; this.setStatus("connected"); this.hello(); }
      else if (m.data && m.from !== myId) onMessage(m.data);
    };
    this._localSend = m => bc.postMessage({ data: m, from: myId });
    bc.postMessage({ sys: "who", from: myId });
    setTimeout(() => { if (!decided) { decided = true; this.isHost = true; this.setStatus("waiting"); } }, 400);
  },

  send(m) {
    if (!this.open) return;
    if (this.local) { this._localSend && this._localSend(m); return; }
    try { this.conn && this.conn.send(m); } catch (e) {}
  },

  hello() {
    this.send({ t: "hello", who: App.me, now: Date.now(), store: App.store, live: this.isHost ? App.live : undefined });
  }
};

function onMessage(m) {
  if (!m || !m.t) return;
  if (m.t === "hello") {
    App.partner = m.who;
    if (!Net.isHost) {
      App.skew = m.now - Date.now();
      if (m.live !== undefined) { App.live = m.live; UI.liveChanged(); }
    }
    receiveStore(m.store || {});
    // Make sure the partner gets anything only we had.
    Net.send({ t: "store", store: App.store });
    UI.renderStatus();
  } else if (m.t === "store") receiveStore(m.store);
  else if (m.t === "live" && !Net.isHost) { App.live = m.live; UI.liveChanged(); }
  else if (m.t === "intent" && Net.isHost) Live.apply(m.a, m.by);
  else if (m.t === "fx") Live.fx(m.fx, false);
}

// Reconnect when a phone wakes up.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !Net.open && App.code && App.me && !Net.local) Net.retry(200);
});

/* ---------- Live games: the host owns the state, the guest sends intents ---------- */
const Live = {
  start(gid, opts) { this.act({ sys: "start", gid, opts: opts || {} }); },
  quit() { this.act({ sys: "quit" }); },
  act(a) {
    if (Net.isHost || !Net.open) this.apply(a, App.me);
    else Net.send({ t: "intent", a, by: App.me });
  },
  apply(a, by) {
    if (a.sys === "start") {
      const G = GAMES[a.gid];
      App.live = { gid: a.gid, s: G.init(a.opts || {}), ver: (App.live ? App.live.ver : 0) + 1 };
    } else if (a.sys === "quit") {
      App.live = null;
    } else if (App.live) {
      const G = GAMES[App.live.gid];
      G.act(App.live.s, a, by);
      this.settle();
      App.live.ver++;
    }
    this.broadcast();
  },
  settle() {
    const s = App.live && App.live.s;
    if (s && s.result && !s.final) s.final = award(App.live.gid, s.result);
  },
  broadcast() { Net.send({ t: "live", live: App.live }); UI.liveChanged(); },
  // Ephemeral effects (drawing strokes) go straight to both screens.
  fx(f, mine) {
    if (mine) { Net.send({ t: "fx", fx: f }); if (f.k !== "clear") return; }
    const G = App.live && GAMES[App.live.gid];
    if (G && G.fx) G.fx(f);
  }
};

// Host clock for timed games.
setInterval(() => {
  if (!App.live || !(Net.isHost || !Net.open)) return;
  const G = GAMES[App.live.gid];
  if (G.tick && G.tick(App.live.s, Date.now())) { Live.settle(); App.live.ver++; Live.broadcast(); }
}, 500);

/* ---------- Stats, badges, streaks ---------- */
const Stats = {
  totals(filter) {
    const tot = { mrb: 0, za3tr: 0 };
    App.store.history.filter(filter || (() => true)).forEach(h => { tot.mrb += h.p.mrb || 0; tot.za3tr += h.p.za3tr || 0; });
    return tot;
  },
  month() {
    const d = new Date(); const m = d.getMonth(), y = d.getFullYear();
    return this.totals(h => { const x = new Date(h.ts); return x.getMonth() === m && x.getFullYear() === y; });
  },
  wins(id, g) { return App.store.history.filter(h => h.w === id && (!g || h.g === g)).length; },
  gamePts(id, g) { return App.store.history.filter(h => h.g === g).reduce((a, h) => a + (h.p[id] || 0), 0); },
  bestRun(id) {
    let run = 0, best = 0;
    App.store.history.filter(h => h.g !== "bonus" && h.w && h.w !== "team").forEach(h => { run = h.w === id ? run + 1 : 0; best = Math.max(best, run); });
    return best;
  },
  nightsWon(id) { return App.store.history.filter(h => h.g === "bonus" && h.w === id).length; },
  weekKey(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); },
  streak() {
    const weeks = new Set(App.store.nights.map(n => this.weekKey(n.start)));
    const WEEK = 7 * 864e5;
    let w = this.weekKey(Date.now());
    if (!weeks.has(w)) w -= WEEK;
    let n = 0;
    while (weeks.has(w)) { n++; w -= WEEK; }
    return n;
  }
};

const BADGES = [
  { id: "first", e: "🏅", n: { en: "First Blood", ar: "أول دم" }, d: { en: "Win your first game", ar: "اربح أول لعبة" }, ok: id => Stats.wins(id) >= 1 },
  { id: "fire", e: "🔥", n: { en: "On Fire", ar: "مولّع" }, d: { en: "Win 3 games in a row", ar: "اربح 3 ألعاب ورا بعض" }, ok: id => Stats.bestRun(id) >= 3 },
  { id: "c100", e: "💯", n: { en: "Centurion", ar: "المئوي" }, d: { en: "Reach 100 points", ar: "اوصل لـ 100 نقطة" }, ok: id => Stats.totals()[id] >= 100 },
  { id: "c500", e: "💎", n: { en: "Legend", ar: "أسطورة" }, d: { en: "Reach 500 points", ar: "اوصل لـ 500 نقطة" }, ok: id => Stats.totals()[id] >= 500 },
  { id: "brain", e: "🧠", n: { en: "Brainiac", ar: "العبقري" }, d: { en: "Win 3 trivia duels", ar: "اربح 3 مبارزات أسئلة" }, ok: id => Stats.wins(id, "trivia") >= 3 },
  { id: "xo", e: "⭕", n: { en: "XO Ninja", ar: "نينجا XO" }, d: { en: "Win 5 Vanishing XO games", ar: "اربح 5 ألعاب XO المختفية" }, ok: id => Stats.wins(id, "xo") >= 5 },
  { id: "card", e: "🃏", n: { en: "Card Shark", ar: "قرش الورق" }, d: { en: "Win 3 Underdog Duels", ar: "اربح 3 مبارزات المستضعف" }, ok: id => Stats.wins(id, "cards") >= 3 },
  { id: "box", e: "📦", n: { en: "Box Boss", ar: "ملك المربعات" }, d: { en: "Win 3 Box Claim games", ar: "اربح 3 ألعاب المربعات" }, ok: id => Stats.wins(id, "dots") >= 3 },
  { id: "word", e: "🔤", n: { en: "Wordsmith", ar: "سيد الكلمات" }, d: { en: "Win 3 Letter Rush rounds", ar: "اربح 3 جولات سباق الحروف" }, ok: id => Stats.wins(id, "rush") >= 3 },
  { id: "mind", e: "🔮", n: { en: "Mind Reader", ar: "قارئ الأفكار" }, d: { en: "Win 3 Know-Me games", ar: "اربح 3 ألعاب بتعرفني؟" }, ok: id => Stats.wins(id, "knowme") >= 3 },
  { id: "art", e: "🎨", n: { en: "Picasso", ar: "بيكاسو" }, d: { en: "Earn 20 points in Doodle Duo", ar: "اجمع 20 نقطة بالرسم" }, ok: id => Stats.gamePts(id, "doodle") >= 20 },
  { id: "dare", e: "💪", n: { en: "Daredevil", ar: "الجريء" }, d: { en: "Earn 25 points from challenges", ar: "اجمع 25 نقطة من التحديات" }, ok: id => Stats.gamePts(id, "challenge") >= 25 },
  { id: "soul", e: "💞", n: { en: "Soulmates", ar: "توأم الروح" }, d: { en: "Get the soulmates bonus", ar: "خدوا بونص توأم الروح" }, ok: () => App.store.history.some(h => h.note === "soulmates") },
  { id: "owl", e: "🦉", n: { en: "Night Champion", ar: "بطل السهرات" }, d: { en: "Win 3 game nights", ar: "اربح 3 سهرات" }, ok: id => Stats.nightsWon(id) >= 3 },
  { id: "reg", e: "📅", n: { en: "Regulars", ar: "الدوّامين" }, d: { en: "Play 5 game nights", ar: "العبوا 5 سهرات" }, ok: () => App.store.nights.filter(n => n.end).length >= 5 },
  { id: "streak", e: "⚡", n: { en: "Unstoppable", ar: "ما في شي بيوقفنا" }, d: { en: "4-week streak", ar: "4 أسابيع ورا بعض" }, ok: () => Stats.streak() >= 4 }
];
