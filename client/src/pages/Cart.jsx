import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Bottle from '../components/Bottle.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', city: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orders, setOrders] = useState([]);

  const loadOrders = () => user && api('/orders/mine').then(setOrders).catch(() => {});
  useEffect(() => { loadOrders(); }, [user]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const place = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login', { state: { from: '/cart' } });
    setError(''); setBusy(true);
    try {
      await api('/orders', { method: 'POST', body: { items: items.map((i) => ({ product: i._id, qty: i.qty })), shipping: form } });
      clear(); setPlaced(true); loadOrders();
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Eyebrow className="mb-4">Your bag</Eyebrow>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">Your <em>cart</em></h1>
      {placed && <p className="mt-6 rounded-xl bg-ink px-5 py-4 text-mist">Order placed. We'll update its status below as it moves.</p>}

      {!items.length ? (
        <p className="mt-8 text-ink/70">Your cart is empty. <Link to="/shop" className="underline">Browse fragrances</Link></p>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem]">
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {items.map((i) => (
              <li key={i._id} className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 py-5 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-x-5">
                <div className="bg-glass/60 p-3"><Bottle color={i.color} className="h-20" /></div>
                <div className="min-w-0">
                  <Link to={`/product/${i._id}`} className="font-display text-xl">{i.name}</Link>
                  <p className="text-sm text-ink/60">{i.size} ml · {money(i.price)}</p>
                  <button onClick={() => remove(i._id)} className="mt-1 text-sm underline underline-offset-4">Remove</button>
                </div>
                <div className="col-span-2 flex items-center justify-between sm:contents">
                <input type="number" min="1" max={i.stock} value={i.qty} onChange={(e) => setQty(i._id, parseInt(e.target.value, 10) || 1)} className="field !w-20" aria-label={`Quantity for ${i.name}`} />
                <span className="w-20 text-right">{money(i.price * i.qty)}</span>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={place} className="space-y-4">
            <h2 className="font-display text-2xl">Delivery</h2>
            {[['name', 'Full name'], ['phone', 'Phone'], ['address', 'Address'], ['city', 'City']].map(([k, l]) => (
              <div key={k}><label className="label" htmlFor={k}>{l}</label><input id={k} className="field" value={form[k]} onChange={set(k)} required /></div>
            ))}
            <div className="flex justify-between border-t border-ink/10 pt-4 text-lg"><span>Total</span><span>{money(total)}</span></div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="btn-dark w-full">{user ? (busy ? 'Placing order…' : 'Place order') : 'Sign in to order'}</button>
            <p className="text-xs text-ink/60">Payment is collected on delivery.</p>
          </form>
        </div>
      )}

      {user && orders.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl">Your orders</h2>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {orders.map((o) => (
              <li key={o._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <span>{new Date(o.createdAt).toLocaleDateString()} · {o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</span>
                <span className="flex items-center gap-4"><b>{money(o.total)}</b><span className="rounded-full bg-glass px-3 py-1 capitalize">{o.status}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
