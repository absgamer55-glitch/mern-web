import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import Bottle from '../components/Bottle.jsx';

export default function Product() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => { api(`/products/${id}`).then(setP).catch((e) => setError(e.message)); }, [id]);

  if (error) return <p className="p-16 text-center">{error}. <Link to="/shop" className="underline">Back to shop</Link></p>;
  if (!p) return <p className="p-16 text-center text-ink/60">Loading…</p>;

  const soldOut = p.stock === 0;
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-2 md:gap-12 md:py-12">
      <div className="flex items-center justify-center rounded-3xl bg-glass/60 p-8 sm:p-12" style={{ background: `linear-gradient(160deg, ${p.color}44, ${p.color}14)` }}>
        {p.image ? <img src={p.image} alt={p.name} className="max-h-[28rem] object-contain" /> : <Bottle color={p.color} className="h-72 sm:h-96" />}
      </div>
      <div>
        <p className="text-sm text-ink/60">{p.family} · {p.size} ml</p>
        <h1 className="mt-1 font-display text-4xl md:text-5xl">{p.name}</h1>
        <p className="mt-4 text-2xl text-resin">{money(p.price)}</p>
        <p className="mt-6 max-w-md text-ink/70">{p.description}</p>

        <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10 text-sm">
          {[['Top', p.top], ['Heart', p.heart], ['Base', p.base]].map(([k, v]) => (
            <div key={k} className="flex gap-6 py-3"><dt className="w-16 text-ink/60">{k}</dt><dd>{v || '—'}</dd></div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-full border border-ink/25">
            <button className="px-4 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">−</button>
            <span className="w-8 text-center">{qty}</span>
            <button className="px-4 py-2" onClick={() => setQty((q) => Math.min(p.stock || 1, q + 1))} aria-label="More">+</button>
          </div>
          <button disabled={soldOut} className="btn-dark flex-1 sm:flex-none" onClick={() => { add(p, qty); nav('/cart'); }}>
            {soldOut ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
        {!soldOut && p.stock < 6 && <p className="mt-3 text-sm text-resin">Only {p.stock} left.</p>}
      </div>
    </div>
  );
}
