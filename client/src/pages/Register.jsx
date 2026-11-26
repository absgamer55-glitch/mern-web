import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await register(form.name, form.email, form.password); nav('/shop'); }
    catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-5 py-10">
      <Eyebrow className="mb-4">Join Ombre</Eyebrow>
      <h1 className="font-display text-5xl">Create <em>account</em></h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div><label className="label" htmlFor="name">Full name</label><input id="name" className="field" value={form.name} onChange={set('name')} required /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="field" value={form.email} onChange={set('email')} required /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" minLength={6} className="field" value={form.password} onChange={set('password')} required /><p className="mt-1 text-xs text-ink/60">At least 6 characters.</p></div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="btn-dark w-full">{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="mt-6 text-sm text-ink/70">Already have an account? <Link to="/login" className="underline">Sign in</Link></p>
    </div>
  );
}
