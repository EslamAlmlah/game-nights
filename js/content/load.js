// Runs after all content files: builds trivia from lines and removes duplicates.
(function () {
  (DATA.triviaLines || []).forEach(l => {
    const p = l.split("|");
    if (p.length !== 11) return;
    const o = i => ({ en: p[i], ar: p[i + 1] });
    DATA.trivia.push({ d: +p[0], q: o(1), c: [o(3), o(5), o(7), o(9)], a: 0 });
  });
  delete DATA.triviaLines;
  const uniq = (arr, key) => { const s = new Set(); return arr.filter(x => { const k = key(x); if (s.has(k)) return false; s.add(k); return true; }); };
  const low = s => String(s).trim().toLowerCase();
  DATA.trivia = uniq(DATA.trivia, x => low(x.q.en));
  DATA.wyr = uniq(DATA.wyr, x => low(x[0].en) + "|" + low(x[1].en));
  DATA.knowme = uniq(DATA.knowme, x => low(x.en));
  DATA.doodle = uniq(DATA.doodle, x => low(x.en));
  DATA.challenges = uniq(DATA.challenges, x => low(x.t.en));
  DATA.cw.en = uniq(DATA.cw.en, x => low(x[0]));
  DATA.cw.ar = uniq(DATA.cw.ar, x => low(x[0]));
})();
