// Neon Tic-Tac-Toe: classic 3 in a row, best of 5, with one bomb each per match.
const NEON_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const NEON_TO_WIN = 3, NEON_MAX_ROUNDS = 7;

GAMES.neon = {
  icon: "✨", diff: "easy", ptsTxt: { en: "Win the match 3 · tie 1 each", ar: "الفوز بالمباراة 3 · التعادل 1 لكل واحد" },
  name: { en: "Neon Tic-Tac-Toe", ar: "إكس-أو نيون" },
  desc: { en: "Classic 3 in a row under neon lights. First to 3 rounds wins. Each of you has one 💣 to blast a mark.", ar: "إكس-أو الكلاسيكية بأضواء النيون. أول واحد بيربح 3 جولات بيفوز. كل واحد معه 💣 وحدة بتفجّر علامة." },
  init() {
    const st = firstPlayer();
    return { b: Array(9).fill(null), sc: { mrb: 0, za3tr: 0 }, round: 1, starter: st, turn: st, last: -1, blast: -1,
      line: null, roundEnd: null, bombs: { mrb: 1, za3tr: 1 }, armed: null, fxn: 0, result: null };
  },
  act(s, a, by) {
    if (s.result) return;
    if (a.k === "next") {
      if (!s.roundEnd) return;
      s.starter = s.roundEnd === "draw" ? other(s.starter) : other(s.roundEnd);
      Object.assign(s, { b: Array(9).fill(null), round: s.round + 1, turn: s.starter, last: -1, blast: -1, line: null, roundEnd: null, armed: null });
      return;
    }
    if (s.roundEnd || by !== s.turn) return;
    if (a.k === "arm") {
      if (s.armed === by) s.armed = null;
      else if (s.bombs[by] > 0 && s.b.includes(other(by))) s.armed = by;
      return;
    }
    if (a.k !== "mv" || a.i < 0 || a.i > 8) return;
    s.fxn++;
    if (s.armed === by) {
      if (s.b[a.i] !== other(by)) return;
      s.b[a.i] = null; s.bombs[by]--; s.armed = null; s.blast = a.i; s.last = -1;
      s.turn = other(by);
      return;
    }
    if (s.b[a.i]) return;
    s.b[a.i] = by; s.last = a.i; s.blast = -1;
    const line = NEON_LINES.find(l => l.every(i => s.b[i] === by));
    if (line) { s.line = line; s.sc[by]++; s.roundEnd = by; }
    else if (s.b.every(Boolean)) s.roundEnd = "draw";
    else { s.turn = other(by); return; }
    if (s.sc[by] >= NEON_TO_WIN) s.result = { winner: by, pts: { [by]: 3, [other(by)]: 0 } };
    else if (s.round >= NEON_MAX_ROUNDS) s.result = winnerOf(s.sc, 3, 1);
  },
  view(s, me) {
    const mark = (v, i) => {
      const anim = i === s.last ? " draw" : "";
      return v === "mrb"
        ? `<svg viewBox="0 0 100 100" class="nm x${anim}"><path d="M24 24 L76 76"/><path d="M76 24 L24 76" class="p2"/></svg>`
        : `<svg viewBox="0 0 100 100" class="nm o${anim}"><circle cx="50" cy="50" r="27"/></svg>`;
    };
    const myTurn = s.turn === me && !s.roundEnd && !s.result, armed = s.armed === me;
    const cells = s.b.map((v, i) => {
      const can = myTurn && (armed ? v === other(me) : !v);
      const cls = ["neon-cell", v ? "taken" : "", can ? "open" : "", armed && v === other(me) ? "target" : "",
        s.line && s.line.includes(i) ? "win" : "", s.line && !s.line.includes(i) && v ? "dim" : ""].join(" ");
      const inner = v ? mark(v, i) : (i === s.blast ? `<span class="boom">💥</span>` : (can ? `<span class="ghost">${mark(me, -2)}</span>` : ""));
      return `<button class="${cls}" style="--pc:${v ? PLAYERS[v].color : PLAYERS[me].color}" ${can ? `data-a="${A({ k: "mv", i })}"` : "disabled"}>${inner}</button>`;
    }).join("");
    const c = i => [50 + (i % 3) * 100, 50 + Math.floor(i / 3) * 100];
    const laser = s.line ? (([x1, y1], [x2, y2]) => {
      const dx = (x2 - x1) * .18, dy = (y2 - y1) * .18;
      return `<svg class="neon-laser" viewBox="0 0 300 300" style="--pc:${PLAYERS[s.roundEnd].color}"><line x1="${x1 - dx}" y1="${y1 - dy}" x2="${x2 + dx}" y2="${y2 + dy}"/></svg>`;
    })(c(s.line[0]), c(s.line[2])) : "";
    const pips = id => Array.from({ length: NEON_TO_WIN }, (_, k) => `<i class="${k < s.sc[id] ? "on" : ""}"></i>`).join("");
    const side = id => `<div class="neon-side ${s.turn === id && !s.roundEnd && !s.result ? "active" : ""}" style="--pc:${PLAYERS[id].color}">
      <div class="neon-sym">${id === "mrb" ? "✕" : "◯"}</div>${tag(id)}<div class="neon-pips">${pips(id)}</div>
      <div class="neon-bomb ${s.bombs[id] ? "" : "used"}">💣</div></div>`;
    const status = s.result ? "" : s.roundEnd
      ? `<div class="neon-round">${s.roundEnd === "draw" ? `🤝 ${T2("Draw!", "تعادل!")}` : `⚡ ${PLAYERS[s.roundEnd].name} ${T2("takes the round!", "ربح الجولة!")}`}
         <div class="row">${btn(T2("Next round", "الجولة الجاية") + " →", { k: "next" }, "primary")}</div></div>`
      : `<p class="turn ${myTurn ? "mine" : ""}">${myTurn ? (armed ? T2("💣 Tap a mark to blast it", "💣 اضغط على علامة لتفجّرها") : t("yourTurn")) : t("theirTurn")}</p>`;
    const bombBtn = myTurn && s.bombs[me] && s.b.includes(other(me))
      ? `<div class="row" style="justify-content:center">${btn(armed ? T2("Cancel bomb", "إلغاء القنبلة") : T2("💣 Use bomb", "💣 استخدم القنبلة"), { k: "arm" }, armed ? "bad" : "ghost")}</div>` : "";
    return `<div class="neon-top">${side("mrb")}<div class="neon-mid"><small>${T2("Round", "جولة")}</small><b>${s.round}</b><small>${T2("first to 3", "أول 3")}</small></div>${side("za3tr")}</div>
      ${status}<div class="neon-wrap"><div class="neon ${armed ? "armed" : ""}">${cells}</div>${laser}</div>${bombBtn}`;
  }
};

GAME_ORDER.unshift("neon");
BADGES.push({ id: "neon", e: "✨", n: { en: "Neon Legend", ar: "أسطورة النيون" }, d: { en: "Win 3 Neon Tic-Tac-Toe matches", ar: "اربح 3 مباريات إكس-أو نيون" }, ok: id => Stats.wins(id, "neon") >= 3 });
