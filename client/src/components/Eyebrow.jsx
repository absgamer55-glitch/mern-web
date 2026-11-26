// Small spaced label with a line on each side: —— OUR FAVORITES ——
export default function Eyebrow({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="h-px w-10 bg-current opacity-40" />
      <span className="text-xs uppercase tracking-[0.3em] opacity-70">{children}</span>
      <span className="h-px w-10 bg-current opacity-40" />
    </div>
  );
}
