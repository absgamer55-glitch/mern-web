// Small spaced label with a line on each side: —— OUR FAVORITES ——
export default function Eyebrow({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="h-px w-6 bg-current opacity-40 sm:w-10" />
      <span className="text-xs uppercase tracking-[0.25em] opacity-70 sm:tracking-[0.3em]">{children}</span>
      <span className="h-px w-6 bg-current opacity-40 sm:w-10" />
    </div>
  );
}
