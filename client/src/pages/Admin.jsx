import { useEffect, useState } from 'react';
import { api, money } from '../api.js';
import TicketThread from '../components/TicketThread.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

const FAMILIES = ['Woody', 'Floral', 'Citrus', 'Amber', 'Fresh'];
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const blank = { name: '', family: 'Woody', description: '', top: '', heart: '', base: '', price: '', size: 50, stock: 10, color: '#B8791F', image: '', featured: false };

export default function Admin() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    api('/products').then(setProducts).catch((e) => setMsg(e.message));
    api('/orders').then(setOrders).catch((e) => setMsg(e.message));
    api('/tickets').then(setTickets).catch((e) => setMsg(e.message));
  };
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault(); setMsg('');
    const body = { ...form, price: Number(form.price), size: Number(form.size), stock: Number(form.stock) };
    ['_id', '__v', 'createdAt', 'updatedAt'].forEach((k) => delete body[k]);
    try {
      await api(editing ? `/products/${editing}` : '/products', { method: editing ? 'PUT' : 'POST', body });
      setMsg(editing ? 'Fragrance updated.' : 'Fragrance added.');
      setForm(blank); setEditing(null); load();
    } catch (err) { setMsg(err.message); }
  };

  const edit = (p) => { setEditing(p._id); setForm({ ...blank, ...p }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const del = async (p) => {
    if (!confirm(`Delete ${p.name}? This can't be undone.`)) return;
    await api(`/products/${p._id}`, { method: 'DELETE' }); setMsg('Fragrance deleted.'); load();
  };
  const setStatus = async (id, status) => {
    try { const o = await api(`/orders/${id}/status`, { method: 'PUT', body: { status } }); setOrders((cur) => cur.map((x) => (x._id === id ? o : x))); }
    catch (err) { setMsg(err.message); }
  };

  const swap = (t) => setTickets((cur) => cur.map((x) => (x._id === t._id ? t : x)));
  const replyTicket = async (id, text) => {
    try { swap(await api(`/tickets/${id}/reply`, { method: 'POST', body: { text } })); return true; }
    catch (err) { setMsg(err.message); return false; }
  };
  const ticketStatus = async (id, status) => {
    try { swap(await api(`/tickets/${id}/status`, { method: 'PUT', body: { status } })); }
    catch (err) { setMsg(err.message); }
  };

  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} className={`rounded-full px-5 py-2 text-sm ${tab === t ? 'bg-ink text-mist' : 'border border-ink/25'}`}>{label}</button>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Eyebrow className="mb-4">Dashboard</Eyebrow>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">Admin <em>panel</em></h1>
      <div className="mt-6 flex flex-wrap gap-2">{tabBtn('products', `Products (${products.length})`)}{tabBtn('orders', `Orders (${orders.length})`)}{tabBtn('tickets', `Tickets (${tickets.filter((t) => t.status !== 'closed').length} open)`)}</div>
      {msg && <p className="mt-4 rounded-xl bg-glass px-4 py-3 text-sm" role="status">{msg}</p>}

      {tab === 'products' && (
        <>
          <form onSubmit={save} className="mt-8 grid gap-4 border border-ink/15 p-6 md:grid-cols-3">
            <h2 className="font-display text-2xl md:col-span-3">{editing ? 'Edit fragrance' : 'Add fragrance'}</h2>
            <div><label className="label">Name</label><input className="field" value={form.name} onChange={set('name')} required /></div>
            <div><label className="label">Family</label><select className="field" value={form.family} onChange={set('family')}>{FAMILIES.map((f) => <option key={f}>{f}</option>)}</select></div>
            <div><label className="label">Price ($)</label><input type="number" min="0" step="0.01" className="field" value={form.price} onChange={set('price')} required /></div>
            <div><label className="label">Size (ml)</label><input type="number" min="1" className="field" value={form.size} onChange={set('size')} /></div>
            <div><label className="label">Stock</label><input type="number" min="0" className="field" value={form.stock} onChange={set('stock')} /></div>
            <div><label className="label">Liquid colour</label><input type="color" className="field !p-1 h-12" value={form.color} onChange={set('color')} /></div>
            <div><label className="label">Top notes</label><input className="field" value={form.top} onChange={set('top')} /></div>
            <div><label className="label">Heart notes</label><input className="field" value={form.heart} onChange={set('heart')} /></div>
            <div><label className="label">Base notes</label><input className="field" value={form.base} onChange={set('base')} /></div>
            <div className="md:col-span-2"><label className="label">Description</label><input className="field" value={form.description} onChange={set('description')} /></div>
            <div><label className="label">Image URL (optional)</label><input className="field" value={form.image} onChange={set('image')} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Show on home page</label>
            <div className="flex gap-3 md:col-span-3">
              <button className="btn-dark">{editing ? 'Save changes' : 'Add fragrance'}</button>
              {editing && <button type="button" className="btn-line" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
            </div>
          </form>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-ink/20 text-ink/60"><tr><th className="py-3">Name</th><th>Family</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-ink/10">
                    <td className="py-3 font-medium">{p.name}</td><td>{p.family}</td><td>{money(p.price)}</td><td>{p.stock}</td>
                    <td className="space-x-4 text-right"><button className="underline" onClick={() => edit(p)}>Edit</button><button className="underline text-red-700" onClick={() => del(p)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!products.length && <p className="py-6 text-ink/60">No fragrances yet. Add your first one above.</p>}
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="mt-8 space-y-4">
          {!orders.length && <p className="text-ink/60">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o._id} className="border border-ink/15 p-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><b>{o.user?.name || 'Deleted user'}</b> · {o.user?.email} · {new Date(o.createdAt).toLocaleString()}</div>
                <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)} className="field !w-40 capitalize" aria-label="Order status">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p className="mt-2">{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')} — <b>{money(o.total)}</b></p>
              <p className="mt-1 text-ink/60">Deliver to {o.shipping?.name}, {o.shipping?.address}, {o.shipping?.city} · {o.shipping?.phone}</p>
            </div>
          ))}
        </div>
      )}
      {tab === 'tickets' && (
        <div className="mt-8 space-y-5">
          {!tickets.length && <p className="text-ink/60">No tickets yet.</p>}
          {tickets.map((t) => <TicketThread key={t._id} t={t} isAdmin onReply={replyTicket} onStatus={ticketStatus} />)}
        </div>
      )}
    </div>
  );
}
