import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadProducts } from '../useProducts.js';
import { searchProducts } from '../search.js';
import ProductCard from '../components/ProductCard.jsx';
import Eyebrow from '../components/Eyebrow.jsx';
import { useFavs } from '../context/FavContext.jsx';

const FAMILIES = ['Woody', 'Floral', 'Citrus', 'Amber', 'Fresh'];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const family = params.get('family') || '';
  const q = params.get('q') || '';
  const { ids } = useFavs();
  const [saved, setSaved] = useState(false);
  const [all, setAll] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    loadProducts(true).then((d) => { setAll(d); setState('ok'); }).catch(() => setState('error'));
  }, []);

  const byFamily = family ? all.filter((p) => p.family === family) : all;
  const result = q.trim() ? searchProducts(byFamily, q) : { items: byFamily, fuzzy: false, closest: false };

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };
  const shown = saved ? result.items.filter((p) => ids.includes(p._id)) : result.items;
  const chip = (on) => `rounded-full border px-5 py-2 text-sm transition ${on ? 'border-ink bg-ink text-white' : 'border-ink/25 hover:border-ink'}`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Eyebrow className="mb-4">The collection</Eyebrow>
      <h1 className="font-display text-5xl md:text-6xl">All <em>fragrances</em></h1>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {['', ...FAMILIES].map((f) => (
          <button key={f || 'all'} onClick={() => update({ family: f })} className={chip(family === f)}>{f || 'All'}</button>
        ))}
        <button onClick={() => setSaved((s) => !s)} aria-pressed={saved} className={chip(saved)}>Saved ♥</button>
        <input value={q} onChange={(e) => update({ q: e.target.value })} placeholder="Search by name" className="field ml-auto !w-56" aria-label="Search fragrances" />
      </div>

      {state === 'ok' && q.trim() && result.closest && shown.length > 0 && <p className="mt-8 rounded-xl bg-glass/60 px-4 py-3 text-sm">No exact match for “{q.trim()}”. These look closest:</p>}
      {state === 'ok' && q.trim() && !result.closest && result.fuzzy && shown.length > 0 && <p className="mt-8 rounded-xl bg-glass/60 px-4 py-3 text-sm">Showing closest matches for “{q.trim()}”.</p>}
      {state === 'loading' && <p className="mt-12 text-ink/60">Loading…</p>}
      {state === 'error' && <p className="mt-12">Couldn't load fragrances. Check that the server is running.</p>}
      {state === 'ok' && !shown.length && <p className="mt-12 text-ink/60">{saved ? 'Nothing saved yet. Tap the heart on a fragrance.' : 'Nothing matches. Try another family or clear the search.'}</p>}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => <ProductCard key={p._id} p={p} />)}
      </div>
    </div>
  );
}
