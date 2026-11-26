// A flacon drawn in SVG. `color` is the liquid. `rise` plays the fill animation once.
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

export default function Bottle({ color = '#D9A03B', rise = false, label = true, className = '' }) {
  const id = `b-${color.replace('#', '')}`;
  const dark = /^#[0-9a-f]{6}$/i.test(color) && lum(color) < 0.5;
  const text = dark ? '#F7E9DD' : '#14100F';
  return (
    <svg viewBox="0 0 120 200" className={className} role="img" aria-label="Perfume bottle">
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".78" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <clipPath id={`${id}-c`}><rect x="16" y="70" width="88" height="122" rx="10" /></clipPath>
      </defs>
      <rect x="42" y="4" width="36" height="32" rx="3" fill="#14100F" />
      <rect x="42" y="33" width="36" height="4" fill="#C99A4B" />
      <rect x="50" y="37" width="20" height="33" fill="#EFE3D8" stroke="#14100F" strokeOpacity=".25" />
      <rect x="16" y="70" width="88" height="122" rx="10" fill="#fff" fillOpacity=".35" stroke="#14100F" strokeOpacity=".3" />
      <g clipPath={`url(#${id}-c)`}>
        <rect x="16" y="82" width="88" height="112" fill={`url(#${id}-l)`} className={rise ? 'liquid-rise' : ''} />
      </g>
      <rect x="22" y="76" width="76" height="110" rx="6" fill="none" stroke="#fff" strokeOpacity=".5" />
      <rect x="25" y="90" width="5" height="88" rx="2.5" fill="#fff" fillOpacity=".55" />
      {label && (
        <>
          <text x="60" y="132" textAnchor="middle" fontFamily="'Bodoni Moda', serif" fontSize="20" letterSpacing="2" fill={text}>FTD</text>
          <text x="60" y="146" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize="5" letterSpacing="1.6" fill={text}>EAU DE PARFUM</text>
        </>
      )}
    </svg>
  );
}
