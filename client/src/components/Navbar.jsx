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

const I = {
  home: <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />,
  shop: <><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></>,
  orders: <><path d="M12 3l8 4v10l-8 4-8-4V7z" /><path d="M4 7l8 4 8-4M12 11v10" /></>,
  care: <><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
  admin: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />,
};

const MItem = ({ to, end, icon, children }) => (
  <NavLink
    to={to} end={end}
    className={({ isActive }) => `flex items-center gap-4 rounded-xl px-4 py-3.5 text-[17px] transition ${isActive ? 'bg-ink text-white' : 'hover:bg-white/60'}`}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
    {children}
  </NavLink>
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

  // Menu drawer: lock page scroll, close on Escape or when the screen grows.
  useEffect(() => {
    if (!mobile) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => { if (e.key === 'Escape') setMobile(false); };
    const onResize = () => { if (window.innerWidth >= 768) setMobile(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [mobile]);

  const link = ({ isActive }) =>
    `border-b-2 py-1 text-[15px] transition ${isActive ? 'border-ink font-medium' : 'border-transparent hover:border-ink/40'}`;
  const signOut = () => { logout(); setMobile(false); nav('/'); };
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
    <>
    <header className="sticky top-0 z-30">
      <div className="flex items-center justify-center gap-3 bg-[#0E0B0A] px-5 py-2.5 text-sm text-white">
        <Truck /> Pay on delivery on every order
      </div>
      <div className="border-b border-ink/10 bg-mist/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 py-3 sm:px-5 sm:py-4">
          <nav className="hidden items-center gap-8 md:flex">{links}</nav>
          <button className="justify-self-start p-1 md:hidden" onClick={() => setMobile(true)} aria-label="Open menu" aria-haspopup="dialog" aria-expanded={mobile}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>

          <Link to="/" className="font-display text-3xl tracking-wider sm:text-4xl">FTD</Link>

          <div className="flex items-center justify-end gap-1.5 sm:gap-3">
            <Link to="/cart" className="relative p-1.5" aria-label={`Cart, ${count} items`}>
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-medium text-white">{count}</span>
              )}
            </Link>
            <button onClick={() => setSearch((s) => !s)} aria-label="Search" aria-expanded={search}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 sm:h-10 sm:w-10 transition hover:bg-ink/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
            </button>

            {user ? (
              <div className="relative hidden md:block" ref={dropRef}>
                <button onClick={() => setDrop((d) => !d)} className="flex items-center gap-2" aria-haspopup="menu" aria-expanded={drop}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-base sm:h-11 sm:w-11 font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="text-[15px]">{user.name.split(' ')[0]}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
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
              <div className="hidden items-center gap-3 md:flex">
                <Link to="/login" className="text-[15px]">Sign in</Link>
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
                <div id="search-results" role="listbox" className="mt-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-ink/10 bg-white/80 shadow-lg">
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
      </div>
    </header>

    {mobile && (
      <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="absolute inset-0 bg-ink/50" onClick={() => setMobile(false)} />
        <aside className="slide-in absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-mist shadow-2xl">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <Link to="/" className="font-display text-3xl tracking-wider">FTD</Link>
            <button onClick={() => setMobile(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 hover:bg-ink/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          {user ? (
            <Link to="/profile" className="m-5 mb-2 flex items-center gap-4 rounded-2xl bg-white/55 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-lg text-white">{user.name.charAt(0).toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{user.name}</span>
                <span className="block truncate text-sm text-ink/60">{user.email}</span>
              </span>
            </Link>
          ) : (
            <div className="m-5 mb-2 rounded-2xl bg-white/55 p-4">
              <p className="text-sm text-ink/70">Sign in to track your orders and contact customer care.</p>
              <div className="mt-3 flex gap-3">
                <Link to="/login" className="btn-line flex-1 !py-2.5">Sign in</Link>
                <Link to="/register" className="btn-dark flex-1 !py-2.5">Sign up</Link>
              </div>
            </div>
          )}

          <nav className="space-y-1 px-3 pt-3" aria-label="Main">
            <MItem to="/" end icon={I.home}>Home</MItem>
            <MItem to="/shop" icon={I.shop}>Shop</MItem>
            <MItem to="/orders" icon={I.orders}>Orders</MItem>
            <MItem to="/support" icon={I.care}>Customer care</MItem>
          </nav>

          {user && (
            <nav className="mx-3 mt-4 space-y-1 border-t border-ink/10 px-0 pt-4" aria-label="Account">
              <MItem to="/profile" icon={I.user}>My profile</MItem>
              {user.role === 'admin' && <MItem to="/admin" icon={I.admin}>Admin panel</MItem>}
            </nav>
          )}

          <div className="mt-auto p-5">
            {user && <button onClick={signOut} className="btn-line w-full">Sign out</button>}
            <p className="mt-4 text-center text-xs text-ink/50">Pay on delivery on every order</p>
          </div>
        </aside>
      </div>
    )}
    </>
  );
}
