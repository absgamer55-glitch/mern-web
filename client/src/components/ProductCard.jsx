import { useState } from 'react';
import { Link } from 'react-router-dom';
import Bottle from './Bottle.jsx';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useFavs } from '../context/FavContext.jsx';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { has, toggle } = useFavs();
  const [added, setAdded] = useState(false);
  const fav = has(p._id);
  const soldOut = p.stock === 0;

  const quickAdd = () => { add(p, 1); setAdded(true); setTimeout(() => setAdded(false), 1400); };

  return (
    <div className="rounded-3xl bg-white/45 p-3 transition hover:bg-white/70">
      <div className="relative">
        <Link to={`/product/${p._id}`} className="block" aria-label={p.name}>
          <div
            className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-glass/60 p-8"
            style={{ background: `linear-gradient(160deg, ${p.color}55, ${p.color}18)` }}
          >
            {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <Bottle color={p.color} className="h-full" />}
          </div>
        </Link>
        <button
          onClick={() => toggle(p._id)} aria-pressed={fav} aria-label={fav ? `Remove ${p.name} from saved` : `Save ${p.name}`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 backdrop-blur transition hover:bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? '#B03A55' : 'none'} stroke={fav ? '#B03A55' : '#14100F'} strokeWidth="1.8">
            <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 px-1 pb-1">
        <Link to={`/product/${p._id}`} className="min-w-0">
          <h3 className="font-display text-2xl leading-tight">{p.name}</h3>
          <p className="mt-1 text-sm">{money(p.price)} <span className="text-ink/50">· {p.size} ml{soldOut ? ' · Sold out' : ''}</span></p>
        </Link>
        <button
          disabled={soldOut} onClick={quickAdd} aria-label={`Add ${p.name} to cart`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition hover:bg-resin disabled:opacity-40"
        >
          {added ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5 9-10" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
