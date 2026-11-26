import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const u = await login(email, password);
      nav(state?.from || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-5 py-10">
      <Eyebrow className="mb-4">Welcome back</Eyebrow>
      <h1 className="font-display text-5xl">Sign <em>in</em></h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="btn-dark w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-sm text-ink/70">New here? <Link to="/register" className="underline">Create an account</Link></p>
    </div>
  );
}
