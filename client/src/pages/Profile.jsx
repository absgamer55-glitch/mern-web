import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { shortId } from '../components/TicketThread.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [info, setInfo] = useState({ name: user.name, email: user.email });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [orders, setOrders] = useState([]);

  useEffect(() => { api('/orders/mine').then(setOrders).catch(() => {}); }, []);

  const saveInfo = async (e) => {
    e.preventDefault();
    try {
      const d = await api('/auth/me', { method: 'PUT', body: info });
      updateUser(d.user); setInfoMsg({ type: 'ok', text: 'Details saved.' });
    } catch (err) { setInfoMsg({ type: 'err', text: err.message }); }
  };

  const savePw = async (e) => {
    e.preventDefault();
    try {
      await api('/auth/me', { method: 'PUT', body: pw });
      setPw({ currentPassword: '', newPassword: '' }); setPwMsg({ type: 'ok', text: 'Password changed.' });
    } catch (err) { setPwMsg({ type: 'err', text: err.message }); }
  };

  const msg = (m) => m.text && <p className={`text-sm ${m.type === 'ok' ? 'text-resin' : 'text-red-700'}`} role="status">{m.text}</p>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink font-display text-3xl text-mist">{user.name.charAt(0).toUpperCase()}</span>
        <div>
          <h1 className="font-display text-4xl">{user.name}</h1>
          <p className="text-ink/60">{user.email}{user.role === 'admin' && ' · Admin'}</p>
        </div>
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <form onSubmit={saveInfo} className="space-y-4">
          <h2 className="font-display text-2xl">Your details</h2>
          <div><label className="label" htmlFor="pname">Full name</label><input id="pname" className="field" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} required /></div>
          <div><label className="label" htmlFor="pemail">Email</label><input id="pemail" type="email" className="field" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} required /></div>
          {msg(infoMsg)}
          <button className="btn-dark">Save details</button>
        </form>

        <form onSubmit={savePw} className="space-y-4">
          <h2 className="font-display text-2xl">Change password</h2>
          <div><label className="label" htmlFor="cur">Current password</label><input id="cur" type="password" className="field" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></div>
          <div><label className="label" htmlFor="new">New password</label><input id="new" type="password" minLength={6} className="field" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></div>
          {msg(pwMsg)}
          <button className="btn-dark">Change password</button>
        </form>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl">Your orders</h2>
        {!orders.length ? (
          <p className="mt-4 text-ink/60">No orders yet. <Link to="/shop" className="underline">Browse fragrances</Link></p>
        ) : (
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {orders.map((o) => (
              <li key={o._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <b>{shortId(o._id)}</b> · {new Date(o.createdAt).toLocaleDateString()}
                  <p className="text-ink/60">{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <b>{money(o.total)}</b>
                  <span className="rounded-full bg-glass px-3 py-1 capitalize">{o.status}</span>
                  <Link to={`/support?order=${o._id}`} className="underline underline-offset-4">Get help</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
