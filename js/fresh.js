// Keeping it fresh: your own content, no repeats, nightly twists, seasons.

// Content you add yourselves, synced in the shared store. Deleted items stay as tombstones so the delete syncs too.
const Custom = {
  types: {
    wyr: { e: "🤔", n: { en: "Would you rather", ar: "شو بتفضّل" }, f: ["a", "b"] },
    knowme: { e: "💭", n: { en: "Know-me question", ar: "سؤال بتعرفني" }, f: ["q"] },
    challenge: { e: "🔥", n: { en: "Challenge / dare", ar: "تحدي" }, f: ["t", "lvl"] },
    doodle: { e: "🎨", n: { en: "Doodle word", ar: "كلمة للرسم" }, f: ["w"] },
    trivia: { e: "❓", n: { en: "Trivia question", ar: "سؤال معلومات" }, f: ["q", "right", "w1", "w2", "w3", "lvl"] },
    cwar: { e: "📰", n: { en: "Crossword word (Arabic)", ar: "كلمة متقاطعة (عربي)" }, f: ["w", "clue"] },
    cwen: { e: "📰", n: { en: "Crossword word (English)", ar: "كلمة متقاطعة (إنجليزي)" }, f: ["w", "clue"] },
    wrar: { e: "🟩", n: { en: "Secret word (4 Arabic letters)", ar: "كلمة سرية (4 أحرف عربية)" }, f: ["w"] },
    wren: { e: "🟩", n: { en: "Secret word (5 English letters)", ar: "كلمة سرية (5 أحرف إنجليزية)" }, f: ["w"] }
  },
  fieldLabel: {
    a: { en: "Option A", ar: "الخيار الأول" }, b: { en: "Option B", ar: "الخيار التاني" }, q: { en: "Question", ar: "السؤال" },
    t: { en: "The challenge", ar: "التحدي" }, w: { en: "Word", ar: "الكلمة" }, clue: { en: "Clue", ar: "التعريف" },
    right: { en: "Correct answer", ar: "الجواب الصح" }, w1: { en: "Wrong answer 1", ar: "جواب غلط 1" }, w2: { en: "Wrong answer 2", ar: "جواب غلط 2" }, w3: { en: "Wrong answer 3", ar: "جواب غلط 3" },
    lvl: { en: "Difficulty (1-3)", ar: "الصعوبة (1-3)" }
  },
  all() { return (App.store.custom || []).filter(x => !x.del); },
  list(type) { return this.all().filter(x => x.type === type); },
  add(type, fields) {
    const item = { id: uid(), type, by: App.me, u: Date.now(), ...fields };
    commit(st => { (st.custom = st.custom || []).push(item); });
  },
  remove(id) { commit(st => { const x = (st.custom || []).find(c => c.id === id); if (x) { x.del = true; x.u = Date.now(); } }); }
};

const both = s => ({ en: s, ar: s });
const lvlOf = v => Math.min(3, Math.max(1, parseInt(v, 10) || 1));
const Content = {
  wyr: () => DATA.wyr.concat(Custom.list("wyr").map(x => [both(x.a), both(x.b)])),
  knowme: () => DATA.knowme.concat(Custom.list("knowme").map(x => both(x.q))),
  doodle: () => DATA.doodle.concat(Custom.list("doodle").map(x => both(x.w))),
  challenges: () => DATA.challenges.concat(Custom.list("challenge").map(x => ({ lvl: lvlOf(x.lvl), t: both(x.t) }))),
  trivia: () => DATA.trivia.concat(Custom.list("trivia").map(x => ({ d: lvlOf(x.lvl), q: both(x.q), c: [x.right, x.w1, x.w2, x.w3].map(both), a: 0 })))
};

// Prefer things you haven't seen; start over once everything has been used.
const Fresh = {
  pick(type, items, n) {
    const key = it => JSON.stringify(it).slice(0, 120);
    let seen = new Set(LS.get("seen." + type, []));
    let pool = items.filter(it => !seen.has(key(it)));
    if (pool.length < n) { seen = new Set(); pool = items; }
    const out = shuffle(pool).slice(0, n);
    out.forEach(it => seen.add(key(it)));
    LS.set("seen." + type, [...seen].slice(-600));
    return out;
  }
};

// A twist for every night, plus a lucky game worth ×3.
DATA.twists = [
  { en: "The loser of each game sends the winner a voice note compliment.", ar: "يلي بيخسر كل لعبة بيبعت للرابح فويس فيه مدح." },
  { en: "Every third game is chosen by whoever is behind.", ar: "كل لعبة تالتة بيختارها يلي متأخر بالنقاط." },
  { en: "No saying each other's names tonight. Every slip = the other picks a dare for you.", ar: "ممنوع تقولوا أسماء بعض الليلة. كل غلطة = الشريك بيختارلك تحدي." },
  { en: "Winner of the night chooses the theme of the next one.", ar: "رابح السهرة بيختار ثيم السهرة الجاية." },
  { en: "Before each game, both predict the winner. Right guess = bragging rights.", ar: "قبل كل لعبة توقعوا مين بيربح. التوقع الصح = حق التفاخر." },
  { en: "Speak only in the other's accent for the first game.", ar: "أول لعبة احكوا بلهجة بعض." },
  { en: "Loser of the night writes the memory log entry.", ar: "خسران السهرة بيكتب الذكرى بالدفتر." },
  { en: "Halfway through, swap seats in your room (or lie on the floor) for luck.", ar: "بنص السهرة غيروا مكانكم بالغرفة (أو انبطحوا عالأرض) للحظ." },
  { en: "Every win must be celebrated with a 5-second victory dance on camera.", ar: "كل فوز لازم ينحتفل فيه برقصة 5 ثواني قدام الكاميرا." },
  { en: "The trailing player gets one veto on a game choice.", ar: "يلي متأخر إله حق رفض لعبة وحدة." },
  { en: "Snack rule: whoever loses a game takes a sip of water like a champion.", ar: "قانون السناك: يلي بيخسر لعبة بيشرب شفة مي متل البطل." },
  { en: "Tonight's soundtrack is picked by Za3tr. Next time Mr.B picks.", ar: "موسيقى الليلة بتختارها Za3tr، والمرة الجاية Mr.B." },
  { en: "Each of you secretly picks a word. Say it naturally before the night ends to win a bonus hug (redeemable in person).", ar: "كل واحد بيختار كلمة بالسر. إذا قلتها بشكل طبيعي قبل آخر السهرة بتربح حضن (بينصرف وجهاً لوجه)." },
  { en: "Rematch rule: the loser can demand one rematch per game.", ar: "قانون الإعادة: الخسران بيحق له يطلب إعادة وحدة بكل لعبة." },
  { en: "Trash talk is mandatory. Silence is a forfeit.", ar: "الحكي الاستفزازي إجباري. السكوت خسارة." },
  { en: "Lights low, candles or fairy lights on if you have them.", ar: "الضو خفيف، وشموع أو أضواء زينة إذا عندكم." }
];

const Seasons = {
  key: ts => { const d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); },
  // Champion of each finished month.
  past() {
    const m = {};
    App.store.history.forEach(h => { const k = this.key(h.ts); m[k] = m[k] || { mrb: 0, za3tr: 0 }; m[k].mrb += h.p.mrb || 0; m[k].za3tr += h.p.za3tr || 0; });
    const now = this.key(Date.now());
    return Object.entries(m).filter(([k]) => k !== now).sort().reverse().map(([k, sc]) => ({ k, sc, w: sc.mrb === sc.za3tr ? "tie" : sc.mrb > sc.za3tr ? "mrb" : "za3tr" }));
  },
  label(k) { const [y, m] = k.split("-"); return new Date(+y, +m - 1, 1).toLocaleDateString(App.lang === "ar" ? "ar-SY" : "en-GB", { month: "long", year: "numeric" }); }
};
BADGES.push({ id: "season", e: "🏆", n: { en: "Season Champion", ar: "بطل الموسم" }, d: { en: "Win a month", ar: "اربح شهر" }, ok: id => Seasons.past().some(s => s.w === id) });
