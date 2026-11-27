import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, money, allImages } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import Bottle from '../components/Bottle.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

const chips = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

function Lightbox({ images, index, setIndex, onClose, name }) {
  const n = images.length;
  const go = (d) => setIndex((index + d + n) % n);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  });
  const arrow = 'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label={`${name} photos`} onClick={onClose}>
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {n > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo" className={`${arrow} left-3`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo" className={`${arrow} right-3`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
      <img src={images[index]} alt={`${name}, photo ${index + 1} of ${n}`} className="max-h-[85vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm text-white">{index + 1} / {n}</span>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => { setActive(0); setQty(1); api(`/products/${id}`).then(setP).catch((e) => setError(e.message)); }, [id]);

  if (error) return <p className="p-16 text-center">{error}. <Link to="/shop" className="underline">Back to shop</Link></p>;
  if (!p) return <p className="p-16 text-center text-ink/60">Loading…</p>;

  const imgs = allImages(p);
  const soldOut = p.stock === 0;
  const tint = { background: `linear-gradient(160deg, ${p.color}55, ${p.color}18)` };
  const notes = [
    ['Top', 'The first impression', p.top],
    ['Heart', 'The character', p.heart],
    ['Base', 'What lingers', p.base],
  ].filter(([, , v]) => chips(v).length);

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-2 md:gap-12 md:py-12">
        <div>
          <button
            type="button" onClick={() => imgs.length && setZoom(true)} style={tint} disabled={!imgs.length}
            className="relative block w-full overflow-hidden rounded-3xl bg-glass/60" aria-label={imgs.length ? 'Zoom photo' : undefined}
          >
            {imgs.length ? (
              <>
                <img src={imgs[active]} alt={`${p.name}, photo ${active + 1}`} className="aspect-square w-full object-cover" />
                <span className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs">Tap to zoom</span>
              </>
            ) : (
              <div className="flex aspect-square items-center justify-center p-8 sm:p-12"><Bottle color={p.color} className="h-full" /></div>
            )}
          </button>
          {imgs.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {imgs.map((src, i) => (
                <button key={i} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === active}
                  className={`overflow-hidden rounded-xl border-2 transition ${i === active ? 'border-ink' : 'border-transparent opacity-75 hover:opacity-100'}`}>
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-ink/60">{p.family} · {p.size} ml</p>
          <h1 className="mt-1 font-display text-4xl md:text-5xl">{p.name}</h1>
          <p className="mt-4 text-2xl text-resin">{money(p.price)}</p>

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
          <p className="mt-6 text-sm text-ink/60">Pay on delivery, Easypaisa or JazzCash at checkout.</p>
        </div>
      </div>

      {(p.description || notes.length > 0) && (
        <section className="mx-auto max-w-6xl px-5 pb-4 pt-6 md:pt-10">
          <Eyebrow className="mb-8">The details</Eyebrow>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {p.description && (
              <div>
                <h2 className="font-display text-3xl">About this <em>fragrance</em></h2>
                <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink/75">{p.description}</p>
              </div>
            )}
            {notes.length > 0 && (
              <div>
                <h2 className="font-display text-3xl">The <em>notes</em></h2>
                <div className="mt-4 divide-y divide-ink/10 rounded-3xl bg-white/45 px-5">
                  {notes.map(([label, tag, v]) => (
                    <div key={label} className="py-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-xl">{label} notes</h3>
                        <span className="text-xs uppercase tracking-widest text-ink/50">{tag}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {chips(v).map((c) => <span key={c} className="rounded-full border border-ink/20 bg-white/60 px-3 py-1 text-sm">{c}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {zoom && imgs.length > 0 && <Lightbox images={imgs} index={active} setIndex={setActive} onClose={() => setZoom(false)} name={p.name} />}
    </>
  );
}
