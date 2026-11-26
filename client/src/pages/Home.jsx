import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Bottle from '../components/Bottle.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

// To use real photos instead of the drawn scene, put them in client/public
// and add  image: '/hero-1.jpg'  to a slide below.
const slides = [
  {
    tone: 'cream', dark: false, color: '#D9A03B',
    bg: 'bg-gradient-to-br from-[#F8EADF] via-[#F2DDCB] to-[#E6CBB0]',
    eyebrow: 'Luxury fragrances',
    title: <>Scent, poured <em>slowly.</em></>,
    text: 'Small-batch perfumes made from a short list of honest ingredients. Each bottle is filled by hand.',
    primary: { to: '/shop', label: 'Shop fragrances', icon: 'arrow' },
  },
  {
    tone: 'plum', dark: true, color: '#C98F86',
    bg: 'bg-gradient-to-br from-[#240A28] via-[#5A1D60] to-[#C58BCB]',
    eyebrow: 'Ombre experience',
    title: <>Not sure which scent is <em>yours?</em></>,
    text: "Tell us what you usually wear and we'll point you to a bottle.",
    primary: { to: '/support', label: 'Ask customer care', icon: 'chat' },
    secondary: { to: '/shop', label: 'Shop all' },
    emColor: '[&_em]:!text-[#E7B4EC]',
  },
  {
    tone: 'dark', dark: true, color: '#E0B35A',
    bg: 'bg-gradient-to-br from-[#14100F] via-[#2B1E15] to-[#5C4025]',
    eyebrow: 'Small batch',
    title: <>Made by hand, <em>bottle by bottle.</em></>,
    text: 'A short list of honest ingredients and nothing hurried.',
    primary: { to: '/shop', label: 'See the collection', icon: 'arrow' },
    emColor: '[&_em]:!text-gold',
  },
];

const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Chat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v11H9l-5 4z" /></svg>;
const Chevron = ({ dir }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={dir === 'l' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></svg>;

// Drawn scene: bottle on a rock, with soft smoke. Swap for a photo via `image`.
function Scene({ tone, color }) {
  const smoke = tone === 'cream' ? '#2A2220' : tone === 'plum' ? '#F0C4F4' : '#E0B35A';
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[32rem]">
      <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id={`blur-${tone}`}><feGaussianBlur stdDeviation="9" /></filter>
          <linearGradient id={`rock-${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#54443B" /><stop offset="1" stopColor="#14100F" /></linearGradient>
        </defs>
        <g filter={`url(#blur-${tone})`} fill="none" stroke={smoke} strokeLinecap="round" opacity=".35">
          <path d="M60 520 C 160 380, 40 300, 200 220 S 420 180, 560 60" strokeWidth="46" />
          <path d="M120 560 C 300 470, 260 330, 420 300 S 560 220, 590 140" strokeWidth="30" />
        </g>
        {tone === 'plum' && (
          <g transform="translate(150 470)">
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-34" rx="16" ry="38" fill="#C46FC0" transform={`rotate(${a})`} />)}
            <circle r="8" fill="#F3D27A" />
          </g>
        )}
        <path d="M70 600 L100 505 Q135 450 230 455 Q300 432 380 452 Q475 440 510 515 L535 600 Z" fill={`url(#rock-${tone})`} />
      </svg>
      <div className="absolute bottom-[20%] left-1/2 h-[62%] -translate-x-1/2">
        <Bottle color={color} rise className="h-full w-auto drop-shadow-2xl" />
      </div>
    </div>
  );
}

const pad = (n) => String(n).padStart(2, '0');

function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const s = slides[i];

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((c) => (c + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [paused]);
  const go = (d) => setI((c) => (c + d + slides.length) % slides.length);

  const primary = s.dark ? 'btn bg-white text-ink hover:bg-gold' : 'btn-dark';
  const secondary = 'btn border border-white/60 text-white hover:bg-white/10';

  return (
    <section
      className={`relative overflow-hidden transition-colors ${s.bg}`}
      aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      {s.image && (
        <img src={s.image} alt="" className="hidden object-cover md:absolute md:inset-y-0 md:right-0 md:block md:h-full md:w-[55%] [mask-image:linear-gradient(to_right,transparent,black_30%)]" />
      )}
      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-5 pb-10 pt-12 md:min-h-[40rem] md:grid-cols-2 md:py-16">
        <div key={`t${i}`} className={`fade-in ${s.dark ? 'text-white' : 'text-ink'}`}>
          <Eyebrow className="max-w-sm">{s.eyebrow}</Eyebrow>
          <h1 className={`mt-6 font-display text-5xl leading-[1.05] md:text-7xl ${s.emColor || ''}`}>{s.title}</h1>
          <p className={`mt-6 max-w-md text-lg ${s.dark ? 'text-white/85' : 'text-ink/70'}`}>{s.text}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to={s.primary.to} className={primary}>
              {s.primary.icon === 'chat' && <Chat />}{s.primary.label}{s.primary.icon === 'arrow' && <Arrow />}
            </Link>
            {s.secondary && <Link to={s.secondary.to} className={secondary}>{s.secondary.label}<Chevron dir="r" /></Link>}
          </div>
          <div className="mt-12 flex items-center gap-5">
            <span className="font-display text-xl">{pad(i + 1)} <span className="opacity-50">— {pad(slides.length)}</span></span>
            <span className={`relative block h-0.5 w-28 ${s.dark ? 'bg-white/25' : 'bg-ink/20'}`}>
              <span className={`absolute inset-y-0 left-0 transition-all duration-500 ${s.dark ? 'bg-white' : 'bg-ink'}`} style={{ width: `${((i + 1) / slides.length) * 100}%` }} />
            </span>
            {[['l', -1, 'Previous slide'], ['r', 1, 'Next slide']].map(([d, n, label]) => (
              <button key={d} onClick={() => go(n)} aria-label={label}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${s.dark ? 'border-white/60 hover:bg-white/10' : 'border-ink/40 hover:bg-ink/5'}`}>
                <Chevron dir={d} />
              </button>
            ))}
          </div>
        </div>
        {!s.image && <div key={`s${i}`} className="fade-in"><Scene tone={s.tone} color={s.color} /></div>}
      </div>
    </section>
  );
}

const families = [
  { name: 'Woody', note: 'Cedar, vetiver, smoke', dot: '#A8703A' },
  { name: 'Floral', note: 'Peony, rose, iris', dot: '#D9668F' },
  { name: 'Citrus', note: 'Neroli, lemon, salt', dot: '#E3C03C' },
  { name: 'Amber', note: 'Saffron, oud, resin', dot: '#D9822B' },
  { name: 'Fresh', note: 'Fig leaf, tea, musk', dot: '#5FB58C' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    api('/products').then((all) => {
      const f = all.filter((p) => p.featured);
      setFeatured((f.length ? f : all).slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-5 pt-20">
        <Eyebrow className="text-ink">Our favorites</Eyebrow>
        <div className="mt-4 flex items-end justify-between">
          <h2 className="font-display text-5xl md:text-6xl">Most <em>loved</em></h2>
          <Link to="/shop" className="inline-flex items-center gap-2 border-b border-ink pb-1 text-sm">See all <Arrow /></Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
        {!featured.length && <p className="mt-8 text-ink/60">No fragrances yet. Add some from the admin panel.</p>}
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24">
        <Eyebrow className="text-ink">By family</Eyebrow>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">Find your <em>family</em></h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {families.map((f) => (
            <Link key={f.name} to={`/shop?family=${f.name}`} className="group rounded-3xl bg-white/45 p-6 transition hover:bg-ink hover:text-mist">
              <span className="mb-5 block h-3 w-3 rounded-full" style={{ background: f.dot }} />
              <div className="font-display text-2xl">{f.name}</div>
              <div className="mt-2 text-sm opacity-70">{f.note}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
