import { useEffect, useState } from 'react';
import { api, money, firstImage } from '../api.js';
import { fileToDataUrl } from '../image.js';
import { METHOD_LABEL, PAY_STATUS } from '../payments.js';
import TicketThread from '../components/TicketThread.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

const FAMILIES = ['Woody', 'Floral', 'Citrus', 'Amber', 'Fresh'];
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const MAX_PHOTOS = 4;
const blank = { name: '', family: 'Woody', description: '', top: '', heart: '', base: '', price: '', size: 50, stock: 10, color: '#B8791F', image: '', images: [], featured: false };

export default function Admin() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imgBusy, setImgBusy] = useState(false);

  const load = () => {
    api('/products').then(setProducts).catch((e) => setMsg(e.message));
    api('/orders').then(setOrders).catch((e) => setMsg(e.message));
    api('/tickets').then(setTickets).catch((e) => setMsg(e.message));
  };
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  // ---- photos (up to 4) ----
  const addFiles = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    const room = MAX_PHOTOS - form.images.length;
    if (!files.length) return;
    if (room <= 0) return setMsg(`You can add up to ${MAX_PHOTOS} photos.`);
    setImgBusy(true); setMsg('');
    try {
      const urls = [];
      for (const f of files.slice(0, room)) urls.push(await fileToDataUrl(f));
      setForm((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
      if (files.length > room) setMsg(`Only ${MAX_PHOTOS} photos fit, so the first ${room} were added.`);
    } catch (err) { setMsg(err.message); }
    setImgBusy(false);
  };
  const addUrl = () => {
    const u = urlInput.trim();
    if (!/^https?:\/\//i.test(u)) return setMsg('Paste a full image link that starts with https://');
    if (form.images.length >= MAX_PHOTOS) return setMsg(`You can add up to ${MAX_PHOTOS} photos.`);
    setForm({ ...form, images: [...form.images, u] }); setUrlInput(''); setMsg('');
  };
  const removeImg = (i) => setForm({ ...form, images: form.images.filter((_, k) => k !== i) });
  const makeCover = (i) => setForm({ ...form, images: [form.images[i], ...form.images.filter((_, k) => k !== i)] });

  const save = async (e) => {
    e.preventDefault(); setMsg('');
    const body = { ...form, image: '', price: Number(form.price), size: Number(form.size), stock: Number(form.stock) };
    ['_id', '__v', 'createdAt', 'updatedAt'].forEach((k) => delete body[k]);
    try {
      await api(editing ? `/products/${editing}` : '/products', { method: editing ? 'PUT' : 'POST', body });
      setMsg(editing ? 'Fragrance updated.' : 'Fragrance added.');
      setForm(blank); setEditing(null); load();
    } catch (err) {
      setMsg(/too large/i.test(err.message)
        ? 'The photos are too big for the server limit. In server/index.js change express.json() to express.json({ limit: "10mb" }), then restart the server.'
        : err.message);
    }
  };

  // The list only carries the cover photo, so load the full product before editing.
  const edit = async (p) => {
    try {
      const full = await api(`/products/${p._id}`);
      const images = full.images?.length ? full.images : full.image ? [full.image] : [];
      setEditing(p._id); setForm({ ...blank, ...full, images, image: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { setMsg(err.message); }
  };
  const del = async (p) => {
    if (!confirm(`Delete ${p.name}? This can't be undone.`)) return;
    await api(`/products/${p._id}`, { method: 'DELETE' }); setMsg('Fragrance deleted.'); load();
  };

  const patchOrder = (o) => setOrders((cur) => cur.map((x) => (x._id === o._id ? o : x)));
  const setStatus = async (id, status) => {
    try { patchOrder(await api(`/orders/${id}/status`, { method: 'PUT', body: { status } })); } catch (err) { setMsg(err.message); }
  };
  const setPayment = async (id, paymentStatus) => {
    try { patchOrder(await api(`/orders/${id}/payment`, { method: 'PUT', body: { paymentStatus } })); } catch (err) { setMsg(err.message); }
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
  const awaiting = orders.filter((o) => o.paymentStatus === 'awaiting_verification').length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Eyebrow className="mb-4">Dashboard</Eyebrow>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">Admin <em>panel</em></h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabBtn('products', `Products (${products.length})`)}
        {tabBtn('orders', `Orders (${orders.length})${awaiting ? ` · ${awaiting} to verify` : ''}`)}
        {tabBtn('tickets', `Tickets (${tickets.filter((t) => t.status !== 'closed').length} open)`)}
      </div>
      {msg && <p className="mt-4 rounded-xl bg-glass px-4 py-3 text-sm" role="status">{msg}</p>}

      {tab === 'products' && (
        <>
          <form onSubmit={save} className="mt-8 space-y-8 border border-ink/15 p-5 sm:p-6">
            <h2 className="font-display text-2xl">{editing ? 'Edit fragrance' : 'Add fragrance'}</h2>

            <section className="grid gap-4 md:grid-cols-3">
              <div><label className="label">Name</label><input className="field" value={form.name} onChange={set('name')} required /></div>
              <div><label className="label">Family</label><select className="field" value={form.family} onChange={set('family')}>{FAMILIES.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div><label className="label">Price (Rs.)</label><input type="number" min="0" step="0.01" className="field" value={form.price} onChange={set('price')} required /></div>
              <div><label className="label">Size (ml)</label><input type="number" min="1" className="field" value={form.size} onChange={set('size')} /></div>
              <div><label className="label">Stock</label><input type="number" min="0" className="field" value={form.stock} onChange={set('stock')} /></div>
              <div><label className="label">Liquid colour</label><input type="color" className="field !p-1 h-12" value={form.color} onChange={set('color')} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Show on home page</label>
            </section>

            <section>
              <h3 className="font-display text-xl">Photos <span className="text-sm text-ink/60">({form.images.length}/{MAX_PHOTOS})</span></h3>
              <p className="mt-1 text-sm text-ink/60">The first photo is the cover shown in the shop. Customers can open all of them on the product page.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
                  const src = form.images[i];
                  return src ? (
                    <div key={i} className="overflow-hidden rounded-2xl border border-ink/15 bg-white/50">
                      <div className="relative">
                        <img src={src} alt={`Photo ${i + 1}`} className="aspect-square w-full object-cover" />
                        {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs text-white">Cover</span>}
                      </div>
                      <div className="flex justify-between gap-2 px-3 py-2 text-xs">
                        {i !== 0 ? <button type="button" className="underline" onClick={() => makeCover(i)}>Make cover</button> : <span />}
                        <button type="button" className="text-red-700 underline" onClick={() => removeImg(i)}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-ink/25 text-sm text-ink/40">Empty</div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className={`btn-line cursor-pointer ${form.images.length >= MAX_PHOTOS || imgBusy ? 'pointer-events-none opacity-50' : ''}`}>
                  {imgBusy ? 'Processing…' : 'Upload photos'}
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={addFiles} />
                </label>
                <input className="field !w-72 max-w-full" placeholder="or paste an image link (https://…)" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} aria-label="Image link" />
                <button type="button" className="btn-line" onClick={addUrl}>Add link</button>
              </div>
            </section>

            <section>
              <h3 className="font-display text-xl">Description</h3>
              <p className="mt-1 text-sm text-ink/60">Shown on the product page under “About this fragrance”. Press Enter for a new paragraph.</p>
              <textarea rows="5" className="field mt-3" value={form.description} onChange={set('description')} placeholder="Describe the scent, the mood, when to wear it…" />
            </section>

            <section>
              <h3 className="font-display text-xl">Notes</h3>
              <p className="mt-1 text-sm text-ink/60">Separate notes with commas. Each one becomes a small tag on the product page.</p>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <div><label className="label">Top notes (first impression)</label><textarea rows="3" className="field" value={form.top} onChange={set('top')} placeholder="Bergamot, black pepper" /></div>
                <div><label className="label">Heart notes (the character)</label><textarea rows="3" className="field" value={form.heart} onChange={set('heart')} placeholder="Rose, cedar" /></div>
                <div><label className="label">Base notes (what lingers)</label><textarea rows="3" className="field" value={form.base} onChange={set('base')} placeholder="Amber, musk" /></div>
              </div>
            </section>

            <div className="flex gap-3">
              <button className="btn-dark" disabled={imgBusy}>{editing ? 'Save changes' : 'Add fragrance'}</button>
              {editing && <button type="button" className="btn-line" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
            </div>
          </form>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-ink/20 text-ink/60"><tr><th className="py-3">Name</th><th>Family</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-ink/10">
                    <td className="py-3">
                      <span className="flex items-center gap-3">
                        {firstImage(p) ? <img src={firstImage(p)} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="h-10 w-10 rounded-lg" style={{ background: p.color }} />}
                        <span className="font-medium">{p.name}</span>
                      </span>
                    </td>
                    <td>{p.family}</td><td>{money(p.price)}</td><td>{p.stock}</td>
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
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-3">
                <span>
                  <b>{METHOD_LABEL[o.paymentMethod] || METHOD_LABEL.cod}</b>
                  {o.transactionId && <> · TID <b>{o.transactionId}</b></>}
                  {o.payerNumber && <> · from {o.payerNumber}</>}
                </span>
                <select value={o.paymentStatus || 'unpaid'} onChange={(e) => setPayment(o._id, e.target.value)} className="field !w-56" aria-label="Payment status">
                  {Object.entries(PAY_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
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
