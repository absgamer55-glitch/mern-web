import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { shortId } from '../components/TicketThread.jsx';
import { payText } from '../payments.js';
import Eyebrow from '../components/Eyebrow.jsx';

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

function Progress({ status }) {
  if (status === 'cancelled') return <span className="rounded-full bg-glass px-3 py-1 text-sm">Cancelled</span>;
  const at = STEPS.indexOf(status);
  return (
    <ol className="flex w-full max-w-md items-center" aria-label={`Order status: ${status}`}>
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span className={`h-3 w-3 rounded-full ${i <= at ? 'bg-resin' : 'bg-ink/20'}`} />
            <span className={`text-[11px] capitalize sm:text-xs ${i === at ? 'font-medium' : 'text-ink/60'}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <span className={`mx-1 mb-5 h-px sm:mx-2 flex-1 ${i < at ? 'bg-resin' : 'bg-ink/20'}`} />}
        </li>
      ))}
    </ol>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    api('/orders/mine').then((d) => { setOrders(d); setState('ok'); }).catch(() => setState('error'));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Eyebrow className="mb-4">Tracking</Eyebrow>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">Your <em>orders</em></h1>
      {state === 'loading' && <p className="mt-8 text-ink/60">Loading…</p>}
      {state === 'error' && <p className="mt-8">Couldn't load your orders. Try again in a moment.</p>}
      {state === 'ok' && !orders.length && (
        <p className="mt-8 text-ink/70">You haven't ordered yet. <Link to="/shop" className="underline">Browse fragrances</Link></p>
      )}

      <div className="mt-8 space-y-5">
        {orders.map((o) => (
          <article key={o._id} className="border border-ink/15 p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Order {shortId(o._id)}</h2>
                <p className="text-ink/60">Placed {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <b className="text-lg">{money(o.total)}</b>
            </div>
            <div className="mt-5"><Progress status={o.status} /></div>
            <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
              {o.items.map((i, k) => (
                <li key={k} className="flex justify-between py-2"><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></li>
              ))}
            </ul>
            <p className="mt-3">Payment: <b>{payText(o)}</b></p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-ink/60">
              <span>Deliver to {o.shipping?.name}, {o.shipping?.address}, {o.shipping?.city}</span>
              <Link to={`/support?order=${o._id}`} className="text-ink underline underline-offset-4">Get help with this order</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
