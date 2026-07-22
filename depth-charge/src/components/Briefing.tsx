import { useEffect, useRef } from 'react';
import type { Action } from '../state/actions';
import type { BriefingId } from '../engine/types';
import { briefingById } from '../engine/config';

export function Briefing({
  id,
  dispatch,
}: {
  id: BriefingId;
  dispatch: React.Dispatch<Action>;
}) {
  const data = briefingById(id);
  const dialogRef = useRef<HTMLDivElement>(null);

  const dismiss = () => dispatch({ type: 'DISMISS_BRIEFING' });

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'DISMISS_BRIEFING' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  if (!data) return null;

  return (
    <div className="dc-brief-backdrop" onPointerDown={dismiss}>
      <div
        ref={dialogRef}
        className="dc-brief"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dc-brief-title"
        tabIndex={-1}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="dc-brief-x" onClick={dismiss} aria-label="Close">
          ✕
        </button>
        <p className="dc-brief-kicker mono">NEW HAZARD · DEPTH {String(data.depth).padStart(2, '0')}</p>
        <div className="dc-brief-glyph mono" aria-hidden>
          {data.glyph}
        </div>
        <h2 id="dc-brief-title" className="dc-brief-title">
          {data.title}
        </h2>
        <div className="dc-brief-lines">
          {data.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <button type="button" className="dc-btn dc-btn--primary dc-brief-go" onClick={dismiss}>
          <span className="dc-btn-main">DIVE ON</span>
        </button>
      </div>
    </div>
  );
}
