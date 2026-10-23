import { useEffect, useRef } from 'react';
import type { DailyWpm } from '../lib/storage';

/** Barras de palabras por minuto por día; se desplaza en horizontal y empieza mostrando los días más recientes. */
export default function DailyWpmChart({ days }: { days: DailyWpm[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [days.length]);

  const max = Math.max(...days.map((d) => d.wpm), 1);
  const best = Math.max(...days.map((d) => d.wpm));
  const first = days[0];
  const last = days[days.length - 1];
  const change = days.length >= 2 ? last.wpm - first.wpm : 0;

  return (
    <div>
      <div className="daily-chart" ref={scrollRef} role="img" aria-label="Palabras por minuto de cada día">
        {days.map((d) => {
          const [y, m, day] = d.day.split('-').map(Number);
          const date = new Date(y, m - 1, day);
          return (
            <div key={d.day} className="daily-col" title={`${d.wpm} p/min · ${d.readings} ${d.readings === 1 ? 'lectura' : 'lecturas'}`}>
              <span className="daily-value">{d.wpm}</span>
              <div className="daily-track">
                <div className={`daily-bar${d.wpm === best ? ' best' : ''}`} style={{ height: `${(d.wpm / max) * 100}%` }} />
              </div>
              <span className="daily-date">
                {date.toLocaleDateString('es', { day: 'numeric', month: 'short' }).replace('.', '')}
              </span>
              <span className="daily-count">{d.readings > 1 ? `${d.readings} cuentos` : ' '}</span>
            </div>
          );
        })}
      </div>
      <p className="muted small">
        Cada barra es el promedio de palabras por minuto de ese día. Los días sin lectura no aparecen.
        {days.length >= 2 &&
          (change > 0
            ? ` Desde el primer día has mejorado ${change} p/min. ¡Sigue así! 🚀`
            : change < 0
              ? ' Repite tus cuentos favoritos para ganar velocidad. 💪'
              : '')}
      </p>
    </div>
  );
}
