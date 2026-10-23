import { stories } from '../data/stories';
import { badges, streak, type Progress, type Session } from '../lib/storage';
import Stars from './Stars';

interface Props {
  session: Session;
  newBadges: string[];
  progress: Progress;
  onHome: () => void;
  onRetry: () => void;
}

const MESSAGES = ['¡Buen trabajo!', '¡Genial!', '¡Increíble!'];

export default function Rewards({ session, newBadges, progress, onHome, onRetry }: Props) {
  const story = stories.find((s) => s.id === session.storyId)!;
  const earned = badges(progress.sessions, stories.length).filter((b) => newBadges.includes(b.id));
  const previous = progress.sessions.filter((s) => s.storyId === session.storyId && s !== session && s.wpm !== null);
  const prevBestWpm = Math.max(0, ...previous.map((s) => s.wpm ?? 0));
  const improved = session.wpm !== null && previous.length > 0 && session.wpm > prevBestWpm;
  const days = streak(progress.sessions);

  return (
    <main className="screen center">
      <div className="card rewards">
        <div className="big-emoji">{story.emoji}</div>
        <h1>{MESSAGES[session.stars - 1]}</h1>
        <Stars n={session.stars} size="3.5rem" animate />
        <p>
          Respondiste bien <strong>{session.quizCorrect}</strong> de <strong>{session.quizTotal}</strong> preguntas
          {session.wpm !== null && (
            <>
              {' '}y leíste a <strong>{session.wpm}</strong> palabras por minuto
            </>
          )}
          .
        </p>
        {improved && <p className="good">¡Nuevo récord en este cuento! Antes: {prevBestWpm} p/min 🚀</p>}
        {days > 1 && <p>🔥 ¡Llevas {days} días seguidos leyendo!</p>}

        {earned.length > 0 && (
          <div className="new-badges">
            <h2>¡Nueva insignia!</h2>
            {earned.map((b) => (
              <div key={b.id} className="badge earned pop">
                <span className="badge-emoji">{b.emoji}</span>
                <strong>{b.name}</strong>
                <span className="small muted">{b.hint}</span>
              </div>
            ))}
          </div>
        )}

        <div className="row">
          <button className="btn" onClick={onRetry}>
            ↺ Repetir
          </button>
          <button className="btn primary big" onClick={onHome}>
            🏠 Inicio
          </button>
        </div>
      </div>
    </main>
  );
}
