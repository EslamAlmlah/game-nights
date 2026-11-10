// Drop Four: 7 columns x 6 rows, drop discs, four in a row wins the round. First to 2 rounds wins.
const F4_C = 7, F4_R = 6, F4_TO_WIN = 2, F4_MAX_ROUNDS = 5;
const F4_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];

function f4Line(b, r, c, who) {
  for (const [dr, dc] of F4_DIRS) {
    const cells = [r * F4_C + c];
    for (const s of [1, -1]) {
      let rr = r + dr * s, cc = c + dc * s;
      while (rr >= 0 && rr < F4_R && cc >= 0 && cc < F4_C && b[rr * F4_C + cc] === who) {
        s > 0 ? cells.push(rr * F4_C + cc) : cells.unshift(rr * F4_C + cc);
        rr += dr * s; cc += dc * s;
      }
    }
    if (cells.length >= 4) return cells;
  }
  return null;
}

GAMES.four = {
  icon: "🔴", diff: "easy", ptsTxt: { en: "Win the match 3 · tie 1 each", ar: "الفوز بالمباراة 3 · التعادل 1 لكل واحد" },
  name: { en: "Drop Four", ar: "أربعة بصف" },
  desc: { en: "Drop your discs into the 7 columns. Four in a row, across, up or diagonal, takes the round. First to 2 rounds wins.",
    ar: "نزّل أقراصك بالأعمدة السبعة. أربعة ورا بعض، بالعرض أو الطول أو بالمايل، بتربح الجولة. أول واحد بيربح جولتين بيفوز." },
  init() {
    const st = firstPlayer();
    return { b: Array(F4_C * F4_R).fill(null), sc: { mrb: 0, za3tr: 0 }, round: 1, starter: st, turn: st,
      last: -1, moves: 0, line: null, roundEnd: null, result: null };
  },
  act(s, a, by) {
    if (s.result) return;
    if (a.k === "next") {
      if (!s.roundEnd) return;
      s.starter = s.roundEnd === "draw" ? other(s.starter) : other(s.roundEnd);
      Object.assign(s, { b: Array(F4_C * F4_R).fill(null), round: s.round + 1, turn: s.starter, last: -1, moves: 0, line: null, roundEnd: null });
      return;
    }
    if (s.roundEnd || by !== s.turn || a.k !== "drop" || !(a.c >= 0 && a.c < F4_C)) return;
    let r = F4_R - 1;
    while (r >= 0 && s.b[r * F4_C + a.c]) r--;
    if (r < 0) return;
    const i = r * F4_C + a.c;
    s.b[i] = by; s.last = i; s.moves++;
    const line = f4Line(s.b, r, a.c, by);
    if (line) { s.line = line; s.sc[by]++; s.roundEnd = by; }
    else if (s.moves >= F4_C * F4_R) s.roundEnd = "draw";
    else { s.turn = other(by); return; }
    if (s.sc[by] >= F4_TO_WIN) s.result = { winner: by, pts: { [by]: 3, [other(by)]: 0 } };
    else if (s.round >= F4_MAX_ROUNDS) s.result = winnerOf(s.sc, 3, 1);
  },
  view(s, me) {
    const myTurn = s.turn === me && !s.roundEnd && !s.result;
    const discs = s.b.map((v, i) => {
      if (!v) return `<div class="f4-slot"></div>`;
      const r = Math.floor(i / F4_C);
      const cls = ["f4-disc", i === s.last ? "drop" : "", s.line ? (s.line.includes(i) ? "win" : "dim") : ""].join(" ");
      return `<div class="f4-slot"><div class="${cls}" style="--pc:${PLAYERS[v].color};--r:${r}"><span>${PLAYERS[v].emoji}</span></div></div>`;
    }).join("");
    const cols = Array.from({ length: F4_C }, (_, c) => {
      const open = myTurn && !s.b[c];
      return `<button class="f4-col ${open ? "open" : ""}" aria-label="${T2("Column", "عمود")} ${c + 1}" ${open ? `data-a="${A({ k: "drop", c })}"` : "disabled"}></button>`;
    }).join("");
    const ctr = i => [(i % F4_C) * 100 + 50, Math.floor(i / F4_C) * 100 + 50];
    const laser = s.line ? (([x1, y1], [x2, y2]) =>
      `<svg class="f4-laser" viewBox="0 0 700 600" style="--pc:${PLAYERS[s.roundEnd].color}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></svg>`
    )(ctr(s.line[0]), ctr(s.line[s.line.length - 1])) : "";
    const pips = id => Array.from({ length: F4_TO_WIN }, (_, k) => `<i class="${k < s.sc[id] ? "on" : ""}"></i>`).join("");
    const side = id => `<div class="neon-side ${s.turn === id && !s.roundEnd && !s.result ? "active" : ""}" style="--pc:${PLAYERS[id].color}">
      <div class="f4-mini" style="--pc:${PLAYERS[id].color}"></div>${tag(id)}<div class="neon-pips">${pips(id)}</div></div>`;
    const status = s.result ? "" : s.roundEnd
      ? `<div class="neon-round">${s.roundEnd === "draw" ? `🤝 ${T2("Board full, draw!", "اللوح امتلى، تعادل!")}` : `🔥 ${PLAYERS[s.roundEnd].name} ${T2("got four in a row!", "جاب أربعة بصف!")}`}
         <div class="row">${btn(T2("Next round", "الجولة الجاية") + " →", { k: "next" }, "primary")}</div></div>`
      : `<p class="turn ${myTurn ? "mine" : ""}">${myTurn ? T2("Your turn, tap a column", "دورك، اضغط على عمود") : t("theirTurn")}</p>`;
    return `<div class="neon-top">${side("mrb")}<div class="neon-mid"><small>${T2("Round", "جولة")}</small><b>${s.round}</b><small>${T2("first to 2", "أول 2")}</small></div>${side("za3tr")}</div>
      ${status}
      <div class="f4 ${myTurn ? "mine" : ""}" style="--pc:${PLAYERS[me].color}" dir="ltr">
        <div class="f4-board"><div class="f4-discs">${discs}</div><div class="f4-frame"></div>${laser}</div>
        <div class="f4-cols">${cols}</div>
      </div>`;
  }
};

GAME_ORDER.unshift("four");
BADGES.push({ id: "four", e: "🔴", n: { en: "Four Master", ar: "معلّم الأربعة" }, d: { en: "Win 3 Drop Four matches", ar: "اربح 3 مباريات أربعة بصف" }, ok: id => Stats.wins(id, "four") >= 3 });
