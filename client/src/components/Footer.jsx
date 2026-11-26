import { Link } from 'react-router-dom';

const Icon = ({ children }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const perks = [
  { title: 'Pay on delivery', text: 'Pay when your order arrives at your door.',
    icon: <><path d="M2 6h11v9H2z" /><path d="M13 9h4l3 3v3h-7z" /><circle cx="6" cy="17" r="1.8" /><circle cx="16.5" cy="17" r="1.8" /></> },
  { title: 'Hand filled bottles', text: 'Small batches filled one bottle at a time.',
    icon: <><path d="M12 3l8 4v10l-8 4-8-4V7z" /><path d="M4 7l8 4 8-4M12 11v10" /></> },
  { title: 'Track every order', text: 'See each step from confirmed to delivered.',
    icon: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></> },
  { title: 'Real support', text: 'Raise a ticket about any order and we reply inside it.',
    icon: <><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /><path d="M19 20c0 1.5-2 2-5 2" /></> },
];

// Replace these with your own pages.
const socials = [
  { name: 'Instagram', href: 'https://www.instagram.com/', icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" /></> },
  { name: 'YouTube', href: 'https://www.youtube.com/', icon: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></> },
  { name: 'TikTok', href: 'https://www.tiktok.com/', icon: <><path d="M14 3v11.5a3.5 3.5 0 11-3.5-3.5" /><path d="M14 3c.3 2.5 2 4.2 5 4.5" /></> },
  { name: 'X', href: 'https://x.com/', icon: <path d="M4 4l16 16M20 4L4 20" /> },
];
const families = ['Woody', 'Floral', 'Citrus', 'Amber', 'Fresh'];

export default function Footer() {
  return (
    <footer className="mt-24">
      <section className="bg-gradient-to-b from-[#FBEADF] to-[#F2D9C6]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-3 py-10 sm:px-5 sm:py-12 lg:grid-cols-4 lg:divide-x lg:divide-ink/15">
          {perks.map((p) => (
            <div key={p.title} className="flex flex-col items-center px-3 text-center sm:px-6">
              <Icon>{p.icon}</Icon>
              <h3 className="mt-3 font-display text-xl">{p.title}</h3>
              <p className="mt-1 max-w-[16rem] text-sm text-ink/70">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="relative overflow-hidden bg-gradient-to-br from-[#241127] via-[#1B0F1C] to-[#120A12] text-mist">
        <svg className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 opacity-40 sm:h-80 sm:w-80 sm:opacity-60" viewBox="-100 -100 200 200" aria-hidden="true">
          <defs>
            <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B35FB0" /><stop offset="1" stopColor="#4A1650" /></linearGradient>
          </defs>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="0" cy="-48" rx="22" ry="52" fill="url(#petal)" transform={`rotate(${a})`} />
          ))}
        </svg>

        <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <div className="font-display text-5xl tracking-wider">FTD</div>
            <p className="mt-4 max-w-xs text-mist/80">Small-batch perfumes made from a short list of honest ingredients.</p>
          </div>
          <div>
            <h4 className="font-display text-xl">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm text-mist/70">
              <li><Link to="/shop" className="hover:text-white">All fragrances</Link></li>
              {families.map((f) => <li key={f}><Link to={`/shop?family=${f}`} className="hover:text-white">{f}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xl">Help</h4>
            <ul className="mt-4 space-y-2 text-sm text-mist/70">
              <li><Link to="/support" className="hover:text-white">Customer care</Link></li>
              <li><Link to="/orders" className="hover:text-white">Track an order</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xl">Account</h4>
            <ul className="mt-4 space-y-2 text-sm text-mist/70">
              <li><Link to="/profile" className="hover:text-white">My profile</Link></li>
              <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-white">Create account</Link></li>
            </ul>
          </div>
        </div>

        <div className="relative border-t border-mist/15">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
            <div className="flex items-center gap-5">
              {socials.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="text-mist/70 transition hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </a>
              ))}
            </div>
            <span className="text-xs text-mist/50">© {new Date().getFullYear()} FTD. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
