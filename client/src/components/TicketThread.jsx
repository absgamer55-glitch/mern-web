import { useState } from 'react';
import { money } from '../api.js';

export const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`;

// One support ticket with its messages. `onReply(id, text)` must resolve true on success.
export default function TicketThread({ t, isAdmin, onReply, onStatus }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const closed = t.status === 'closed';

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    if (await onReply(t._id, text)) setText('');
    setBusy(false);
  };

  return (
    <div className="border border-ink/15 p-5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">{t.subject}</h3>
          <p className="mt-1 text-ink/60">
            {t.category} · {new Date(t.createdAt).toLocaleDateString()}
            {isAdmin && t.user && <> · {t.user.name} ({t.user.email})</>}
          </p>
          <p className="mt-1 text-ink/60">
            {t.order
              ? <>Order {shortId(t.order._id)} · {t.order.items.map((i) => `${i.name} × ${i.qty}`).join(', ')} · {money(t.order.total)} · {t.order.status}</>
              : 'Not about a specific order'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 capitalize ${closed ? 'bg-glass' : t.status === 'answered' ? 'bg-resin/20' : 'bg-ink text-mist'}`}>{t.status}</span>
      </div>

      <ul className="mt-5 space-y-3">
        {t.messages.map((m, i) => {
          const mine = isAdmin ? m.from === 'admin' : m.from === 'customer';
          return (
            <li key={i} className={`max-w-[85%] px-4 py-3 ${mine ? 'ml-auto bg-ink text-mist' : 'bg-glass/70'}`}>
              <p className="mb-1 text-xs opacity-60">{m.from === 'admin' ? 'Ombre support' : 'Customer'} · {new Date(m.at).toLocaleString()}</p>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </li>
          );
        })}
      </ul>

      {closed ? (
        <p className="mt-5 text-ink/60">This ticket is closed.{isAdmin && <> <button className="underline" onClick={() => onStatus(t._id, 'open')}>Reopen</button></>}</p>
      ) : (
        <form onSubmit={send} className="mt-5 flex flex-wrap gap-3">
          <input className="field flex-1" placeholder={isAdmin ? 'Reply to customer' : 'Add a message'} value={text} onChange={(e) => setText(e.target.value)} aria-label="Reply" />
          <button disabled={busy} className="btn-dark">Send</button>
          <button type="button" className="btn-line" onClick={() => onStatus(t._id, 'closed')}>{isAdmin ? 'Close ticket' : 'Mark as solved'}</button>
        </form>
      )}
    </div>
  );
}
