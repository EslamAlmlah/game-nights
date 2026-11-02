// Second batch of games: Pool, Color Clash, Crossword Race, Secret Word Race.
const T2 = (en, ar) => (App.lang === "ar" ? ar : en);
Object.assign(I18N.en, { normalMode: "Normal", chaosMode: "Chaos 🌪️" });
Object.assign(I18N.ar, { normalMode: "عادي", chaosMode: "فوضى 🌪️" });
const nl = ch => ({ "أ": "ا", "إ": "ا", "آ": "ا", "ة": "ه", "ى": "ي" }[ch] || ch).toLowerCase();
const letters = s => [...String(s || "").trim().replace(/[ً-ْـ\s]/g, "")].map(nl);

/* ---------- Pool ---------- */
const POOL = { W: 1000, H: 500, R: 14 };
POOL.pockets = [[0, 0], [500, -4], [1000, 0], [0, 500], [500, 504], [1000, 500]];

class PoolSim {
  constructor(balls) { this.b = balls.map(x => ({ ...x, vx: 0, vy: 0 })); this.potted = []; this.firstHit = null; this.steps = 0; }
  shoot(vx, vy) { const c = this.b.find(x => x.c === "cue"); c.vx = vx; c.vy = vy; }
  step() {
    const { W, H, R } = POOL, S = 4, live = this.b.filter(x => !x.in);
    for (let s = 0; s < S; s++) {
      for (const p of live) {
        if (p.in) continue;
        p.x += p.vx / S; p.y += p.vy / S;
        for (const [px, py] of POOL.pockets) {
          if ((p.x - px) ** 2 + (p.y - py) ** 2 < (px === 500 ? 24 : 30) ** 2) { p.in = true; p.vx = p.vy = 0; this.potted.push(p.id); break; }
        }
        if (p.in) continue;
        if (p.x < R) { p.x = R; p.vx = -p.vx * 0.85; } else if (p.x > W - R) { p.x = W - R; p.vx = -p.vx * 0.85; }
        if (p.y < R) { p.y = R; p.vy = -p.vy * 0.85; } else if (p.y > H - R) { p.y = H - R; p.vy = -p.vy * 0.85; }
      }
      for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
        const a = live[i], b = live[j];
        if (a.in || b.in) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 >= 4 * R * R || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        const ov = (2 * R - d) / 2;
        a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
        if (rel <= 0) continue;
        if (this.firstHit == null) { if (a.c === "cue") this.firstHit = b.c; else if (b.c === "cue") this.firstHit = a.c; }
        const imp = rel * 0.97;
        a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny;
      }
    }
    let moving = false;
    for (const p of live) {
      if (p.in) continue;
      p.vx *= 0.987; p.vy *= 0.987;
      if (p.vx * p.vx + p.vy * p.vy < 0.004) p.vx = p.vy = 0; else moving = true;
    }
    return moving && ++this.steps < 4000;
  }
  run() { while (this.step()); return this; }
  snapshot() { return this.b.map(({ id, c, x, y, in: i }) => ({ id, c, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, in: !!i })); }
}

const PoolUI = { done: -1, raf: 0, sim: null };
GAMES.pool = {
  icon: "🎱", diff: "hard", ptsTxt: { en: "Win 5", ar: "الفوز 5" },
  name: { en: "Pool Night", ar: "بلياردو" },
  desc: { en: "7 balls each in your colour, then the black. Pot your own to keep shooting. Drag back from anywhere and release to shoot.", ar: "7 طابات بلونك وبعدين السودا. إذا دخّلت طابتك بتكمل. اسحب لورا من أي مكان وأفلت لتضرب." },
  init() {
    const { R } = POOL, balls = [{ id: 0, c: "cue", x: 250, y: 250, in: false }];
    const order = shuffle(["mrb", "mrb", "mrb", "mrb", "mrb", "mrb", "mrb", "za3tr", "za3tr", "za3tr", "za3tr", "za3tr", "za3tr", "za3tr"]);
    let id = 1, k = 0;
    for (let row = 0; row < 5; row++) for (let i = 0; i <= row; i++) {
      const c = row === 2 && i === 1 ? "black" : order[k++];
      balls.push({ id: id++, c, x: 700 + row * (R * 1.75), y: 250 - row * R + i * 2 * R + (row ? 0 : 0), in: false });
    }
    return { balls, turn: firstPlayer(), shots: 0, anim: null, msg: null, result: null };
  },
  act(s, a, by) {
    if (s.result || a.k !== "shoot" || by !== s.turn) return;
    const vx = +a.vx, vy = +a.vy, sp = Math.hypot(vx, vy);
    if (!isFinite(sp) || sp < 1 || sp > 45) return;
    const before = s.balls.map(b => ({ ...b }));
    const left = c => s.balls.filter(b => b.c === c && !b.in).length;
    const myLeft = left(by);
    const sim = new PoolSim(before); sim.shoot(vx, vy); sim.run();
    s.balls = sim.snapshot();
    s.anim = { from: before, vx, vy, n: ++s.shots };
    const pot = sim.potted.map(id => s.balls.find(b => b.id === id).c);
    const scratch = pot.includes("cue"), foul = scratch || sim.firstHit == null;
    if (pot.includes("black")) {
      const w = myLeft === 0 && !scratch ? by : other(by);
      s.result = { winner: w, pts: { [w]: 5, [other(w)]: 0 } };
      s.msg = w === by ? T2("Black ball! 🏆", "الطابة السودا! 🏆") : T2("Black too early 😬", "السودا بكير 😬");
      return;
    }
    if (scratch) {
      const cue = s.balls.find(b => b.c === "cue"); cue.in = false; cue.y = 250;
      for (cue.x = 250; s.balls.some(b => b !== cue && !b.in && Math.hypot(b.x - cue.x, b.y - cue.y) < 2 * POOL.R + 1); cue.x -= 10);
    }
    const mine = pot.filter(c => c === by).length;
    if (foul) { s.turn = other(by); s.msg = scratch ? T2("Scratch! Cue ball potted.", "الطابة البيضا فاتت!") : T2("Missed everything.", "ما لمست ولا طابة."); }
    else if (mine) s.msg = T2(`Potted ${mine}! Shoot again.`, `دخّلت ${mine}! كمّل.`);
    else { s.turn = other(by); s.msg = null; }
  },
  view(s, me) {
    const left = c => s.balls.filter(b => b.c === c && !b.in).length;
    const dots = c => `<span class="pool-left" style="--pc:${PLAYERS[c].color}">${"●".repeat(left(c))}${left(c) ? "" : "⚫"}</span>`;
    return `<div class="scoreline">${tag("mrb")} ${dots("mrb")} <span class="vs">·</span> ${dots("za3tr")} ${tag("za3tr")}</div>
      <p class="turn ${s.turn === me ? "mine" : ""}">${s.result ? (s.msg || "") : (s.turn === me ? t("yourTurn") : t("theirTurn"))}${!s.result && s.msg ? ` · <span class="hot">${s.msg}</span>` : ""}</p>
      <canvas id="pool" width="1000" height="500"></canvas>
      <p class="muted small">${T2("Pull back from anywhere on the table, aim, release.", "اسحب لورا من أي مكان على الطاولة، صوّب وأفلت.")}</p>`;
  },
  mount(s, me) {
    const cv = $("#pool"); if (!cv) return;
    const ctx = cv.getContext("2d"), { R } = POOL;
    const col = { cue: "#fdfdf8", black: "#111", mrb: PLAYERS.mrb.color, za3tr: PLAYERS.za3tr.color };
    const draw = (balls, aim) => {
      ctx.fillStyle = "#0f6b45"; ctx.fillRect(0, 0, 1000, 500);
      ctx.fillStyle = "#000";
      POOL.pockets.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, Math.min(500, Math.max(0, y)), 26, 0, 7); ctx.fill(); });
      ctx.strokeStyle = "#ffffff22"; ctx.beginPath(); ctx.moveTo(250, 0); ctx.lineTo(250, 500); ctx.stroke();
      if (aim) {
        ctx.strokeStyle = "#ffffffaa"; ctx.setLineDash([10, 10]); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(aim.x, aim.y); ctx.lineTo(aim.x + aim.dx * 600, aim.y + aim.dy * 600); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = `hsl(${120 - aim.p * 120},90%,60%)`; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(aim.x - aim.dx * 30, aim.y - aim.dy * 30); ctx.lineTo(aim.x - aim.dx * (30 + aim.p * 220), aim.y - aim.dy * (30 + aim.p * 220)); ctx.stroke();
      }
      balls.filter(b => !b.in).forEach(b => {
        ctx.fillStyle = col[b.c]; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, 7); ctx.fill();
        ctx.fillStyle = "#ffffff55"; ctx.beginPath(); ctx.arc(b.x - 4, b.y - 4, 4, 0, 7); ctx.fill();
      });
    };
    cancelAnimationFrame(PoolUI.raf);
    if (s.anim && s.anim.n !== PoolUI.done) {
      // Replay the shot with the same physics, then settle on the host's final positions.
      PoolUI.done = s.anim.n;
      const sim = new PoolSim(s.anim.from); sim.shoot(s.anim.vx, s.anim.vy);
      const frame = () => {
        if (!$("#pool")) return;
        let go = sim.step() && sim.step();
        draw(sim.b);
        if (go) PoolUI.raf = requestAnimationFrame(frame); else { PoolUI.rolling = false; draw(App.live && App.live.s.balls || s.balls); }
      };
      PoolUI.rolling = true; frame();
    } else if (!PoolUI.rolling) draw(s.balls);
    if (s.result || s.turn !== me) return;
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 1000 / r.width, (e.clientY - r.top) * 500 / r.height]; };
    let start = null;
    const aimOf = e => {
      const cue = s.balls.find(b => b.c === "cue"); const [x, y] = pos(e);
      const dx = start[0] - x, dy = start[1] - y, d = Math.hypot(dx, dy);
      return d < 8 ? null : { x: cue.x, y: cue.y, dx: dx / d, dy: dy / d, p: Math.min(1, d / 320) };
    };
    cv.onpointerdown = e => { if (PoolUI.rolling) return; cv.setPointerCapture(e.pointerId); start = pos(e); };
    cv.onpointermove = e => { if (start) draw(s.balls, aimOf(e)); };
    cv.onpointerup = e => {
      if (!start) return;
      const a = aimOf(e); start = null;
      if (!a || a.p < 0.04) { draw(s.balls); return; }
      const sp = 3 + a.p * 40;
      Live.act({ k: "shoot", vx: Math.round(a.dx * sp * 1000) / 1000, vy: Math.round(a.dy * sp * 1000) / 1000 });
    };
    cv.onpointercancel = () => { start = null; draw(s.balls); };
  }
};

/* ---------- Color Clash (our own colour-matching card game) ---------- */
const CLASH_COLORS = { r: "#ff5d6c", y: "#ffd23f", g: "#2fd47c", b: "#5ab0ff" };
const CLASH_FACE = { freeze: "❄️", plus2: "+2", plus4: "+4", wild: "🌈", swap: "🔄", double: "✌️", aval: "🎲" };
const ClashUI = { wild: null };
GAMES.clash = {
  icon: "🌈", diff: "medium", ptsTxt: { en: "Win 3 · Chaos win 5", ar: "الفوز 3 · فوز الفوضى 5" },
  name: { en: "Color Clash", ar: "صراع الألوان" },
  desc: { en: "Match the colour or symbol and empty your hand first. Press \"One left!\" before your partner catches you. Chaos mode adds swaps, double plays, avalanches and stacking.", ar: "طابق اللون أو الرمز وخلّص ورقك أول. اضغط \"ضلّت وحدة!\" قبل ما شريكك يمسكك. وضع الفوضى فيه تبديل ورق ولعب مرتين وانهيار وتكديس." },
  options: [{ k: "mode", v: "normal", label: "normalMode" }, { k: "mode", v: "chaos", label: "chaosMode" }],
  deck(chaos) {
    const d = []; let id = 0;
    for (const c of "rygb") {
      d.push({ c, v: "0" });
      for (let n = 1; n <= 9; n++) d.push({ c, v: String(n) }, { c, v: String(n) });
      d.push({ c, v: "freeze" }, { c, v: "freeze" }, { c, v: "plus2" }, { c, v: "plus2" });
      if (chaos) d.push({ c, v: "swap" }, { c, v: "double" }, { c, v: "aval" });
      d.push({ c: "w", v: "wild" }, { c: "w", v: "plus4" });
    }
    if (chaos) d.push({ c: "w", v: "plus4" }, { c: "w", v: "plus4" });
    return shuffle(d).map(x => ({ ...x, id: id++ }));
  },
  init(o) {
    const chaos = o.mode === "chaos", deck = this.deck(chaos);
    const hand = { mrb: deck.splice(0, 7), za3tr: deck.splice(0, 7) };
    let i = deck.findIndex(c => /^\d$/.test(c.v)); const top = deck.splice(i, 1)[0];
    return { chaos, deck, pile: [top], color: top.c, hand, turn: firstPlayer(), pending: 0, any: false, drew: false, called: {}, exposed: null, log: null, result: null };
  },
  draw(s, p, n) {
    for (let i = 0; i < n; i++) {
      if (!s.deck.length) { const top = s.pile.pop(); s.deck = shuffle(s.pile).map(c => c.c === "w" ? { ...c } : c); s.pile = [top]; }
      if (!s.deck.length) return;
      s.hand[p].push(s.deck.pop());
    }
    if (s.hand[p].length > 2) s.called[p] = false;
  },
  canPlay(s, c) {
    if (s.pending) return c.v === "plus2" || c.v === "plus4";
    const top = s.pile[s.pile.length - 1];
    return s.any || c.c === "w" || c.c === s.color || c.v === top.v;
  },
  pass(s) { s.turn = other(s.turn); s.drew = false; s.any = false; },
  act(s, a, by) {
    if (s.result) return;
    const opp = other(by);
    if (a.k === "call") { if (s.hand[by].length <= 2) { s.called[by] = true; if (s.exposed === by) s.exposed = null; } return; }
    if (a.k === "catch") { if (s.exposed === opp) { this.draw(s, opp, 2); s.exposed = null; s.log = { who: by, txt: T2("caught them! +2", "مسكه! +2") }; } return; }
    if (by !== s.turn) return;
    if (a.k === "draw") {
      if (s.pending) { this.draw(s, by, s.pending); s.log = { who: by, txt: `+${s.pending} 😵` }; s.pending = 0; this.pass(s); }
      else if (!s.drew) { this.draw(s, by, 1); s.drew = true; }
      return;
    }
    if (a.k === "pass" && s.drew) { this.pass(s); return; }
    if (a.k !== "play") return;
    const i = s.hand[by].findIndex(c => c.id === a.id); if (i < 0) return;
    const card = s.hand[by][i];
    if (!this.canPlay(s, card)) return;
    if (card.c === "w" && !CLASH_COLORS[a.color]) return;
    s.hand[by].splice(i, 1); s.pile.push(card);
    s.color = card.c === "w" ? a.color : card.c;
    s.any = false; s.drew = false;
    s.log = { who: by, card };
    if (s.exposed === by) s.exposed = null;
    if (s.hand[by].length === 1 && !s.called[by]) s.exposed = by;
    if (!s.hand[by].length) {
      const w = s.chaos ? 5 : 3;
      s.result = { winner: by, pts: { [by]: w, [opp]: 0 } };
      return;
    }
    const v = card.v;
    if (v === "plus2" || v === "plus4") {
      const n = v === "plus2" ? 2 : 4;
      if (s.chaos) { s.pending += n; this.pass(s); }
      else { this.draw(s, opp, n); }            // opponent draws and is skipped: play again
    } else if (v === "freeze") { /* opponent skipped */ }
    else if (v === "double") s.any = true;
    else if (v === "swap") { [s.hand.mrb, s.hand.za3tr] = [s.hand.za3tr, s.hand.mrb]; s.called = {}; s.exposed = null; this.pass(s); }
    else if (v === "aval") { const n = 1 + Math.floor(Math.random() * 6); this.draw(s, opp, n); s.log.txt = `🎲 +${n}`; this.pass(s); }
    else this.pass(s);
  },
  cardHtml(c, attrs = "", cls = "") {
    const face = CLASH_FACE[c.v] || c.v;
    const bg = c.c === "w" ? "conic-gradient(#ff5d6c 0 25%,#ffd23f 0 50%,#2fd47c 0 75%,#5ab0ff 0)" : CLASH_COLORS[c.c];
    return `<button class="ccard ${cls}" style="--cc:${bg}" ${attrs}><span>${face}</span></button>`;
  },
  view(s, me) {
    const opp = other(me), top = s.pile[s.pile.length - 1], my = s.turn === me && !s.result;
    if (ClashUI.wild != null && !s.hand[me].some(c => c.id === ClashUI.wild)) ClashUI.wild = null;
    const backs = `<div class="cbacks">${"<i></i>".repeat(Math.min(s.hand[opp].length, 20))}<b>${s.hand[opp].length}</b></div>`;
    const lastTxt = s.log ? `<p class="muted small">${pname(s.log.who)}: ${s.log.card ? (CLASH_FACE[s.log.card.v] || s.log.card.v) : ""} ${s.log.txt || ""}</p>` : "";
    const hand = s.hand[me].slice().sort((a, b) => (a.c + a.v).localeCompare(b.c + b.v)).map(c => {
      const ok = my && this.canPlay(s, c);
      if (!ok) return this.cardHtml(c, "disabled", "dim");
      return this.cardHtml(c, c.c === "w" ? `data-clashwild="${c.id}"` : `data-a="${A({ k: "play", id: c.id })}"`);
    }).join("");
    const picker = ClashUI.wild != null && my ? `<div class="row">${Object.entries(CLASH_COLORS).map(([k, v]) =>
      `<button class="btn colorpick" style="background:${v}" data-a="${A({ k: "play", id: ClashUI.wild, color: k })}">&nbsp;</button>`).join("")}</div>` : "";
    const ctrl = [];
    if (my) ctrl.push(s.pending ? btn(`😵 +${s.pending}`, { k: "draw" }, "bad") : !s.drew ? btn("🂠 " + T2("Draw", "اسحب"), { k: "draw" }) : btn(T2("Pass", "مرّق"), { k: "pass" }));
    if (s.hand[me].length <= 2 && !s.called[me]) ctrl.push(btn("☝️ " + T2("One left!", "ضلّت وحدة!"), { k: "call" }, "primary"));
    if (s.exposed === opp) ctrl.push(btn("🫵 " + T2("Catch! They didn't call it", "مسكتك! ما قال"), { k: "catch" }, "good"));
    return `<div class="clash-top">${backs}<div class="pilebox">${this.cardHtml(top, "disabled", "big")}<span class="curcolor" style="background:${CLASH_COLORS[s.color]}"></span></div></div>
      ${lastTxt}${s.pending ? `<p class="hot">⚠️ +${s.pending}</p>` : ""}${s.any && my ? `<p class="hot">✌️ ${T2("Play any card", "العب أي ورقة")}</p>` : ""}
      <p class="turn ${my ? "mine" : ""}">${s.result ? "" : (my ? t("yourTurn") : t("theirTurn"))}</p>
      ${picker}<div class="chand">${hand}</div><div class="row">${ctrl.join("")}</div>`;
  }
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-clashwild]");
  if (!el) return;
  ClashUI.wild = +el.dataset.clashwild; UI.renderGame();
});

/* ---------- Crossword Race ---------- */
function buildCrossword(list, want = 8) {
  let best = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const pool = shuffle(list).slice(0, 18), grid = new Map(), dirs = new Map(), placed = [];
    const key = (r, c) => r + "," + c;
    const put = (w, r0, c0, d) => {
      const L = letters(w.w);
      L.forEach((ch, k) => { const r = r0 + (d === "d" ? k : 0), c = c0 + (d === "a" ? k : 0), K = key(r, c); grid.set(K, ch); if (!dirs.has(K)) dirs.set(K, new Set()); dirs.get(K).add(d); });
      placed.push({ ...w, r: r0, c: c0, d, len: L.length });
    };
    const bounds = () => { let a = [1e9, -1e9, 1e9, -1e9]; grid.forEach((_, K) => { const [r, c] = K.split(",").map(Number); a = [Math.min(a[0], r), Math.max(a[1], r), Math.min(a[2], c), Math.max(a[3], c)]; }); return a; };
    const fits = (L, r0, c0, d) => {
      let inter = 0;
      const at = k => [r0 + (d === "d" ? k : 0), c0 + (d === "a" ? k : 0)];
      const [br, bc] = at(-1), [ar, ac] = at(L.length);
      if (grid.has(key(br, bc)) || grid.has(key(ar, ac))) return false;
      for (let k = 0; k < L.length; k++) {
        const [r, c] = at(k), ex = grid.get(key(r, c));
        if (ex) { if (ex !== L[k] || dirs.get(key(r, c)).has(d)) return false; inter++; }
        else if (d === "a" ? grid.has(key(r - 1, c)) || grid.has(key(r + 1, c)) : grid.has(key(r, c - 1)) || grid.has(key(r, c + 1))) return false;
      }
      if (!inter) return false;
      const b = bounds(); const [er, ec] = at(L.length - 1);
      return Math.max(b[1], er) - Math.min(b[0], r0) < 12 && Math.max(b[3], ec) - Math.min(b[2], c0) < 12;
    };
    put(pool[0], 0, 0, "a");
    for (const w of pool.slice(1)) {
      if (placed.length >= want) break;
      const L = letters(w.w), opts = [];
      grid.forEach((ch, K) => {
        const [r, c] = K.split(",").map(Number);
        L.forEach((x, i) => { if (x !== ch) return; if (fits(L, r, c - i, "a")) opts.push([r, c - i, "a"]); if (fits(L, r - i, c, "d")) opts.push([r - i, c, "d"]); });
      });
      if (opts.length) { const [r, c, d] = rand(opts); put(w, r, c, d); }
    }
    if (!best || placed.length > best.placed.length) { const b = bounds(); best = { placed, b }; }
    if (placed.length >= want) break;
  }
  const [r0, , c0] = best.b;
  const words = best.placed.map(p => ({ w: p.w, clue: p.clue, r: p.r - r0, c: p.c - c0, d: p.d, len: p.len }));
  const starts = [...new Set(words.map(w => w.r * 100 + w.c))].sort((a, b) => a - b);
  words.forEach(w => { w.n = starts.indexOf(w.r * 100 + w.c) + 1; });
  words.sort((a, b) => a.d.localeCompare(b.d) || a.n - b.n);
  return { words, rows: best.b[1] - best.b[0] + 1, cols: best.b[3] - best.b[2] + 1 };
}

const CwUI = { sel: null };
GAMES.crossword = {
  icon: "📰", diff: "hard", ptsTxt: { en: "Win 4 · tie 2 each", ar: "الفوز 4 · التعادل 2 لكل واحد" },
  name: { en: "Crossword Race", ar: "سباق الكلمات المتقاطعة" },
  desc: { en: "One shared crossword. Pick a clue and type the answer. Whoever solves a word first claims it.", ar: "شبكة كلمات متقاطعة وحدة للاثنين. اختار تعريف واكتب الجواب، ويلي بيحلها أول بياخدها." },
  options: [{ k: "alpha", v: "ar", label: "arLetters" }, { k: "alpha", v: "en", label: "enLetters" }],
  init(o) {
    const alpha = o.alpha === "en" ? "en" : "ar";
    const list = DATA.cw[alpha].map(([w, clue]) => ({ w, clue })).concat(Custom.list("cw" + alpha).map(x => ({ w: x.w, clue: x.clue })));
    const cw = buildCrossword(list.filter(x => letters(x.w).length >= 3 && letters(x.w).length <= 9));
    return { alpha, ...cw, owner: cw.words.map(() => null), hints: cw.words.map(() => 0), wrong: null, sc: { mrb: 0, za3tr: 0 }, result: null };
  },
  act(s, a, by) {
    if (s.result) return;
    const w = s.words[a.w]; if (!w || s.owner[a.w]) return;
    if (a.k === "guess") {
      if (letters(a.v).join("") === letters(w.w).join("")) {
        s.owner[a.w] = by; s.sc[by]++; s.wrong = null;
        if (s.owner.every(Boolean)) s.result = winnerOf(s.sc, 4, 2);
      } else s.wrong = { who: by, w: a.w, v: String(a.v).slice(0, 20) };
    } else if (a.k === "hint" && s.hints[a.w] < w.len - 1) s.hints[a.w]++;
  },
  view(s, me) {
    const cells = {};
    s.words.forEach((w, i) => {
      const L = letters(w.w), show = s.owner[i] ? L.length : s.hints[i];
      L.forEach((ch, k) => {
        const K = (w.r + (w.d === "d" ? k : 0)) + "," + (w.c + (w.d === "a" ? k : 0));
        const cell = cells[K] || (cells[K] = { ch: "", own: null, n: null, sel: false });
        if (k < show || s.owner[i]) { cell.ch = [...w.w.replace(/\s/g, "")][k] || ch; }
        if (s.owner[i]) cell.own = s.owner[i];
        if (k === 0) cell.n = w.n;
        if (CwUI.sel === i) cell.sel = true;
      });
    });
    let g = "";
    for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) {
      const x = cells[r + "," + c];
      g += x ? `<i class="cw-cell ${x.sel ? "sel" : ""}" style="--pc:${x.own ? PLAYERS[x.own].color : "transparent"}">${x.n ? `<sup>${x.n}</sup>` : ""}${esc(x.ch)}</i>` : `<i class="cw-void"></i>`;
    }
    const clue = (w, i) => `<li class="${s.owner[i] ? "solved" : ""} ${CwUI.sel === i ? "on" : ""}" data-cwsel="${i}"><b>${w.n}</b> ${esc(w.clue)} <small>(${w.len})</small>${s.owner[i] ? ` ${PLAYERS[s.owner[i]].emoji}` : ""}</li>`;
    const across = s.words.map((w, i) => w.d === "a" ? clue(w, i) : "").join(""), down = s.words.map((w, i) => w.d === "d" ? clue(w, i) : "").join("");
    const sel = CwUI.sel != null && !s.owner[CwUI.sel] && !s.result ? `<div class="row cw-input"><b>${s.words[CwUI.sel].n}${s.words[CwUI.sel].d === "a" ? "→" : "↓"}</b>
      <input data-key="cw${CwUI.sel}" dir="auto" autocomplete="off" placeholder="${esc(s.words[CwUI.sel].clue)}">
      ${btn(t("send"), { k: "guess", w: CwUI.sel, from: "cw" + CwUI.sel }, "primary")}${btn("💡", { k: "hint", w: CwUI.sel })}</div>` : "";
    const wrong = s.wrong ? `<p class="muted small">${pname(s.wrong.who)}: ✗ ${esc(s.wrong.v)}</p>` : "";
    return `${scoreline(s.sc)}<div class="cw" dir="${s.alpha === "ar" ? "rtl" : "ltr"}" style="--cols:${s.cols}">${g}</div>${sel}${wrong}
      <div class="cw-clues" dir="${s.alpha === "ar" ? "rtl" : "ltr"}"><div><h4>${T2("Across", "أفقي")}</h4><ul>${across}</ul></div><div><h4>${T2("Down", "عمودي")}</h4><ul>${down}</ul></div></div>`;
  }
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-cwsel]");
  if (!el) return;
  CwUI.sel = +el.dataset.cwsel; UI.renderGame();
  const inp = $(`[data-key="cw${CwUI.sel}"]`); if (inp) inp.focus();
});

/* ---------- Secret Word Race (our own guess-the-word race) ---------- */
GAMES.wordrace = {
  icon: "🟩", diff: "medium", ptsTxt: { en: "Solve in n guesses: 8 − n points, +2 for the faster solver", ar: "الحل بـ n محاولة: 8 − n نقاط، و+2 للأسرع" },
  name: { en: "Secret Word Race", ar: "سباق الكلمة السرية" },
  desc: { en: "Same secret word (Arabic: 4 or 5 letters), two boards, 7 tries. 🟩 right spot, 🟨 in the word, ⬛ not in it. You only see your partner's colours.", ar: "نفس الكلمة السرية (عربي: 4 أو 5 أحرف)، لوحتين، 7 محاولات. 🟩 مكانه صح، 🟨 موجود بالكلمة، ⬛ مش موجود. بتشوف ألوان شريكك بس." },
  options: [{ k: "alpha", v: "ar", label: "arLetters" }, { k: "alpha", v: "en", label: "enLetters" }],
  max: 7,
  init(o) {
    const alpha = o.alpha === "en" ? "en" : "ar", ok = n => alpha === "en" ? n === 5 : n === 4 || n === 5;
    const list = DATA.wr[alpha].concat(Custom.list("wr" + alpha).map(x => x.w)).filter(w => ok(letters(w).length));
    const secret = Fresh.pick("wr" + alpha, list, 1)[0];
    return { alpha, len: letters(secret).length, secret, g: { mrb: [], za3tr: [] }, solved: {}, at: {}, result: null };
  },
  score(guess, secret) {
    const fb = guess.map(() => 0), left = {};
    secret.forEach((ch, i) => { if (guess[i] === ch) fb[i] = 2; else left[ch] = (left[ch] || 0) + 1; });
    guess.forEach((ch, i) => { if (!fb[i] && left[ch]) { fb[i] = 1; left[ch]--; } });
    return fb;
  },
  act(s, a, by) {
    if (s.result || a.k !== "guess") return;
    const done = p => s.solved[p] || s.g[p].length >= this.max;
    if (done(by)) return;
    const L = letters(a.v); if (L.length !== s.len) return;
    const fb = this.score(L, letters(s.secret));
    s.g[by].push({ w: L.join(""), fb });
    if (fb.every(x => x === 2)) { s.solved[by] = s.g[by].length; s.at[by] = Date.now(); }
    if (done("mrb") && done("za3tr")) {
      const pts = { mrb: s.solved.mrb ? 8 - s.solved.mrb : 0, za3tr: s.solved.za3tr ? 8 - s.solved.za3tr : 0 };
      const solvers = ["mrb", "za3tr"].filter(p => s.solved[p]).sort((x, y) => s.solved[x] - s.solved[y] || s.at[x] - s.at[y]);
      if (solvers.length) pts[solvers[0]] += 2;
      s.result = { winner: pts.mrb === pts.za3tr ? "tie" : (pts.mrb > pts.za3tr ? "mrb" : "za3tr"), pts };
    }
  },
  view(s, me) {
    const opp = other(me), sq = ["⬛", "🟨", "🟩"];
    const board = (p, showLetters) => {
      let rows = s.g[p].map(r => `<div class="wr-row">${[...r.w].map((ch, i) => `<i class="f${r.fb[i]}">${showLetters ? esc(ch) : ""}</i>`).join("")}</div>`).join("");
      for (let k = s.g[p].length; k < this.max; k++) rows += `<div class="wr-row">${"<i></i>".repeat(s.len)}</div>`;
      return `<div class="wr-board" dir="${s.alpha === "ar" ? "rtl" : "ltr"}">${rows}</div>`;
    };
    const status = new Map();
    s.g[me].forEach(r => [...r.w].forEach((ch, i) => status.set(ch, Math.max(status.get(ch) ?? -1, r.fb[i]))));
    const used = [...status].map(([ch, v]) => `<span class="f${v}">${esc(ch)}</span>`).join("");
    const done = s.solved[me] || s.g[me].length >= this.max;
    const input = done ? (s.result ? "" : `${s.solved[me] ? `<p class="hot">🎉 ${s.solved[me]}/7</p>` : ""}${waitNote()}`)
      : `<div class="row"><input data-key="wr${s.g[me].length}" dir="auto" maxlength="${s.len + 2}" autocomplete="off" autocapitalize="off" placeholder="${"_ ".repeat(s.len)}">${btn(t("send"), { k: "guess", from: "wr" + s.g[me].length }, "primary")}</div>`;
    return `<div class="wr-wrap"><div><small>${tag(me)}</small>${board(me, true)}</div><div class="wr-opp"><small>${tag(opp)}</small>${board(opp, false)}</div></div>
      <div class="wr-used" dir="auto">${used}</div>${input}
      ${s.result ? `<p>${T2("The word was", "الكلمة كانت")}: <b class="big-word">${esc(s.secret)}</b></p>` : ""}`;
  }
};

GAME_ORDER.push("pool", "clash", "crossword", "wordrace");
BADGES.push(
  { id: "pool", e: "🎱", n: { en: "Pool Shark", ar: "قرش البلياردو" }, d: { en: "Win 3 pool games", ar: "اربح 3 ألعاب بلياردو" }, ok: id => Stats.wins(id, "pool") >= 3 },
  { id: "clash", e: "🌈", n: { en: "Clash King", ar: "ملك الألوان" }, d: { en: "Win 3 Color Clash games", ar: "اربح 3 ألعاب صراع الألوان" }, ok: id => Stats.wins(id, "clash") >= 3 },
  { id: "cw", e: "📰", n: { en: "Puzzle Master", ar: "سيد الألغاز" }, d: { en: "Win 3 crosswords", ar: "اربح 3 كلمات متقاطعة" }, ok: id => Stats.wins(id, "crossword") >= 3 },
  { id: "wr", e: "🟩", n: { en: "Word Wizard", ar: "ساحر الكلمات" }, d: { en: "Win 3 Secret Word Races", ar: "اربح 3 سباقات كلمة سرية" }, ok: id => Stats.wins(id, "wordrace") >= 3 }
);
