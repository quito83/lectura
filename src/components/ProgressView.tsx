import { stories } from '../data/stories';
import { badges, dailyWpm, longestStreak, streak, type Progress, type Session } from '../lib/storage';
import DailyWpmChart from './DailyWpmChart';
import Stars from './Stars';
import TopBar from './TopBar';

export default function ProgressView({ progress, onBack }: { progress: Progress; onBack: () => void }) {
  const { sessions } = progress;
  const withMic = sessions.filter((s) => s.wpm !== null && s.accuracy !== null);
  const bestWpm = Math.max(0, ...withMic.map((s) => s.wpm!));
  const avgAcc = withMic.length ? Math.round((withMic.reduce((a, s) => a + s.accuracy!, 0) / withMic.length) * 100) : null;
  const days = dailyWpm(sessions);
  const quizTotal = sessions.reduce((a, s) => a + s.quizTotal, 0);
  const quizPct = quizTotal ? Math.round((sessions.reduce((a, s) => a + s.quizCorrect, 0) / quizTotal) * 100) : null;

  return (
    <main className="screen">
      <TopBar title="Mi progreso" onBack={onBack} />

      <section className="stats-grid">
        <Stat emoji="📚" value={sessions.length} label="lecturas" />
        <Stat emoji="🔥" value={streak(sessions)} label={`racha (récord ${longestStreak(sessions)})`} />
        <Stat emoji="⚡" value={bestWpm || '–'} label="mejor p/min" />
        <Stat emoji="🎯" value={avgAcc !== null ? `${avgAcc}%` : '–'} label="precisión media" />
        <Stat emoji="🧠" value={quizPct !== null ? `${quizPct}%` : '–'} label="preguntas bien" />
      </section>

      <section className="card">
        <h2>Fluidez día a día</h2>
        {days.length > 0 ? (
          <DailyWpmChart days={days} />
        ) : (
          <p className="muted">Lee un cuento con micrófono para ver tu primera barra.</p>
        )}
      </section>

      <section className="card">
        <h2>Palabras por minuto en cada lectura</h2>
        {withMic.length >= 2 ? (
          <WpmChart sessions={withMic.slice(-20)} />
        ) : (
          <p className="muted">Lee al menos dos cuentos con micrófono para ver tu gráfica.</p>
        )}
      </section>

      <section className="card">
        <h2>Insignias</h2>
        <div className="badge-grid">
          {badges(sessions, stories.length).map((b) => (
            <div key={b.id} className={`badge${b.earned ? ' earned' : ''}`} title={b.hint}>
              <span className="badge-emoji">{b.earned ? b.emoji : '🔒'}</span>
              <strong>{b.name}</strong>
              <span className="small muted">{b.hint}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Historial</h2>
        {sessions.length === 0 && <p className="muted">Todavía no hay lecturas.</p>}
        <ul className="history">
          {[...sessions].reverse().slice(0, 30).map((s, i) => {
            const story = stories.find((st) => st.id === s.storyId);
            return (
              <li key={i}>
                <span>{story?.emoji}</span>
                <span className="history-main">
                  <strong>{story?.title ?? s.storyId}</strong>
                  <span className="small muted">
                    {new Date(s.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    {s.wpm !== null && ` · ${s.wpm} p/min`}
                    {s.accuracy !== null && ` · ${Math.round(s.accuracy * 100)}%`}
                    {` · ${s.quizCorrect}/${s.quizTotal} preguntas`}
                  </span>
                </span>
                <Stars n={s.stars} />
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
  return (
    <div className="stat">
      <span className="stat-emoji">{emoji}</span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function WpmChart({ sessions }: { sessions: Session[] }) {
  const W = 320;
  const H = 160;
  const pad = { l: 32, r: 12, t: 12, b: 20 };
  const values = sessions.map((s) => s.wpm!);
  const max = Math.max(20, Math.ceil(Math.max(...values) / 20) * 20);
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, values.length - 1);
  const y = (v: number) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const ticks = [0, max / 2, max];
  const path = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Gráfica de palabras por minuto">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" className="tick">
            {t}
          </text>
        </g>
      ))}
      <path d={path} className="line" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={4} className="point">
          <title>{`${v} p/min`}</title>
        </circle>
      ))}
    </svg>
  );
}
