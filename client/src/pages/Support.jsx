import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, money } from '../api.js';
import TicketThread, { shortId } from '../components/TicketThread.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

const CATEGORIES = ['Delivery', 'Damaged item', 'Wrong item', 'Refund', 'Other'];

export default function Support() {
  const [params] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ order: params.get('order') || '', category: 'Delivery', subject: '', message: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/orders/mine').then(setOrders).catch(() => {});
    api('/tickets/mine').then(setTickets).catch((e) => setError(e.message));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault(); setError(''); setOk(''); setBusy(true);
    try {
      const t = await api('/tickets', { method: 'POST', body: form });
      setTickets((cur) => [t, ...cur]);
      setForm({ ...form, subject: '', message: '' });
      setOk('Ticket sent. We will reply here.');
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const replace = (t) => setTickets((cur) => cur.map((x) => (x._id === t._id ? t : x)));
  const reply = async (id, text) => {
    try { replace(await api(`/tickets/${id}/reply`, { method: 'POST', body: { text } })); return true; }
    catch (err) { setError(err.message); return false; }
  };
  const status = async (id, s) => {
    try { replace(await api(`/tickets/${id}/status`, { method: 'PUT', body: { status: s } })); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Eyebrow className="mb-4">We are here</Eyebrow>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">Customer <em>care</em></h1>
      <p className="mt-3 max-w-xl text-ink/70">Tell us what went wrong and pick the order it is about. We reply inside the ticket.</p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[22rem_1fr]">
        <form onSubmit={create} className="space-y-4 self-start">
          <h2 className="font-display text-2xl">New ticket</h2>
          <div>
            <label className="label" htmlFor="order">Which order?</label>
            <select id="order" className="field" value={form.order} onChange={set('order')}>
              <option value="">Not about an order</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  {shortId(o._id)} · {new Date(o.createdAt).toLocaleDateString()} · {money(o.total)} · {o.status}
                </option>
              ))}
            </select>
            {!orders.length && <p className="mt-1 text-xs text-ink/60">You have no orders yet.</p>}
          </div>
          <div>
            <label className="label" htmlFor="category">Issue type</label>
            <select id="category" className="field" value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div><label className="label" htmlFor="subject">Subject</label><input id="subject" className="field" value={form.subject} onChange={set('subject')} required /></div>
          <div><label className="label" htmlFor="message">Message</label><textarea id="message" rows="5" className="field" value={form.message} onChange={set('message')} required /></div>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          {ok && <p className="text-sm text-resin" role="status">{ok}</p>}
          <button disabled={busy} className="btn-dark w-full">{busy ? 'Sending…' : 'Send ticket'}</button>
        </form>

        <section>
          <h2 className="font-display text-2xl">Your tickets</h2>
          <div className="mt-4 space-y-5">
            {!tickets.length && <p className="text-ink/60">No tickets yet. Create one on the left if you need help.</p>}
            {tickets.map((t) => <TicketThread key={t._id} t={t} onReply={reply} onStatus={status} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
