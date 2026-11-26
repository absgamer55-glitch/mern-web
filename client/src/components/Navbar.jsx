import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useProducts } from '../useProducts.js';
import { searchProducts } from '../search.js';
import { money } from '../api.js';
import Bottle from './Bottle.jsx';

const Truck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2 6h11v9H2z" /><path d="M13 9h4l3.5 3.5V15H13z" /><circle cx="6.5" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [mobile, setMobile] = useState(false);
  const [drop, setDrop] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(-1);
  const products = useProducts();
  const found = useMemo(() => (q.trim() ? searchProducts(products, q) : null), [products, q]);
  const top = found ? found.items.slice(0, 6) : [];
  const dropRef = useRef(null);

  useEffect(() => { setMobile(false); setDrop(false); setSearch(false); }, [pathname]);
  useEffect(() => {
    const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const link = ({ isActive }) =>
    `border-b-2 py-1 text-[15px] transition ${isActive ? 'border-ink font-medium' : 'border-transparent hover:border-ink/40'}`;
  const signOut = () => { logout(); nav('/'); };
  const doSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearch(false);
    nav(`/shop?q=${encodeURIComponent(q.trim())}`);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, top.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    else if (e.key === 'Escape') setSearch(false);
    else if (e.key === 'Enter' && active >= 0 && top[active]) { e.preventDefault(); setSearch(false); nav(`/product/${top[active]._id}`); }
  };

  const links = (
    <>
      <NavLink to="/" end className={link}>Home</NavLink>
      <NavLink to="/shop" className={link}>Shop</NavLink>
      <NavLink to="/orders" className={link}>Orders</NavLink>
      <NavLink to="/support" className={link}>Customer care</NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-30">
      <div className="flex items-center justify-center gap-3 bg-[#0E0B0A] px-5 py-2.5 text-sm text-white">
        <Truck /> Pay on delivery on every order
      </div>
      <div className="border-b border-ink/10 bg-mist/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 py-4">
          <nav className="hidden items-center gap-8 md:flex">{links}</nav>
          <button className="justify-self-start md:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu" aria-expanded={mobile}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              {mobile ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <Link to="/" className="font-display text-4xl tracking-tight">Ombre</Link>

          <div className="flex items-center justify-end gap-3">
            <Link to="/cart" className="relative p-1.5" aria-label={`Cart, ${count} items`}>
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-medium text-white">{count}</span>
              )}
            </Link>
            <button onClick={() => setSearch((s) => !s)} aria-label="Search" aria-expanded={search}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 transition hover:bg-ink/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
            </button>

            {user ? (
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDrop((d) => !d)} className="flex items-center gap-2" aria-haspopup="menu" aria-expanded={drop}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-base font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="hidden text-[15px] sm:inline">{user.name.split(' ')[0]}</span>
                  <svg className="hidden sm:block" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {drop && (
                  <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-ink/10 bg-mist py-2 text-sm shadow-xl" role="menu">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-white/60">My profile</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-white/60">My orders</Link>
                    <Link to="/support" className="block px-4 py-2 hover:bg-white/60">Customer care</Link>
                    {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 hover:bg-white/60">Admin panel</Link>}
                    <button onClick={signOut} className="block w-full border-t border-ink/10 px-4 py-2 text-left hover:bg-white/60">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="hidden text-[15px] sm:inline">Sign in</Link>
                <Link to="/register" className="btn-dark !px-5 !py-2.5">Sign up</Link>
              </div>
            )}
          </div>
        </div>

        {search && (
          <div className="border-t border-ink/10">
            <div className="mx-auto max-w-6xl px-5 py-3">
              <form onSubmit={doSearch} role="search" className="flex gap-3">
                <input
                  autoFocus className="field" placeholder="Search by name, family or notes" value={q}
                  onChange={(e) => { setQ(e.target.value); setActive(-1); }} onKeyDown={onKey}
                  role="combobox" aria-expanded={!!q.trim()} aria-controls="search-results" aria-label="Search fragrances"
                  aria-activedescendant={active >= 0 ? `sr-${active}` : undefined}
                />
                <button className="btn-dark !py-2.5">Search</button>
              </form>

              {q.trim() && (
                <div id="search-results" role="listbox" className="mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-lg">
                  {found?.closest && top.length > 0 && <p className="bg-glass/60 px-4 py-2 text-xs">No exact match for “{q.trim()}”. Closest fragrances:</p>}
                  {found && !found.closest && found.fuzzy && <p className="bg-glass/60 px-4 py-2 text-xs">Showing closest matches for “{q.trim()}”.</p>}
                  {top.map((p, idx) => (
                    <Link
                      key={p._id} id={`sr-${idx}`} role="option" aria-selected={idx === active} to={`/product/${p._id}`}
                      onClick={() => setSearch(false)} onMouseEnter={() => setActive(idx)}
                      className={`flex items-center gap-4 px-4 py-3 ${idx === active ? 'bg-glass/60' : ''}`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1.5" style={{ background: `linear-gradient(160deg, ${p.color}55, ${p.color}18)` }}>
                        {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Bottle color={p.color} label={false} className="h-full" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg leading-tight">{p.name}</span>
                        <span className="text-xs text-ink/60">{p.family} · {p.size} ml</span>
                      </span>
                      <span className="text-sm">{money(p.price)}</span>
                    </Link>
                  ))}
                  {!top.length && <p className="px-4 py-5 text-sm text-ink/60">No fragrance found for “{q.trim()}”. Try a different word.</p>}
                  {!!top.length && (
                    <Link to={`/shop?q=${encodeURIComponent(q.trim())}`} onClick={() => setSearch(false)} className="block border-t border-ink/10 px-4 py-3 text-sm underline underline-offset-4">
                      See all results
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {mobile && (
          <nav className="flex flex-col items-start gap-4 border-t border-ink/10 px-5 py-5 md:hidden">
            {links}
            {!user && <NavLink to="/login" className={link}>Sign in</NavLink>}
          </nav>
        )}
      </div>
    </header>
  );
}
