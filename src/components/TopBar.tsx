import type { ReactNode } from 'react';

export default function TopBar({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onBack} aria-label="Volver">
        ←
      </button>
      <h1>{title}</h1>
      <div className="topbar-right">{right}</div>
    </header>
  );
}
