// Games. Each one: init(opts) -> state, act(state, action, by), view(state, me) -> html.
// A finished game sets state.result = { winner, pts: {mrb, za3tr}, note }.
const A = o => esc(JSON.stringify(o));
const btn = (label, a, cls = "") => `<button class="btn ${cls}" data-a="${A(a)}">${label}</button>`;
const tag = id => `<span class="who" style="--pc:${PLAYERS[id].color}">${PLAYERS[id].emoji} ${PLAYERS[id].name}</span>`;
const scoreline = sc => `<div class="scoreline">${tag("mrb")}<b>${sc.mrb}</b><span class="vs">:</span><b>${sc.za3tr}</b>${tag("za3tr")}</div>`;
const firstPlayer = () => rand(["mrb", "za3tr"]);
const winnerOf = (sc, winPts, tiePts) => sc.mrb === sc.za3tr
  ? { winner: "tie", pts: { mrb: tiePts, za3tr: tiePts } }
  : (w => ({ winner: w, pts: { [w]: winPts, [other(w)]: 0 } }))(sc.mrb > sc.za3tr ? "mrb" : "za3tr");
const remaining = endsAt => Math.max(0, Math.ceil((endsAt - hostNow()) / 1000));
const timer = endsAt => `<div class="timer" data-ends="${endsAt}">⏱ ${remaining(endsAt)}s</div>`;
const waitNote = txt => `<p class="muted pulse">${txt || t("waitPartner")}</p>`;

const GAMES = {};

/* ---------- Vanishing XO: you only keep 3 marks ---------- */
GAMES.xo = {
  icon: "⭕", diff: "easy", ptsTxt: { en: "Win 2 · tie 1 each", ar: "الفوز 2 · التعادل 1 لكل واحد" },
  name: { en: "Vanishing XO", ar: "XO المختفية" },
  desc: { en: "Tic-tac-toe where you only keep 3 marks. Your oldest one vanishes.", ar: "إكس-أو بس كل واحد إله 3 علامات بس، والأقدم بتختفي." },
  init() { return { b: Array(9).fill(null), q: { mrb: [], za3tr: [] }, turn: firstPlayer(), moves: 0, line: null, result: null }; },
  act(s, a, by) {
    if (s.result || a.k !== "mv" || by !== s.turn || s.b[a.i]) return;
    const q = s.q[by];
    if (q.length === 3) s.b[q.shift()] = null;
    s.b[a.i] = by; q.push(a.i); s.moves++;
    const L3 = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const line = L3.find(l => l.every(i => s.b[i] === by));
    if (line) { s.line = line; s.result = { winner: by, pts: { [by]: 2, [other(by)]: 0 } }; }
    else if (s.moves >= 40) s.result = { winner: "tie", pts: { mrb: 1, za3tr: 1 } };
    else s.turn = other(by);
  },
  view(s, me) {
    const fading = s.q[s.turn].length === 3 ? s.q[s.turn][0] : -1;
    const cells = s.b.map((v, i) => {
      const cls = [v ? "taken" : "", i === fading && !s.result ? "fading" : "", s.line && s.line.includes(i) ? "win" : ""].join(" ");
      const mark = v === "mrb" ? "✕" : v === "za3tr" ? "◯" : "";
      return `<button class="xo-cell ${cls}" style="--pc:${v ? PLAYERS[v].color : "transparent"}" ${!v && s.turn === me && !s.result ? `data-a="${A({ k: "mv", i })}"` : "disabled"}>${mark}</button>`;
    }).join("");
    return `<p class="turn ${s.turn === me ? "mine" : ""}">${s.result ? "" : (s.turn === me ? t("yourTurn") : t("theirTurn"))} · <small>${tag("mrb")} ✕ &nbsp; ${tag("za3tr")} ◯</small></p>
      <div class="xo">${cells}</div><p class="muted small">${t("vanish")}</p>`;
  }
};

/* ---------- Box Claim (dots and boxes) ---------- */
GAMES.dots = {
  icon: "📦", diff: "medium", ptsTxt: { en: "Easy win 3 · Medium win 5 · Hard win 8 · tie half each", ar: "سهل 3 · متوسط 5 · صعب 8 · التعادل نص لكل واحد" },
  name: { en: "Box Claim", ar: "حرب المربعات" },
  desc: { en: "Take turns drawing lines. Close a box to claim it and go again. Easy 3×3, Medium 5×5, Hard 7×7.", ar: "ارسموا خطوط بالدور. يلي بسكّر مربع بياخده وبيلعب كمان مرة. سهل 3×3، متوسط 5×5، صعب 7×7." },
  sizes: { easy: [3, 3, 1], medium: [5, 5, 2], hard: [7, 8, 4] },
  options: [{ k: "size", v: "easy", label: "dotsEasy" }, { k: "size", v: "medium", label: "dotsMedium" }, { k: "size", v: "hard", label: "dotsHard" }],
  init(o) {
    const size = this.sizes[o && o.size] ? o.size : "medium", N = this.sizes[size][0];
    return { size, n: N, h: Array((N + 1) * N).fill(null), v: Array(N * (N + 1)).fill(null), box: Array(N * N).fill(null), turn: firstPlayer(), sc: { mrb: 0, za3tr: 0 }, result: null };
  },
  act(s, a, by) {
    const N = s.n || 4;
    if (s.result || a.k !== "ln" || by !== s.turn) return;
    const arr = a.t === "h" ? s.h : s.v;
    if (arr[a.i] != null) return;
    arr[a.i] = by;
    let closed = 0;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const k = r * N + c;
      if (s.box[k]) continue;
      if (s.h[r * N + c] && s.h[(r + 1) * N + c] && s.v[r * (N + 1) + c] && s.v[r * (N + 1) + c + 1]) { s.box[k] = by; s.sc[by]++; closed++; }
    }
    const [, win, tie] = this.sizes[s.size] || [4, 4, 2];
    if (s.box.every(Boolean)) s.result = winnerOf(s.sc, win, tie);
    else if (!closed) s.turn = other(by);
  },
  view(s, me) {
    const N = s.n || 4, my = s.turn === me && !s.result;
    let g = "";
    for (let R = 0; R <= 2 * N; R++) for (let C = 0; C <= 2 * N; C++) {
      if (R % 2 === 0 && C % 2 === 0) g += `<i class="dot"></i>`;
      else if (R % 2 === 0) { const i = (R / 2) * N + (C - 1) / 2, o = s.h[i]; g += `<button class="ln h ${o ? "on" : ""}" style="--pc:${o ? PLAYERS[o].color : ""}" ${!o && my ? `data-a="${A({ k: "ln", t: "h", i })}"` : "disabled"}></button>`; }
      else if (C % 2 === 0) { const i = ((R - 1) / 2) * (N + 1) + C / 2, o = s.v[i]; g += `<button class="ln v ${o ? "on" : ""}" style="--pc:${o ? PLAYERS[o].color : ""}" ${!o && my ? `data-a="${A({ k: "ln", t: "v", i })}"` : "disabled"}></button>`; }
      else { const o = s.box[((R - 1) / 2) * N + (C - 1) / 2]; g += `<i class="bx" style="--pc:${o ? PLAYERS[o].color : "transparent"}">${o ? PLAYERS[o].emoji : ""}</i>`; }
    }
    const lvl = s.size ? `<p class="turn"><small>${t(s.size)} · ${N}×${N}</small></p>` : "";
    return `${scoreline(s.sc)}${lvl}<p class="turn ${my ? "mine" : ""}">${s.result ? "" : (my ? t("yourTurn") : t("theirTurn"))}</p>
      <div class="dots ${N >= 6 ? "big" : ""}" style="--n:${N}">${g}</div>`;
  }
};

/* ---------- Underdog Duel: secret cards, but a big gap lets the low card steal ---------- */
GAMES.cards = {
  icon: "🃏", diff: "medium", ptsTxt: { en: "Win 3 · tie 1 each", ar: "الفوز 3 · التعادل 1 لكل واحد" },
  name: { en: "Underdog Duel", ar: "مبارزة المستضعف" },
  desc: { en: "6 cards each, 6 rounds. Higher card wins both cards' value… unless the gap is 6 or more: then the low card steals!", ar: "6 أوراق لكل واحد و6 جولات. الورقة الأعلى بتربح مجموع الورقتين… إلا إذا الفرق 6 أو أكتر: ساعتها الورقة الصغيرة بتسرق!" },
  init() {
    const deal = () => shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, 6).sort((a, b) => a - b);
    return { hand: { mrb: deal(), za3tr: deal() }, played: { mrb: null, za3tr: null }, sc: { mrb: 0, za3tr: 0 }, round: 1, log: [], result: null };
  },
  act(s, a, by) {
    if (s.result || a.k !== "play" || s.played[by] != null) return;
    const i = s.hand[by].indexOf(a.v);
    if (i < 0) return;
    s.hand[by].splice(i, 1); s.played[by] = a.v;
    if (s.played.mrb == null || s.played.za3tr == null) return;
    const m = s.played.mrb, z = s.played.za3tr;
    let w = null, under = false;
    if (m !== z) {
      w = m > z ? "mrb" : "za3tr";
      if (Math.abs(m - z) >= 6) { w = other(w); under = true; }
      s.sc[w] += m + z;
    }
    s.log.push({ mrb: m, za3tr: z, w, under });
    s.played = { mrb: null, za3tr: null };
    if (++s.round > 6) s.result = winnerOf(s.sc, 3, 1);
  },
  view(s, me) {
    const last = s.log[s.log.length - 1];
    const card = (v, cls = "") => `<span class="pcard ${cls}">${v}</span>`;
    const reveal = last ? `<div class="reveal">${tag("mrb")} ${card(last.mrb)} <span class="vs">vs</span> ${card(last.za3tr)} ${tag("za3tr")}
      <p>${last.w ? `${pname(last.w)} ${t("roundWon")} +${last.mrb + last.za3tr}${last.under ? ` · <b class="hot">${t("underdog")}</b>` : ""}` : t("tie")}</p></div>` : "";
    const mine = s.played[me] != null, theirs = s.played[other(me)] != null;
    const hand = s.result ? "" : `<h4>${t("yourHand")}</h4><div class="hand">${s.hand[me].map(v =>
      mine ? card(v, "dim") : `<button class="pcard big" data-a="${A({ k: "play", v })}">${v}</button>`).join("")}</div>
      <p class="muted">${mine ? `${t("lockedIn")}: ${card(s.played[me])} · ` : ""}${theirs ? t("partnerLocked") + " ✓" : waitNote()}</p>`;
    return `${scoreline(s.sc)}<p class="muted">${t("round")} ${Math.min(s.round, 6)} ${t("of")} 6</p>${reveal}${hand}`;
  }
};

/* ---------- Trivia Duel ---------- */
GAMES.trivia = {
  icon: "❓", diff: "mixed", ptsTxt: { en: "Easy 1 · medium 2 · hard 3 per correct answer, +1 for the fastest", ar: "سهل 1 · متوسط 2 · صعب 3 لكل جواب صح، و+1 للأسرع" },
  name: { en: "Trivia Duel", ar: "مبارزة الأسئلة" },
  desc: { en: "7 questions from easy to hard. Both answer in secret, then reveal.", ar: "7 أسئلة من السهل للصعب. كل واحد بيجاوب بالسر وبعدين منكشف." },
  init() {
    const all = Content.trivia(), pick = (d, n) => Fresh.pick("trivia" + d, all.filter(q => q.d === d), n);
    const qs = [...pick(1, 2), ...pick(2, 3), ...pick(3, 2)].map(q => ({ q, order: shuffle([0, 1, 2, 3]) }));
    return { qs, qi: 0, ans: { mrb: null, za3tr: null }, at: {}, phase: "ask", sc: { mrb: 0, za3tr: 0 }, gain: null, result: null };
  },
  act(s, a, by) {
    if (s.result) return;
    const Q = s.qs[s.qi].q;
    if (a.k === "ans" && s.phase === "ask" && s.ans[by] == null) {
      s.ans[by] = a.c; s.at[by] = Date.now();
      if (s.ans.mrb != null && s.ans.za3tr != null) {
        const ok = { mrb: s.ans.mrb === Q.a, za3tr: s.ans.za3tr === Q.a };
        const gain = { mrb: ok.mrb ? Q.d : 0, za3tr: ok.za3tr ? Q.d : 0 };
        const right = ["mrb", "za3tr"].filter(p => ok[p]).sort((x, y) => s.at[x] - s.at[y]);
        if (right.length) gain[right[0]] += 1;
        s.sc.mrb += gain.mrb; s.sc.za3tr += gain.za3tr; s.gain = gain; s.phase = "reveal";
      }
    } else if (a.k === "next" && s.phase === "reveal") {
      if (++s.qi >= s.qs.length) { const r = winnerOf(s.sc, 0, 0); r.pts = { ...s.sc }; s.result = r; }
      else { s.ans = { mrb: null, za3tr: null }; s.at = {}; s.phase = "ask"; s.gain = null; }
    }
  },
  view(s, me) {
    if (s.result) return scoreline(s.sc);
    const { q: Q, order } = s.qs[s.qi];
    const stars = "★".repeat(Q.d) + "☆".repeat(3 - Q.d);
    const opts = order.map(c => {
      let cls = "";
      if (s.phase === "reveal") cls = c === Q.a ? "right" : (s.ans[me] === c ? "wrong" : "dim");
      else if (s.ans[me] === c) cls = "picked";
      const marks = s.phase === "reveal" ? ["mrb", "za3tr"].filter(p => s.ans[p] === c).map(p => PLAYERS[p].emoji).join("") : "";
      return `<button class="opt ${cls}" ${s.phase === "ask" && s.ans[me] == null ? `data-a="${A({ k: "ans", c })}"` : "disabled"}>${esc(L(Q.c[c]))} <span>${marks}</span></button>`;
    }).join("");
    const foot = s.phase === "ask"
      ? (s.ans[me] != null ? waitNote() : (s.ans[other(me)] != null ? `<p class="muted">${t("partnerLocked")} ✓</p>` : ""))
      : `<p>${["mrb", "za3tr"].map(p => `${tag(p)} +${s.gain[p]}`).join(" &nbsp; ")}</p>${btn(t("next") + " →", { k: "next" }, "primary")}`;
    return `${scoreline(s.sc)}<p class="muted">${t("question")} ${s.qi + 1} ${t("of")} ${s.qs.length} · <span class="stars">${stars}</span></p>
      <h3 class="q">${esc(L(Q.q))}</h3><div class="opts">${opts}</div>${foot}`;
  }
};

/* ---------- Would You Rather: match answers together ---------- */
GAMES.wyr = {
  icon: "🤔", diff: "coop", ptsTxt: { en: "+1 each per match, +3 each if 6 of 8 match", ar: "+1 لكل واحد عن كل تطابق، و+3 لكل واحد إذا تطابق 6 من 8" },
  name: { en: "Would You Rather", ar: "شو بتفضّل؟" },
  desc: { en: "8 dilemmas. Pick at the same time and see how in sync you are.", ar: "8 أسئلة محيرة. اختاروا بنفس الوقت وشوفوا قديش متوافقين." },
  init() { return { qs: Fresh.pick("wyr", Content.wyr(), 8), qi: 0, pick: { mrb: null, za3tr: null }, phase: "ask", match: 0, result: null }; },
  act(s, a, by) {
    if (s.result) return;
    if (a.k === "pick" && s.phase === "ask" && s.pick[by] == null) {
      s.pick[by] = a.c;
      if (s.pick.mrb != null && s.pick.za3tr != null) { if (s.pick.mrb === s.pick.za3tr) s.match++; s.phase = "reveal"; }
    } else if (a.k === "next" && s.phase === "reveal") {
      if (++s.qi >= s.qs.length) {
        const bonus = s.match >= 6 ? 3 : 0, each = s.match + bonus;
        s.result = { winner: "team", pts: { mrb: each, za3tr: each }, note: bonus ? "soulmates" : "" };
      } else { s.pick = { mrb: null, za3tr: null }; s.phase = "ask"; }
    }
  },
  view(s, me) {
    const pct = Math.round(100 * s.match / Math.max(1, s.qi + (s.phase === "reveal" ? 1 : 0)));
    if (s.result) return `<h3>${t("syncScore")}: ${s.match}/8 💞</h3>${s.result.note ? `<p class="hot">${t("soulmates")}</p>` : ""}`;
    const Q = s.qs[s.qi];
    const opts = [0, 1].map(c => {
      const who = s.phase === "reveal" ? ["mrb", "za3tr"].filter(p => s.pick[p] === c).map(p => PLAYERS[p].emoji).join(" ") : "";
      const cls = s.pick[me] === c ? "picked" : "";
      return `<button class="wyr-opt ${cls}" ${s.phase === "ask" && s.pick[me] == null ? `data-a="${A({ k: "pick", c })}"` : "disabled"}>${esc(L(Q[c]))}<span class="who-picked">${who}</span></button>`;
    }).join(`<span class="or">${App.lang === "ar" ? "ولا" : "or"}</span>`);
    const foot = s.phase === "ask" ? (s.pick[me] != null ? waitNote() : "")
      : `<p class="${s.pick.mrb === s.pick.za3tr ? "hot" : "muted"}">${s.pick.mrb === s.pick.za3tr ? t("match") : t("noMatch")}</p>${btn(t("next") + " →", { k: "next" }, "primary")}`;
    return `<p class="muted">${s.qi + 1} / 8 · ${t("syncScore")} ${s.match} (${pct}%)</p><div class="wyr">${opts}</div>${foot}`;
  }
};

/* ---------- Do You Know Me? ---------- */
GAMES.knowme = {
  icon: "💭", diff: "medium", ptsTxt: { en: "Exact guess 3 · close 1", ar: "التوقع الصح 3 · القريب 1" },
  name: { en: "Do You Know Me?", ar: "بتعرفني؟" },
  desc: { en: "One writes the real answer about themselves, the other guesses. The answerer judges.", ar: "واحد بيكتب جوابه الحقيقي عن حاله، والتاني بيحزر، وصاحب السؤال بيحكم." },
  rounds: 4,
  init() { const f = firstPlayer(); return { first: f, round: 0, subj: f, p: Fresh.pick("knowme", Content.knowme(), 1)[0], ans: null, guess: null, phase: "write", verdict: null, sc: { mrb: 0, za3tr: 0 }, result: null }; },
  act(s, a, by) {
    if (s.result) return;
    const guesser = other(s.subj);
    if (a.k === "reroll" && by === s.subj && s.phase === "write" && !s.ans && !s.guess) s.p = Fresh.pick("knowme", Content.knowme(), 1)[0];
    else if (a.k === "write" && s.phase === "write" && String(a.v || "").trim()) {
      if (by === s.subj) s.ans = String(a.v).slice(0, 200); else s.guess = String(a.v).slice(0, 200);
      if (s.ans && s.guess) s.phase = "judge";
    } else if (a.k === "judge" && s.phase === "judge" && by === s.subj) {
      s.verdict = a.v; s.sc[guesser] += { exact: 3, close: 1, miss: 0 }[a.v] || 0; s.phase = "done";
    } else if (a.k === "next" && s.phase === "done") {
      if (++s.round >= GAMES.knowme.rounds) s.result = winnerOf(s.sc, 0, 0), s.result.pts = { ...s.sc };
      else Object.assign(s, { subj: other(s.subj), p: Fresh.pick("knowme", Content.knowme(), 1)[0], ans: null, guess: null, phase: "write", verdict: null });
    }
  },
  view(s, me) {
    if (s.result) return scoreline(s.sc);
    const subj = s.subj, iAmSubj = me === subj;
    let body = "";
    if (s.phase === "write") {
      const mineDone = iAmSubj ? s.ans : s.guess;
      body = mineDone ? `<p class="lock">✓ ${t("lockedIn")}</p>${waitNote()}`
        : `<textarea data-key="km${s.round}" rows="2" placeholder="${iAmSubj ? t("writeAnswer") : t("writeGuess")}"></textarea>
           ${btn(t("submit"), { k: "write", from: "km" + s.round }, "primary")} ${iAmSubj && !s.ans && !s.guess ? btn("🎲 " + t("reroll"), { k: "reroll" }) : ""}`;
    } else {
      body = `<div class="pair"><div><small>${tag(subj)}</small><p class="bubble">${esc(s.ans)}</p></div><div><small>${tag(other(subj))}</small><p class="bubble">${esc(s.guess)}</p></div></div>`;
      if (s.phase === "judge") body += iAmSubj ? `<p>${t("judge")}</p><div class="row">${btn("🎯 " + t("exact"), { k: "judge", v: "exact" }, "good")}${btn("👌 " + t("close"), { k: "judge", v: "close" })}${btn("❌ " + t("miss"), { k: "judge", v: "miss" }, "bad")}</div>` : waitNote();
      else body += `<p class="hot">${t(s.verdict)} → ${pname(other(subj))} +${{ exact: 3, close: 1, miss: 0 }[s.verdict]}</p>${btn(t("next") + " →", { k: "next" }, "primary")}`;
    }
    return `${scoreline(s.sc)}<p class="muted">${t("round")} ${s.round + 1} ${t("of")} ${this.rounds} · ${t("aboutYou")} ${tag(subj)}</p>
      <h3 class="q">${esc(L(s.p))}</h3>${body}`;
  }
};

/* ---------- Doodle Duo: draw and guess ---------- */
const Doodle = { strokes: [], round: -1, cur: null };
GAMES.doodle = {
  icon: "🎨", diff: "medium", ptsTxt: { en: "Correct guess: guesser 2, artist 2", ar: "الحزورة الصح: 2 للي حزر و2 للرسام" },
  name: { en: "Doodle Duo", ar: "ارسم واحزر" },
  desc: { en: "One draws, the other guesses in 90 seconds. Swap every round.", ar: "واحد بيرسم والتاني بيحزر خلال 90 ثانية. بتتبدلوا كل جولة." },
  rounds: 4,
  init() { return { round: 0, drawer: firstPlayer(), choices: this.pick(), word: null, phase: "choose", endsAt: 0, guesses: [], got: false, sc: { mrb: 0, za3tr: 0 }, result: null }; },
  pick() { return Fresh.pick("doodle", Content.doodle(), 3); },
  act(s, a, by) {
    if (s.result) return;
    if (a.k === "choose" && s.phase === "choose" && by === s.drawer && s.choices[a.w]) { s.word = s.choices[a.w]; s.phase = "draw"; s.endsAt = Date.now() + 90000; }
    else if (a.k === "guess" && s.phase === "draw" && by !== s.drawer && String(a.v || "").trim()) {
      const w = s.word, g = norm(a.v);
      s.guesses.push(String(a.v).slice(0, 40));
      if (g && (g === norm(w.en) || g === norm(w.ar))) this.win(s);
    } else if (a.k === "gotit" && s.phase === "draw" && by === s.drawer) this.win(s);
    else if (a.k === "skip" && s.phase === "draw" && by === s.drawer) { s.phase = "reveal"; s.got = false; }
    else if (a.k === "next" && s.phase === "reveal") {
      if (++s.round >= this.rounds) s.result = { winner: "team", pts: { ...s.sc } };
      else Object.assign(s, { drawer: other(s.drawer), choices: this.pick(), word: null, phase: "choose", guesses: [], got: false });
    }
  },
  win(s) { s.got = true; s.phase = "reveal"; s.sc.mrb += 2; s.sc.za3tr += 2; },
  tick(s, now) { if (s.phase === "draw" && now > s.endsAt) { s.phase = "reveal"; s.got = false; return true; } return false; },
  view(s, me) {
    if (s.result) return `<h3>${t("score")}: ${s.sc.mrb} 🎨</h3>`;
    if (Doodle.round !== s.round) { Doodle.round = s.round; Doodle.strokes = []; }
    const drawing = me === s.drawer;
    const head = `${scoreline(s.sc)}<p class="muted">${t("round")} ${s.round + 1} ${t("of")} ${this.rounds} · ${t("drawer")}: ${tag(s.drawer)}</p>`;
    if (s.phase === "choose") {
      return head + (drawing ? `<p>${t("chooseWord")}</p><div class="row">${s.choices.map((w, i) => btn(esc(L(w)), { k: "choose", w: i }, "primary")).join("")}</div>` : waitNote());
    }
    const word = s.word;
    let side;
    if (s.phase === "draw") {
      side = drawing
        ? `<p class="big-word">${esc(L(word))}</p><div class="row">${btn("✅ " + t("gotIt"), { k: "gotit" }, "good")}${btn(t("skip"), { k: "skip" })}<button class="btn" data-local="clear">🧽 ${t("clear")}</button></div>`
        : `<div class="row"><input data-key="dg${s.round}" placeholder="${t("guess")}" enterkeyhint="send">${btn(t("send"), { k: "guess", from: "dg" + s.round }, "primary")}</div>`;
      side = timer(s.endsAt) + side;
    } else {
      side = `<p class="${s.got ? "hot" : "muted"}">${s.got ? t("correct") + " +2 / +2" : t("timeUp")} · ${t("theWordWas")}: <b>${esc(L(word))}</b></p>${btn(t("next") + " →", { k: "next" }, "primary")}`;
    }
    const guesses = s.guesses.length ? `<p class="guesses">${s.guesses.slice(-6).map(esc).join(" · ")}</p>` : "";
    return `${head}<canvas id="doodle" class="${drawing && s.phase === "draw" ? "can-draw" : ""}" width="600" height="450"></canvas>${guesses}${side}`;
  },
  // Called after every render: repaint strokes and hook up drawing.
  mount(s, me) {
    const cv = $("#doodle"); if (!cv) return;
    const ctx = cv.getContext("2d");
    const paint = st => { ctx.strokeStyle = st.c; ctx.lineWidth = 6; ctx.lineCap = ctx.lineJoin = "round"; ctx.beginPath(); st.p.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (st.p.length === 1) ctx.lineTo(st.p[0][0] + .1, st.p[0][1]); ctx.stroke(); };
    ctx.fillStyle = "#fffdf7"; ctx.fillRect(0, 0, cv.width, cv.height);
    Doodle.strokes.forEach(paint);
    Doodle.paint = paint; Doodle.ctx = ctx;
    if (!(me === s.drawer && s.phase === "draw")) return;
    const pos = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * cv.width / r.width), Math.round((e.clientY - r.top) * cv.height / r.height)]; };
    let st = null, sent = 0;
    const flush = () => { if (st && st.p.length > sent) { Live.fx({ k: "seg", id: st.id, c: st.c, p: st.p.slice(Math.max(0, sent - 1)) }, true); sent = st.p.length; } };
    cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); st = { id: uid(), c: PLAYERS[me].color === "#ff8fb3" ? "#d6336c" : "#1c5fd4", p: [pos(e)] }; sent = 0; Doodle.strokes.push(st); paint(st); };
    cv.onpointermove = e => { if (!st) return; st.p.push(pos(e)); paint({ c: st.c, p: st.p.slice(-2) }); if (st.p.length - sent > 6) flush(); };
    cv.onpointerup = cv.onpointercancel = () => { flush(); st = null; };
  },
  fx(f) {
    if (f.k === "clear") { Doodle.strokes = []; UI.renderGame(); return; }
    if (f.k !== "seg") return;
    let st = Doodle.strokes.find(x => x.id === f.id);
    if (!st) { st = { id: f.id, c: f.c, p: [] }; Doodle.strokes.push(st); }
    if (st.p.length && f.p.length) f.p = f.p.slice(1);
    st.p.push(...f.p);
    if (Doodle.paint && $("#doodle")) Doodle.paint({ c: f.c, p: st.p.slice(-(f.p.length + 1)) });
  }
};

/* ---------- Letter Rush (name, animal, plant, object, country, food) ---------- */
GAMES.rush = {
  icon: "🔤", diff: "hard", ptsTxt: { en: "Win 4 · tie 2 each (unique answer 2, shared 1)", ar: "الفوز 4 · التعادل 2 لكل واحد (الجواب المختلف 2، المتشابه 1)" },
  name: { en: "Letter Rush", ar: "سباق الحروف" },
  desc: { en: "One letter, six categories, two minutes. Hit Stop to give your partner 10 seconds left.", ar: "حرف واحد، 6 فئات، دقيقتين. اضغط ستوب ليضل لشريكك 10 ثواني بس." },
  options: [{ k: "alpha", v: "ar", label: "arLetters" }, { k: "alpha", v: "en", label: "enLetters" }],
  init(o) {
    const alpha = o.alpha === "en" ? "en" : "ar";
    const blank = () => DATA.rushCats.map(() => "");
    return { alpha, letter: rand(DATA.letters[alpha]), ans: { mrb: blank(), za3tr: blank() }, phase: "write", endsAt: Date.now() + 120000, stopped: null,
      ok: { mrb: null, za3tr: null }, done: { mrb: false, za3tr: false }, pts: null, sc: { mrb: 0, za3tr: 0 }, result: null };
  },
  startsOk(s, v) { const n = norm(v); return !!n && (n[0] === norm(s.letter)[0] || norm("ال" + v)[0] === norm(s.letter)[0]); },
  toReview(s) {
    s.phase = "review";
    ["mrb", "za3tr"].forEach(p => { s.ok[p] = s.ans[p].map(v => this.startsOk(s, v)); });
  },
  act(s, a, by) {
    if (s.result) return;
    if (a.k === "type" && s.phase === "write" && a.i >= 0 && a.i < 6) s.ans[by][a.i] = String(a.v || "").slice(0, 40);
    else if (a.k === "stop" && s.phase === "write" && !s.stopped) {
      if (Array.isArray(a.all)) s.ans[by] = a.all.slice(0, 6).map(v => String(v || "").slice(0, 40));
      s.stopped = by; s.endsAt = Math.min(s.endsAt, Date.now() + 10000);
    } else if (a.k === "mark" && s.phase === "review" && !s.done[by]) s.ok[other(by)][a.i] = !!a.v;
    else if (a.k === "done" && s.phase === "review") {
      s.done[by] = true;
      if (s.done.mrb && s.done.za3tr) {
        s.pts = { mrb: [], za3tr: [] };
        DATA.rushCats.forEach((_, i) => {
          const same = s.ok.mrb[i] && s.ok.za3tr[i] && norm(s.ans.mrb[i]) === norm(s.ans.za3tr[i]);
          ["mrb", "za3tr"].forEach(p => { const v = s.ok[p][i] ? (same ? 1 : 2) : 0; s.pts[p].push(v); s.sc[p] += v; });
        });
        s.result = winnerOf(s.sc, 4, 2);
      }
    }
  },
  tick(s, now) { if (s.phase === "write" && now > s.endsAt) { this.toReview(s); return true; } return false; },
  view(s, me) {
    const cats = DATA.rushCats;
    const head = `<div class="letter">${t("letter")}: <b>${s.letter}</b></div>`;
    if (s.phase === "write") {
      const rows = cats.map((c, i) => `<label class="rush-row"><span>${esc(L(c))}</span><input data-key="rw${i}" data-type="${i}" dir="auto" autocomplete="off" value="${esc(s.ans[me][i])}"></label>`).join("");
      return `${head}${timer(s.endsAt)}${s.stopped ? `<p class="hot">${pname(s.stopped)}: ${t("stop")}</p>` : ""}<div class="rush">${rows}</div>
        ${s.stopped ? "" : `<button class="btn primary" data-local="rushstop">✋ ${t("stop")}</button>`}`;
    }
    const opp = other(me);
    const rows = cats.map((c, i) => {
      const pts = s.pts ? ` <small>+${s.pts.mrb[i]} / +${s.pts.za3tr[i]}</small>` : "";
      const myAns = `<span class="${s.ok[me][i] ? "" : "strike"}">${esc(s.ans[me][i]) || "—"}</span>`;
      const theirs = `<span class="${s.ok[opp][i] ? "" : "strike"}">${esc(s.ans[opp][i]) || "—"}</span>`;
      const ctrl = s.phase === "review" && !s.done[me] && s.ans[opp][i]
        ? `<span class="mini">${btn("✓", { k: "mark", i, v: true }, s.ok[opp][i] ? "good sm" : "sm")}${btn("✕", { k: "mark", i, v: false }, s.ok[opp][i] ? "sm" : "bad sm")}</span>` : "";
      return `<tr><th>${esc(L(c))}${pts}</th><td>${myAns}</td><td>${theirs} ${ctrl}</td></tr>`;
    }).join("");
    const foot = s.result ? "" : (s.done[me] ? waitNote() : `<p class="muted small">${t("unique")}</p>${btn(t("done"), { k: "done" }, "primary")}`);
    return `${head}${s.result ? scoreline(s.sc) : `<p>${t("review")}</p>`}<table class="rush-table"><tr><th></th><th>${tag(me)}</th><th>${tag(opp)}</th></tr>${rows}</table>${foot}`;
  }
};

/* ---------- Challenge Cards ---------- */
GAMES.challenge = {
  icon: "🔥", diff: "mixed", ptsTxt: { en: "Easy 2 · medium 4 · hard 7", ar: "سهل 2 · متوسط 4 · صعب 7" },
  name: { en: "Challenge Cards", ar: "كروت التحدي" },
  desc: { en: "Take turns drawing a challenge. Do it on the call; your partner judges.", ar: "بالدور اسحبوا تحدي ونفذوه عالمكالمة، وشريكك بيحكم." },
  init() { return { turn: firstPlayer(), card: null, lvl: 1, used: [], sc: { mrb: 0, za3tr: 0 }, last: null, result: null }; },
  act(s, a, by) {
    if (s.result) return;
    if (a.k === "draw" && by === s.turn && s.card == null) {
      const lvl = [1, 2, 3].includes(a.lvl) ? a.lvl : 1;
      s.card = Fresh.pick("challenge" + lvl, Content.challenges().filter(x => x.lvl === lvl), 1)[0]; s.lvl = lvl;
    } else if (a.k === "judge" && s.card != null && by === other(s.turn)) {
      const p = a.ok ? [0, 2, 4, 7][s.lvl] : 0;
      s.sc[s.turn] += p; s.last = { who: s.turn, ok: a.ok, p }; s.card = null; s.turn = other(s.turn);
    } else if (a.k === "skip" && s.card != null && by === s.turn) { s.last = { who: s.turn, ok: false, p: 0 }; s.card = null; s.turn = other(s.turn); }
    else if (a.k === "finish" && s.card == null) { const r = winnerOf(s.sc, 0, 0); r.pts = { ...s.sc }; s.result = r; }
  },
  view(s, me) {
    if (s.result) return scoreline(s.sc);
    const lv = [null, t("easy") + " · 2", t("medium") + " · 4", t("hard") + " · 7"];
    const last = s.last ? `<p class="muted">${pname(s.last.who)}: ${s.last.ok ? "✓ +" + s.last.p : "✗"}</p>` : "";
    let body;
    if (s.card == null) {
      body = s.turn === me
        ? `<p>${t("draw")}:</p><div class="row">${[1, 2, 3].map(l => btn(lv[l], { k: "draw", lvl: l }, l === 3 ? "bad" : l === 2 ? "primary" : "good")).join("")}</div>`
        : waitNote(`${pname(s.turn)} ${App.lang === "ar" ? "عم يسحب كرت…" : "is drawing a card…"}`);
      body += `<p>${btn(t("finish"), { k: "finish" }, "ghost")}</p>`;
    } else {
      const C = s.card;
      body = `<div class="chal lvl${s.lvl}"><small>${t("performer")} ${tag(s.turn)} · ${lv[s.lvl]}</small><h3>${esc(L(C.t))}</h3></div>`;
      body += s.turn === me ? `${btn(t("skip"), { k: "skip" }, "ghost")}`
        : `<p>${t("judgeIt")}</p><div class="row">${btn(t("did"), { k: "judge", ok: true }, "good")}${btn(t("failed"), { k: "judge", ok: false }, "bad")}</div>`;
    }
    return `${scoreline(s.sc)}${last}${body}`;
  }
};

const GAME_ORDER = ["xo", "cards", "dots", "trivia", "rush", "knowme", "doodle", "wyr", "challenge"];
