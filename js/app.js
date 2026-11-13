// Screens and interaction.
const UI = {
  drafts: {}, hideLive: false, lastLiveKey: null, pickTheme: false, memoryFor: null,

  render() {
    document.documentElement.lang = App.lang;
    document.documentElement.dir = App.lang === "ar" ? "rtl" : "ltr";
    this.applyTheme();
    const root = $("#app");
    const keep = this.snapshot();
    if (!App.me || !App.code) root.innerHTML = this.setup();
    else if (App.live && !this.hideLive) root.innerHTML = this.header() + `<main class="wrap game-screen">${this.game()}</main>`;
    else root.innerHTML = this.header() + `<main class="wrap">${this[App.tab]()}</main>` + this.nav();
    this.restore(keep);
    this.afterRender();
  },

  renderGame() { if (App.live && !this.hideLive) this.render(); },
  renderStatus() { const el = $("#status"); if (el) el.outerHTML = this.status(); else this.render(); },

  liveChanged() {
    const key = App.live ? App.live.gid + ":" + (App.live.s && App.live.s.result ? "end" : "on") : null;
    // Pull both players into a newly started game.
    if (App.live && key !== this.lastLiveKey && !(App.live.s && App.live.s.result)) {
      this.hideLive = false;
      Object.keys(this.drafts).filter(k => /^(rw|km|dg)/.test(k)).forEach(k => delete this.drafts[k]);
    }
    this.lastLiveKey = key;
    if (!App.live) this.hideLive = false;
    this.render();
  },

  // Keep typed text and focus across re-renders.
  snapshot() {
    const a = document.activeElement;
    return a && a.dataset && a.dataset.key ? { key: a.dataset.key, s: a.selectionStart, e: a.selectionEnd } : null;
  },
  restore(keep) {
    $$("[data-key]").forEach(el => { if (this.drafts[el.dataset.key] != null) el.value = this.drafts[el.dataset.key]; });
    if (keep) {
      const el = $(`[data-key="${keep.key}"]`);
      if (el) { el.focus(); try { el.setSelectionRange(keep.s, keep.e); } catch (e) {} }
    }
  },

  applyTheme() {
    const th = themeOf(currentNight());
    const r = document.documentElement.style;
    r.setProperty("--accent", th ? th.accent : "#ffb547");
    r.setProperty("--accent2", th ? th.accent2 : "#2a2060");
  },

  /* ---------- pieces ---------- */
  status() {
    const s = Net.status;
    const same = Net.open && App.partner === App.me;
    const label = same ? "⚠️ " + (App.lang === "ar" ? "الاثنين نفس اللاعب!" : "Both picked the same player!")
      : s === "connected" ? `${t("connected")} · ${App.partner ? PLAYERS[App.partner].emoji : ""}`
      : s === "waiting" ? t("waiting") : s === "connecting" ? t("connecting") : t("offline");
    return `<span id="status" class="pill ${same ? "bad" : s}">${label}</span>`;
  },

  header() {
    const me = PLAYERS[App.me];
    const tot = Stats.totals();
    return `<header class="top"><div class="brand">🎮 <b>${t("appName")}</b></div>
      <div class="mini-score">${PLAYERS.mrb.emoji} ${tot.mrb} <span>·</span> ${tot.za3tr} ${PLAYERS.za3tr.emoji}</div>
      ${this.status()}<button class="iconbtn" data-local="lang" title="${t("language")}">${App.lang === "ar" ? "EN" : "ع"}</button>
      <span class="me" style="--pc:${me.color}" title="${me.name}">${me.emoji}</span></header>`;
  },

  nav() {
    const tabs = [["home", "🏠"], ["games", "🎲"], ["board", "🏆"], ["nights", "📖"], ["more", "⚙️"]];
    return `<nav class="tabs">${tabs.map(([k, i]) => `<button class="${App.tab === k ? "on" : ""}" data-tab="${k}"><span>${i}</span>${t(k === "board" ? "board" : k)}</button>`).join("")}</nav>`;
  },

  tug(tot) {
    const sum = tot.mrb + tot.za3tr;
    const pct = sum ? Math.round(100 * tot.mrb / sum) : 50;
    const lead = tot.mrb === tot.za3tr ? null : (tot.mrb > tot.za3tr ? "mrb" : "za3tr");
    return `<div class="tug"><div class="tug-names"><span>${PLAYERS.mrb.emoji} ${PLAYERS.mrb.name} <b>${tot.mrb}</b></span><span><b>${tot.za3tr}</b> ${PLAYERS.za3tr.name} ${PLAYERS.za3tr.emoji}</span></div>
      <div class="tug-bar"><i style="width:${pct}%"></i></div>
      <p class="crown">${lead ? `👑 ${PLAYERS[lead].name} ${t("crown")} (+${Math.abs(tot.mrb - tot.za3tr)})` : `🤝 ${t("tied")}`}</p></div>`;
  },

  /* ---------- tabs ---------- */
  home() {
    const night = currentNight(), th = themeOf(night);
    let nightCard;
    if (night) {
      const nt = Stats.totals(h => h.n === night.id);
      nightCard = `<section class="card night" style="--ta:${th.accent}"><div class="night-head"><span class="big-emoji">${th.emoji}</span><div><small>${t("tonight")}</small><h2>${esc(L(th.name))}</h2></div></div>
        <p><b>${t("rule")}:</b> ${esc(L(th.rule))}</p><p><b>${t("vibe")}:</b> ${esc(L(th.vibe))}</p>
        <p><b>${t("featured")} ×2:</b> ${th.featured.map(g => `<button class="chip" data-start="${g}">${GAMES[g].icon} ${esc(L(GAMES[g].name))}</button>`).join(" ")}</p>
        ${night.twist != null ? `<p><b>🎭 ${App.lang === "ar" ? "تويست الليلة" : "Tonight's twist"}:</b> ${esc(L(DATA.twists[night.twist % DATA.twists.length]))}</p>` : ""}
        ${night.lucky && GAMES[night.lucky] ? `<p><b>🍀 ${App.lang === "ar" ? "لعبة الحظ ×3" : "Lucky game ×3"}:</b> <button class="chip" data-start="${night.lucky}">${GAMES[night.lucky].icon} ${esc(L(GAMES[night.lucky].name))}</button></p>` : ""}
        ${night.stake ? `<p class="stake">🏆 ${App.lang === "ar" ? "الرابح بياخد" : "Winner gets"}: <b>${esc(night.stake)}</b></p>`
          : `<div class="row"><input data-key="stake" placeholder="🏆 ${App.lang === "ar" ? "على شو الرهان؟ (مثلاً: الخسران بيطبخ لما نلتقي)" : "What's at stake? (e.g. loser cooks when we meet)"}"><button class="btn" data-local="setstake">${t("save")}</button></div>`}
        <h4>${t("nightScore")}</h4>${scoreline(nt)}
        <div class="row"><button class="btn primary" data-local="spin">🎡 ${t("spin")}</button><button class="btn ghost" data-local="endnight">🏁 ${t("endNight")}</button></div></section>`;
    } else if (this.pickTheme) {
      nightCard = `<section class="card"><h3>${t("startNight")}</h3><div class="themes">${DATA.themes.map(x =>
        `<button class="theme" style="--ta:${x.accent};--tb:${x.accent2}" data-theme="${x.id}"><span>${x.emoji}</span><b>${esc(L(x.name))}</b><small>${x.featured.map(g => GAMES[g].icon).join(" ")} ×2</small></button>`).join("")}
        <button class="theme" style="--ta:#999;--tb:#333" data-theme="random"><span>🎲</span><b>${App.lang === "ar" ? "مفاجأة" : "Surprise me"}</b><small>?</small></button></div>
        <button class="btn ghost" data-local="cancelTheme">${t("cancel")}</button></section>`;
    } else {
      nightCard = `<section class="card cta"><button class="btn primary huge" data-local="pickTheme">✨ ${t("startNight")}</button><p class="muted small">${t("hostNote")}</p></section>`;
    }
    return `${nightCard}${this.countdownCard()}
      <section class="card">${this.tug(Stats.totals())}
      <div class="stats3"><div><b>${Stats.streak()}🔥</b><small>${t("streak")}</small></div><div><b>${App.store.nights.filter(n => n.end).length}</b><small>${t("nightsPlayed")}</small></div>
      <div><b>${App.store.history.filter(h => h.g !== "bonus").length}</b><small>${t("games")}</small></div></div></section>
      <section class="card"><div class="row"><button class="btn" data-tab="games">🎲 ${t("games")}</button><button class="btn" data-local="spin">🎡 ${t("spin")}</button><button class="btn" data-local="outside">📝 ${t("logOutside")}</button></div></section>`;
  },

  countdownCard() {
    const at = App.store.next && App.store.next.at;
    const fmt = tz => new Date(at).toLocaleString(App.lang === "ar" ? "ar-SY" : "en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz });
    return `<section class="card countdown"><h3>⏳ ${t("nextNight")}</h3>
      ${at ? `<div class="cd" data-at="${at}">${this.cdText(at)}</div>
      <p class="muted small">${t("yourTime")}: ${fmt(undefined)} · ${t("damascusTime")}: ${fmt("Asia/Damascus")}</p>` : `<p class="muted">${t("noNext")}</p>`}
      <div class="row"><button class="btn" data-local="setnext">📅 ${t("setNext")}</button>${at ? `<button class="btn" data-local="ics">🔔 ${t("addCal")}</button>` : ""}</div></section>`;
  },

  cdText(at) {
    let ms = new Date(at).getTime() - Date.now();
    if (ms <= 0) return ms > -6 * 3600e3 ? `<span class="hot">${t("itsTime")}</span>` : `<span class="muted">—</span>`;
    const d = Math.floor(ms / 864e5); ms %= 864e5;
    const h = Math.floor(ms / 36e5); ms %= 36e5;
    const m = Math.floor(ms / 6e4), s = Math.floor(ms % 6e4 / 1000);
    return [[d, t("days")], [h, t("hours")], [m, t("mins")], [s, t("secs")]].map(([v, u]) => `<span><b>${v}</b>${u}</span>`).join("");
  },

  games() {
    const th = themeOf(currentNight());
    const diffLabel = { easy: t("easy"), medium: t("medium"), hard: t("hard"), mixed: t("mixed"), coop: t("coop") };
    return `<div class="row"><button class="btn primary" data-local="spin">🎡 ${t("spin")}</button><button class="btn" data-local="outside">📝 ${t("logOutside")}</button></div>
      <div class="game-grid">${GAME_ORDER.map(id => { const G = GAMES[id], night = currentNight(), lucky = night && night.lucky === id, hot = lucky || (th && th.featured.includes(id));
        return `<button class="game-card ${hot ? "hot-card" : ""}" data-start="${id}"><span class="gi">${G.icon}</span><b>${esc(L(G.name))}</b>
          <span class="pill d-${G.diff}">${diffLabel[G.diff]}</span>${hot ? `<span class="pill x2">×${lucky ? 3 : 2}</span>` : ""}
          <small>${esc(L(G.desc))}</small><small class="pts">${esc(L(G.ptsTxt))}</small></button>`; }).join("")}</div>`;
  },

  board() {
    const tot = Stats.totals(), mon = Stats.month();
    const rows = GAME_ORDER.map(g => `<tr><td>${GAMES[g].icon} ${esc(L(GAMES[g].name))}</td><td>${Stats.wins("mrb", g)}</td><td>${Stats.wins("za3tr", g)}</td></tr>`).join("")
      + `<tr><td>🌙 ${t("nights")}</td><td>${Stats.nightsWon("mrb")}</td><td>${Stats.nightsWon("za3tr")}</td></tr>`;
    const badges = id => BADGES.map(b => { const ok = b.ok(id); return `<span class="badge ${ok ? "" : "off"}" title="${esc(L(b.d))}">${b.e}<small>${esc(L(b.n))}</small></span>`; }).join("");
    const hist = App.store.history.slice(-20).reverse().map(h => `<li><span>${this.gameLabel(h)}${h.m > 1 ? ` <span class="pill x2">×${h.m}</span>` : ""}</span>
      <span>${PLAYERS.mrb.emoji}+${h.p.mrb} ${PLAYERS.za3tr.emoji}+${h.p.za3tr}</span><small>${new Date(h.ts).toLocaleDateString(App.lang === "ar" ? "ar-SY" : "en-GB", { day: "numeric", month: "short" })}</small></li>`).join("");
    return `<section class="card"><h3>🏆 ${t("allTime")}</h3>${this.tug(tot)}</section>
      <section class="card"><h3>📆 ${t("thisMonth")} · ${App.lang === "ar" ? "الموسم الحالي" : "current season"}</h3>${this.tug(mon)}
        ${Seasons.past().length ? `<h4>👑 ${App.lang === "ar" ? "أبطال المواسم" : "Season champions"}</h4><ul class="hist">${Seasons.past().map(x => `<li><span>${Seasons.label(x.k)}</span><span>${x.w === "tie" ? "🤝" : PLAYERS[x.w].emoji + " " + PLAYERS[x.w].name}</span><small>${x.sc.mrb} : ${x.sc.za3tr}</small></li>`).join("")}</ul>` : ""}</section>
      <section class="card"><table class="wins"><tr><th></th><th>${tag("mrb")}</th><th>${tag("za3tr")}</th></tr>${rows}</table></section>
      <section class="card"><h3>🎖️ ${t("badges")}</h3>${["mrb", "za3tr"].map(id => `<h4>${tag(id)}</h4><div class="badges">${badges(id)}</div>`).join("")}</section>
      <section class="card"><h3>🧾 ${t("history")}</h3><ul class="hist">${hist || `<li class="muted">—</li>`}</ul></section>`;
  },

  gameLabel(h) {
    if (h.g === "bonus") return `🌙 ${t("nightWinBonus")}`;
    if (h.g === "outside") return `📝 ${esc(h.note)}`;
    const G = GAMES[h.g]; return G ? `${G.icon} ${esc(L(G.name))}` : esc(h.g);
  },

  nights() {
    const pending = this.memoryFor && App.store.nights.find(n => n.id === this.memoryFor);
    const form = pending ? `<section class="card"><h3>📝 ${t("memory")}</h3>
      <textarea data-key="mem" rows="3" placeholder="${t("memoryHint")}">${esc(pending.memory || "")}</textarea>
      <input data-key="funny" placeholder="😂 ${t("funny")}" value="${esc(pending.funny || "")}">
      <p>${t("rating")}</p><div class="stars-pick">${[1, 2, 3, 4, 5].map(i => `<button data-rate="${i}" class="${(this.rating || pending.rating || 0) >= i ? "on" : ""}">★</button>`).join("")}</div>
      <button class="btn primary" data-local="savemem">${t("saveNight")}</button></section>` : "";
    const list = App.store.nights.filter(n => n.end).slice().reverse().map(n => {
      const th = themeOf(n) || DATA.themes[0], sc = Stats.totals(h => h.n === n.id);
      const w = sc.mrb === sc.za3tr ? "🤝" : "👑 " + PLAYERS[sc.mrb > sc.za3tr ? "mrb" : "za3tr"].name;
      return `<article class="card mem" style="--ta:${th.accent}"><header><span class="big-emoji">${th.emoji}</span><div><b>${esc(L(th.name))}</b>
        <small>${new Date(n.start).toLocaleDateString(App.lang === "ar" ? "ar-SY" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</small></div>
        <span class="stars">${"★".repeat(n.rating || 0)}</span></header>${scoreline(sc)}<p>${w}</p>
        ${n.memory ? `<p class="bubble">${esc(n.memory)}</p>` : ""}${n.funny ? `<p>😂 ${esc(n.funny)}</p>` : ""}${n.stake ? `<p class="muted">🏆 ${esc(n.stake)}</p>` : ""}
        <button class="btn ghost sm" data-editmem="${n.id}">✏️</button></article>`;
    }).join("");
    return `${form}<h3>📖 ${t("memLog")}</h3>${list || `<p class="muted">${t("noNights")}</p>`}`;
  },

  more() {
    const link = this.inviteLink();
    const guide = GAME_ORDER.map(g => `<li>${GAMES[g].icon} <b>${esc(L(GAMES[g].name))}</b>: ${esc(L(GAMES[g].ptsTxt))}</li>`).join("");
    return `<section class="card"><h3>💌 ${App.lang === "ar" ? "الدعوة" : "Invite"}</h3><p class="muted small">${t("codeHint")}</p>
      <p><code>${esc(App.code)}</code></p><div class="row"><a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent((App.lang === "ar" ? "تعي نلعب 🎮 " : "Game night 🎮 ") + link)}">🟢 ${t("shareInvite")}</a>
      <button class="btn" data-local="copy">🔗 ${t("copyLink")}</button></div></section>
      ${this.customCard()}
      <section class="card"><h3>🌐 ${t("language")}</h3><div class="row"><button class="btn ${App.lang === "ar" ? "primary" : ""}" data-setlang="ar">العربية</button><button class="btn ${App.lang === "en" ? "primary" : ""}" data-setlang="en">English</button></div></section>
      <section class="card"><h3>📏 ${t("pointsGuide")}</h3><ul class="guide">${guide}
      <li>📝 ${t("logOutside")}: ${t("easy")} 2 · ${t("medium")} 4 · ${t("hard")} 6</li><li>✨ ${t("featured")}: ×2</li><li>🌙 ${t("nightWinBonus")}: +5</li></ul></section>
      <section class="card"><h3>📶 ${t("netCheck")}</h3><p class="muted small">${t("netCheckHint")}</p>
      <div id="netres">${UI.netResult || ""}</div><button class="btn" data-local="netcheck">🔎 ${t("netCheck")}</button></section>
      <section class="card"><div class="row"><button class="btn" data-local="export">💾 ${t("exportData")}</button><label class="btn">📂 ${t("importData")}<input type="file" accept=".json" data-local-file="import" hidden></label>
      <button class="btn bad" data-local="wipe">🧹 ${t("wipe")}</button><button class="btn ghost" data-local="reset">🔁 ${t("resetIdentity")}</button></div></section>
      <p class="muted small" style="text-align:center">v11</p>`;
  },

  customCard() {
    const type = this.cType || "wyr", def = Custom.types[type];
    const fields = def.f.map(f => f === "lvl"
      ? `<div class="row seg" id="cflvl">${[1, 2, 3].map(l => `<button class="btn sm ${l === 1 ? "primary" : ""}" data-pickone="${l}">${[t("easy"), t("medium"), t("hard")][l - 1]}</button>`).join("")}</div>`
      : `<input data-key="cf_${type}_${f}" dir="auto" placeholder="${esc(L(Custom.fieldLabel[f]))}">`).join("");
    const mine = Custom.list(type).slice().reverse();
    const show = x => esc(x.a ? `${x.a} / ${x.b}` : x.q || x.t || (x.clue ? `${x.w} · ${x.clue}` : x.w));
    return `<section class="card"><h3>✍️ ${App.lang === "ar" ? "ضيفوا أسئلتكم وتحدياتكم" : "Add your own"}</h3>
      <p class="muted small">${App.lang === "ar" ? "كل شي بتضيفوه بيظهر بالألعاب عند الاثنين. الألعاب بتتجنب تكرار نفس الأسئلة لحتى تخلص كلها." : "Everything you add shows up in the games for both of you. Games avoid repeating questions until they've all been used."}</p>
      <select id="ctype" data-local-select="ctype">${Object.entries(Custom.types).map(([k, v]) => `<option value="${k}" ${k === type ? "selected" : ""}>${v.e} ${esc(L(v.n))}</option>`).join("")}</select>
      ${fields}<button class="btn primary" data-local="addcustom">＋ ${App.lang === "ar" ? "ضيف" : "Add"}</button>
      ${mine.length ? `<ul class="hist">${mine.map(x => `<li><span>${show(x)}</span><span>${PLAYERS[x.by] ? PLAYERS[x.by].emoji : ""}</span><button class="btn ghost sm" data-delcustom="${x.id}">🗑</button></li>`).join("")}</ul>` : ""}</section>`;
  },

  inviteLink() { return location.origin + location.pathname + "?code=" + encodeURIComponent(App.code); },

  setup() {
    const code = this.drafts.code != null ? this.drafts.code : (new URLSearchParams(location.search).get("code") || App.code || "");
    const sel = this.setupWho || App.me;
    return `<main class="wrap setup"><div class="row end"><button class="btn sm" data-local="lang">${App.lang === "ar" ? "English" : "العربية"}</button></div>
      <h1>🎮 ${t("appName")}</h1><p class="tagline">${PLAYERS.mrb.emoji} ${t("tagline")} ${PLAYERS.za3tr.emoji}</p>
      <h3>${t("whoAreYou")}</h3><div class="who-pick">${["mrb", "za3tr"].map(id => `<button class="${sel === id ? "on" : ""}" style="--pc:${PLAYERS[id].color}" data-who="${id}"><span>${PLAYERS[id].emoji}</span>${PLAYERS[id].name}</button>`).join("")}</div>
      <h3>${t("coupleCode")}</h3><input data-key="code" value="${esc(code)}" placeholder="e.g. jasmine-2025" autocapitalize="off" autocomplete="off">
      <p class="muted small">${t("codeHint")}</p>
      <button class="btn primary huge" data-local="begin" ${sel ? "" : "disabled"}>${t("start")} →</button></main>`;
  },

  game() {
    const { gid, s } = App.live, G = GAMES[gid];
    const nt = currentNight(), th = themeOf(nt), mult = nt && nt.lucky === gid ? 3 : th && th.featured.includes(gid) ? 2 : 1;
    let end = "";
    if (s.result) {
      const r = s.result, fin = s.final || r.pts;
      const title = r.winner === "team" ? "🤝 " + t("coop") : r.winner === "tie" ? "🤝 " + t("tie") : `🏆 ${PLAYERS[r.winner].emoji} ${PLAYERS[r.winner].name}`;
      end = `<section class="result"><h2>${title}</h2><p>${tag("mrb")} +${fin.mrb} &nbsp; ${tag("za3tr")} +${fin.za3tr}${mult > 1 ? ` <span class="pill x2">×${mult}</span>` : ""}</p>
        <div class="row"><button class="btn primary" data-start="${gid}">🔁 ${t("rematch")}</button><button class="btn" data-local="leave">← ${t("leave")}</button></div></section>`;
    }
    return `<div class="game-head"><button class="iconbtn" data-local="${s.result ? "leave" : "minimize"}">←</button><h2>${G.icon} ${esc(L(G.name))}</h2>${mult > 1 ? `<span class="pill x2">×${mult}</span>` : ""}
      ${s.result ? "" : `<button class="iconbtn" data-local="quit" title="✕">✕</button>`}</div>
      <div id="game" class="game g-${gid}">${G.view(s, App.me)}</div>${end}`;
  },

  afterRender() {
    if (App.live && !this.hideLive && GAMES[App.live.gid].mount) GAMES[App.live.gid].mount(App.live.s, App.me);
    const back = $("#backToGame");
    if (back) back.remove();
    if (App.live && this.hideLive && !App.live.s.result) {
      const b = document.createElement("button");
      b.id = "backToGame"; b.className = "floating"; b.dataset.local = "resume";
      b.textContent = `${GAMES[App.live.gid].icon} ${L(GAMES[App.live.gid].name)} →`;
      document.body.appendChild(b);
    }
  },

  /* ---------- feedback ---------- */
  toast(html, cls = "") {
    const el = document.createElement("div");
    el.className = "toast " + cls; el.innerHTML = html;
    $("#toasts").appendChild(el);
    setTimeout(() => el.classList.add("out"), 3200);
    setTimeout(() => el.remove(), 3800);
  },

  announced: new Set(),
  announce(h) {
    if (this.announced.has(h.id)) return;
    this.announced.add(h.id);
    if (Date.now() - h.ts > 60000) return;
    const parts = ["mrb", "za3tr"].filter(p => h.p[p]).map(p => `${PLAYERS[p].emoji} +${h.p[p]}`).join(" &nbsp; ");
    this.toast(`<b>${this.gameLabel(h)}</b><br>${parts || "+0"}`);
    if (h.w === App.me || h.w === "team" || h.note === "soulmates") this.confetti();
    setTimeout(() => this.checkBadges(), 50);
  },

  checkBadges() {
    const seen = new Set(LS.get("seenBadges", []));
    const now = BADGES.filter(b => b.ok(App.me)).map(b => b.id);
    now.filter(id => !seen.has(id)).forEach(id => { const b = BADGES.find(x => x.id === id); this.toast(`${b.e} <b>${t("newBadge")}</b><br>${esc(L(b.n))}`, "gold"); });
    LS.set("seenBadges", now);
  },

  confetti() {
    const box = document.createElement("div"); box.className = "confetti";
    const colors = ["#ffb547", "#ff8fb3", "#5ab0ff", "#39f0c7", "#fff"];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("i");
      p.style.cssText = `left:${Math.random() * 100}%;background:${rand(colors)};animation-delay:${Math.random() * .4}s;animation-duration:${1.4 + Math.random()}s`;
      box.appendChild(p);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 2800);
  },

  modal(html) {
    this.closeModal();
    const m = document.createElement("div"); m.className = "modal"; m.id = "modal";
    m.innerHTML = `<div class="sheet">${html}</div>`;
    m.addEventListener("click", e => { if (e.target === m) this.closeModal(); });
    document.body.appendChild(m);
  },
  closeModal() { const m = $("#modal"); if (m) m.remove(); }
};

/* ---------- actions ---------- */
const Actions = {
  lang() { App.lang = App.lang === "ar" ? "en" : "ar"; LS.set("lang", App.lang); UI.render(); },
  begin() {
    const code = String(UI.drafts.code != null ? UI.drafts.code : ($("[data-key=code]") || {}).value || "").trim();
    const who = UI.setupWho || App.me;
    if (!who || code.length < 4) { UI.toast(App.lang === "ar" ? "الكود لازم يكون 4 أحرف على الأقل" : "Code needs at least 4 characters", "bad"); return; }
    App.me = who; App.code = code; LS.set("me", who); LS.set("code", code);
    const qs = new URLSearchParams(location.search); qs.delete("code");
    history.replaceState(null, "", location.pathname + (qs.toString() ? "?" + qs : ""));
    UI.render(); Net.start(); UI.checkBadges();
  },
  reset() {
    if (!confirm(App.lang === "ar" ? "متأكد؟ النقاط محفوظة." : "Sure? Your points stay saved.")) return;
    Net.stop(); Net.setStatus("offline"); App.me = null; UI.setupWho = null; LS.set("me", null); UI.render();
  },
  setstake() {
    const v = String(UI.drafts.stake || "").trim().slice(0, 120), night = currentNight();
    if (!v || !night) return;
    delete UI.drafts.stake;
    commit(st => { const n = st.nights.find(x => x.id === night.id); n.stake = v; n.u = Date.now(); });
  },
  addcustom() {
    const type = UI.cType || "wyr", def = Custom.types[type], out = {};
    for (const f of def.f) {
      if (f === "lvl") { const b = $("#cflvl .primary"); out.lvl = b ? +b.dataset.pickone : 1; continue; }
      const v = String(UI.drafts[`cf_${type}_${f}`] || "").trim().slice(0, 160);
      if (!v) { UI.toast(esc(L(Custom.fieldLabel[f])) + " ?", "bad"); return; }
      out[f] = v;
    }
    if (out.w && type.startsWith("wr")) {
      const n = letters(out.w).length, okLen = type === "wrar" ? n === 4 || n === 5 : n === 5;
      if (!okLen) { UI.toast(type === "wrar" ? (App.lang === "ar" ? "لازم 4 أو 5 أحرف" : "Must be 4 or 5 letters") : (App.lang === "ar" ? "لازم 5 أحرف" : "Must be 5 letters"), "bad"); return; }
    }
    def.f.forEach(f => delete UI.drafts[`cf_${type}_${f}`]);
    Custom.add(type, out);
    UI.toast("✓");
  },
  wipe() {
    if (!confirm(t("wipeConfirm"))) return;
    App.store.resetAt = Date.now();
    App.store = mergeStore(App.store, emptyStore());
    LS.set("seenBadges", []);
    commit(() => {});
    UI.toast("🧹 " + t("wipeDone"));
  },
  pickTheme() { UI.pickTheme = true; UI.render(); },
  cancelTheme() { UI.pickTheme = false; UI.render(); },
  startNight(themeId) {
    if (themeId === "random") themeId = rand(DATA.themes).id;
    const th = DATA.themes.find(x => x.id === themeId);
    const lucky = rand(GAME_ORDER.filter(g => !th.featured.includes(g)));
    const n = { id: uid(), theme: themeId, start: Date.now(), end: null, u: Date.now(), twist: Math.floor(Math.random() * DATA.twists.length), lucky };
    UI.pickTheme = false;
    commit(st => { st.nights.push(n); st.current = { id: n.id, u: Date.now() }; });
  },
  endnight() {
    const night = currentNight(); if (!night) return;
    if (!confirm(t("endNight") + "?")) return;
    const sc = Stats.totals(h => h.n === night.id);
    const w = sc.mrb === sc.za3tr ? "tie" : (sc.mrb > sc.za3tr ? "mrb" : "za3tr");
    if (sc.mrb + sc.za3tr > 0) {
      const p = w === "tie" ? { mrb: 2, za3tr: 2 } : { [w]: 5, [other(w)]: 0 };
      const entry = { id: uid(), ts: Date.now(), g: "bonus", n: night.id, p, w, m: 1, note: "" };
      App.store.history.push(entry); UI.announce(entry);
    }
    UI.memoryFor = night.id; UI.rating = 0; App.tab = "nights";
    commit(st => { const n = st.nights.find(x => x.id === night.id); n.end = Date.now(); n.u = Date.now(); st.current = { id: null, u: Date.now() }; });
    UI.confetti();
  },
  savemem() {
    const id = UI.memoryFor; if (!id) return;
    const memory = UI.drafts.mem != null ? UI.drafts.mem : "", funny = UI.drafts.funny != null ? UI.drafts.funny : "";
    const rating = UI.rating;
    UI.memoryFor = null; delete UI.drafts.mem; delete UI.drafts.funny;
    commit(st => { const n = st.nights.find(x => x.id === id); Object.assign(n, { memory, funny, u: Date.now() }); if (rating) n.rating = rating; });
  },
  setnext() {
    const cur = App.store.next.at ? new Date(App.store.next.at) : new Date(Date.now() + 864e5);
    const local = new Date(cur.getTime() - cur.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
    UI.modal(`<h3>📅 ${t("nextNight")}</h3><input type="datetime-local" id="nextAt" value="${local}">
      <div class="row"><button class="btn primary" data-local="savenext">${t("save")}</button><button class="btn ghost" data-local="closeModal">${t("cancel")}</button></div>`);
  },
  savenext() {
    const v = $("#nextAt").value; if (!v) return;
    UI.closeModal();
    commit(st => { st.next = { at: new Date(v).toISOString(), u: Date.now() }; });
  },
  ics() {
    const at = new Date(App.store.next.at);
    const f = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GameNight//Awsi-Za3tr//EN", "BEGIN:VEVENT", `UID:${uid()}@gamenight`, `DTSTAMP:${f(new Date())}`,
      `DTSTART:${f(at)}`, `DTEND:${f(new Date(at.getTime() + 2 * 36e5))}`, "SUMMARY:🎮 Game Night: Awsi vs Za3tr", `URL:${UI.inviteLink()}`,
      "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:Game night in 1 hour", "END:VALARM",
      "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:Game night in 10 minutes", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    download("game-night.ics", ics, "text/calendar");
  },
  spin() {
    UI.modal(`<h3>🎡 ${t("spinning")}</h3><div class="slot" id="slot">🎲</div>`);
    const order = shuffle(GAME_ORDER), pick = rand(GAME_ORDER);
    let i = 0, delay = 60;
    const step = () => {
      const g = i < 18 ? order[i % order.length] : pick;
      const el = $("#slot"); if (!el) return;
      el.innerHTML = `${GAMES[g].icon}<br><b>${esc(L(GAMES[g].name))}</b>`;
      if (i++ < 18) { delay *= 1.12; setTimeout(step, delay); }
      else { el.classList.add("land"); setTimeout(() => { $("#modal .sheet").insertAdjacentHTML("beforeend", `<div class="row"><button class="btn primary" data-start="${pick}">${t("play")} →</button><button class="btn ghost" data-local="spin">🔁</button></div>`); }, 300); }
    };
    step();
  },
  outside() {
    UI.modal(`<h3>📝 ${t("logOutside")}</h3><p class="muted small">${t("outsideHint")}</p>
      <input id="oname" placeholder="${t("gameName")} (Jawaker, Uno…)">
      <p>${t("whoWon")}</p><div class="row seg" id="owho">${["mrb", "za3tr", "tie"].map((w, i) => `<button class="btn ${i === 0 ? "primary" : ""}" data-pickone="${w}">${w === "tie" ? "🤝 " + t("tie") : PLAYERS[w].emoji + " " + PLAYERS[w].name}</button>`).join("")}</div>
      <p>${t("difficulty")}</p><div class="row seg" id="odiff">${[[2, "easy"], [4, "medium"], [6, "hard"]].map(([v, k], i) => `<button class="btn ${i === 1 ? "primary" : ""}" data-pickone="${v}">${t(k)} · ${v}</button>`).join("")}</div>
      <div class="row"><button class="btn primary" data-local="saveoutside">${t("save")}</button><button class="btn ghost" data-local="closeModal">${t("cancel")}</button></div>`);
  },
  saveoutside() {
    const name = $("#oname").value.trim() || "Game";
    const w = $("#owho .primary").dataset.pickone, v = +$("#odiff .primary").dataset.pickone;
    UI.closeModal();
    award("outside", { winner: w, pts: w === "tie" ? { mrb: v / 2, za3tr: v / 2 } : { [w]: v, [other(w)]: 0 }, note: name.slice(0, 40) });
  },
  closeModal() { UI.closeModal(); },
  copy() { const l = UI.inviteLink(); (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(() => UI.toast(t("copied")), () => prompt("", l)); },
  export() { download(`game-night-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(App.store, null, 1), "application/json"); },
  minimize() { UI.hideLive = true; UI.render(); },
  resume() { UI.hideLive = false; UI.render(); },
  leave() { UI.hideLive = true; if (App.live && App.live.s.result) Live.quit(); else UI.render(); },
  quit() { if (confirm(App.lang === "ar" ? "توقيف اللعبة للاثنين؟" : "Stop this game for both of you?")) Live.quit(); },
  clear() { Live.fx({ k: "clear" }, true); },
  netcheck() {
    const box = $("#netres"); if (box) box.innerHTML = `<p class="muted pulse">${t("connecting")}</p>`;
    Promise.all(RELAYS.map(d => checkRelay(d))).then(rs => {
      const ok = rs.filter(r => r.ok).length;
      UI.netResult = `<ul class="guide">${rs.map(r => `<li>${r.ok ? "✅" : "❌"} ${r.name}${r.ok ? ` <small class="muted">${r.ms} ms</small>` : ""}</li>`).join("")}</ul>
        <p class="${ok ? "hot" : ""}">${ok ? t("netOk") : t("netBad")}</p>`;
      const b = $("#netres"); if (b) b.innerHTML = UI.netResult;
    });
  },
  rushstop() { Live.act({ k: "stop", all: DATA.rushCats.map((_, i) => UI.drafts["rw" + i] || "") }); }
};

function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("button, [data-tab], [data-start], [data-theme]");
  if (!el || el.disabled) return;
  const d = el.dataset;
  if (d.a) {
    const a = JSON.parse(d.a);
    if (a.from) { a.v = UI.drafts[a.from] || ""; if (!a.v.trim()) return; delete UI.drafts[a.from]; delete a.from; }
    Live.act(a);
  } else if (d.tab) { App.tab = d.tab; UI.hideLive = true; UI.render(); window.scrollTo(0, 0); }
  else if (d.start) {
    UI.closeModal();
    const G = GAMES[d.start];
    if (G.options) {
      UI.modal(`<h3>${G.icon} ${esc(L(G.name))}</h3><div class="row">${G.options.map(o => `<button class="btn primary" data-startopt='${A({ g: d.start, o: { [o.k]: o.v } })}'>${t(o.label)}</button>`).join("")}</div>`);
    } else { UI.hideLive = false; Live.start(d.start); }
  }
  else if (d.startopt) { const x = JSON.parse(d.startopt); UI.closeModal(); UI.hideLive = false; Live.start(x.g, x.o); }
  else if (d.theme) Actions.startNight(d.theme);
  else if (d.local && Actions[d.local]) Actions[d.local]();
  else if (d.who) { UI.setupWho = d.who; UI.render(); }
  else if (d.setlang) { App.lang = d.setlang; LS.set("lang", App.lang); UI.render(); }
  else if (d.rate) { UI.rating = +d.rate; $$("[data-rate]").forEach(b => b.classList.toggle("on", +b.dataset.rate <= UI.rating)); }
  else if (d.editmem) { UI.memoryFor = d.editmem; const n = App.store.nights.find(x => x.id === d.editmem); UI.drafts.mem = n.memory || ""; UI.drafts.funny = n.funny || ""; UI.rating = n.rating || 0; UI.render(); window.scrollTo(0, 0); }
  else if (d.delcustom) { if (confirm("🗑?")) Custom.remove(d.delcustom); }
  else if (d.pickone) { $$("button", el.parentElement).forEach(b => b.classList.toggle("primary", b === el)); }
});

const typeTimers = {};
document.addEventListener("input", e => {
  const el = e.target;
  if (el.dataset.key) UI.drafts[el.dataset.key] = el.value;
  if (el.dataset.type != null) {
    const i = +el.dataset.type;
    clearTimeout(typeTimers[i]);
    typeTimers[i] = setTimeout(() => Live.act({ k: "type", i, v: el.value }), 350);
  }
});

document.addEventListener("keydown", e => {
  if (e.key !== "Enter" || !e.target.dataset.key || e.target.tagName === "TEXTAREA") return;
  const b = e.target.parentElement.querySelector("button[data-a]");
  if (b) b.click();
});

document.addEventListener("change", e => {
  if (e.target.dataset.localSelect === "ctype") { UI.cType = e.target.value; UI.render(); return; }
  if (e.target.dataset.localFile !== "import") return;
  const f = e.target.files[0]; if (!f) return;
  f.text().then(txt => { const data = JSON.parse(txt); receiveStore(data); Net.send({ t: "store", store: App.store }); UI.toast("✓"); }).catch(() => UI.toast("✗", "bad"));
});

// Tick countdowns and game timers once a second without a full re-render.
setInterval(() => {
  $$(".cd[data-at]").forEach(el => { el.innerHTML = UI.cdText(el.dataset.at); });
  $$(".timer[data-ends]").forEach(el => { const r = remaining(+el.dataset.ends); el.textContent = `⏱ ${r}s`; el.classList.toggle("hot", r <= 10); });
}, 1000);

UI.render();
if (App.me && App.code) Net.start();
