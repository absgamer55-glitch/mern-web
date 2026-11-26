// Fuzzy product search: ranks by relevance and tolerates spelling mistakes.

const norm = (s = '') =>
  String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Edit distance that also counts a swapped pair of letters as one mistake.
function dist(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[m][n];
}

// How many mistakes we forgive depends on word length.
const maxEdits = (len) => (len <= 2 ? 0 : len <= 5 ? 1 : 2);

// 100 exact, 85 starts with, 60 contains, below 60 = spelling-mistake match.
function wordScore(t, w) {
  if (w === t) return 100;
  if (w.startsWith(t)) return 85;
  if (t.length >= 3 && w.includes(t)) return 60;
  const allow = maxEdits(t.length);
  if (!allow) return 0;
  const d = dist(t, w);
  if (d <= allow) return 70 - d * 15;
  if (w.length > t.length && t.length >= 4) {
    const d2 = dist(t, w.slice(0, t.length));
    if (d2 <= allow) return 55 - d2 * 15;
  }
  return 0;
}

// Last resort when nothing matches: the names that look most like what was typed.
function closest(products, query) {
  const q = norm(query);
  if (!q) return [];
  return products
    .map((p) => {
      const name = norm(p.name);
      let sim = 0;
      for (const w of [name, ...name.split(' ')]) sim = Math.max(sim, 1 - dist(q, w) / Math.max(q.length, w.length));
      return { p, sim };
    })
    .filter((x) => x.sim >= 0.34)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3)
    .map((x) => x.p);
}

/**
 * Returns { items, fuzzy, closest }
 *  items   products, best match first
 *  fuzzy   true when nothing matched exactly (we are showing near matches)
 *  closest true when nothing matched at all and we fell back to similar names
 */
export function searchProducts(products, query) {
  const tokens = norm(query).split(' ').filter(Boolean);
  if (!tokens.length) return { items: products, fuzzy: false, closest: false };

  const fullQuery = tokens.join(' ');
  const scored = [];
  for (const p of products) {
    const fields = [
      [norm(p.name), 3],
      [norm(p.family), 1.5],
      [norm(`${p.top} ${p.heart} ${p.base}`), 1.5],
      [norm(p.description), 0.7],
    ].map(([text, w]) => [text.split(' ').filter(Boolean), w]);

    let total = 0;
    let exact = true;
    let matchedAll = true;
    for (const t of tokens) {
      let best = 0, raw = 0;
      for (const [words, w] of fields) {
        for (const word of words) {
          const s = wordScore(t, word);
          if (s * w > best) best = s * w;
          if (s > raw) raw = s;
        }
      }
      if (!best) { matchedAll = false; break; }
      if (raw < 60) exact = false;
      total += best;
    }
    if (!matchedAll) continue;

    const name = norm(p.name);
    if (name === fullQuery) total += 60;
    else if (name.startsWith(fullQuery)) total += 30;
    scored.push({ p, total, exact });
  }

  if (!scored.length) {
    const near = closest(products, query);
    return { items: near, fuzzy: true, closest: true };
  }
  scored.sort((a, b) => b.total - a.total || a.p.name.localeCompare(b.p.name));
  return { items: scored.map((s) => s.p), fuzzy: !scored.some((s) => s.exact), closest: false };
}
