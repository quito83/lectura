import { useState } from 'react';
import { stories, LEVEL_NAMES, type Story } from '../data/stories';
import { bestStars, readToday, streak, type Progress } from '../lib/storage';
import Stars from './Stars';

interface Props {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  onRead: (storyId: string) => void;
  onProgress: () => void;
  onParents: () => void;
}

export default function Home({ progress, update, onRead, onProgress, onParents }: Props) {
  const [name, setName] = useState('');
  const best = bestStars(progress.sessions);
  const days = streak(progress.sessions);
  const today = readToday(progress.sessions);
  const goalDone = today >= progress.dailyGoal;
  const levels = [1, 2, 3] as const;

  if (!progress.childName) {
    return (
      <main className="screen center">
        <div className="card welcome">
          <div className="big-emoji">📖</div>
          <h1>¡Hola, lector!</h1>
          <p>¿Cómo te llamas?</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) update((p) => ({ ...p, childName: name.trim() }));
            }}
          >
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              maxLength={20}
            />
            <button className="btn primary" disabled={!name.trim()}>
              ¡Empezar!
            </button>
          </form>
        </div>
      </main>
    );
  }

  const nextStory = stories.find((s) => !best[s.id]) ?? stories.find((s) => (best[s.id] ?? 0) < 3);

  return (
    <main className="screen">
      <header className="home-header">
        <div>
          <p className="muted">¡Hola,</p>
          <h1>{progress.childName}!</h1>
        </div>
        <button className="icon-btn" onClick={onParents} aria-label="Zona de padres">
          ⚙️
        </button>
      </header>

      <section className="stats-row">
        <div className="stat">
          <span className="stat-emoji">🔥</span>
          <strong>{days}</strong>
          <span>{days === 1 ? 'día seguido' : 'días seguidos'}</span>
        </div>
        <div className={`stat${goalDone ? ' done' : ''}`}>
          <span className="stat-emoji">{goalDone ? '✅' : '🎯'}</span>
          <strong>
            {Math.min(today, progress.dailyGoal)}/{progress.dailyGoal}
          </strong>
          <span>meta de hoy</span>
        </div>
        <button className="stat link" onClick={onProgress}>
          <span className="stat-emoji">📈</span>
          <strong>{Object.values(best).reduce((a, b) => a + b, 0)}</strong>
          <span>estrellas</span>
        </button>
      </section>

      {nextStory && (
        <button className="card next" onClick={() => onRead(nextStory.id)}>
          <span className="next-emoji">{nextStory.emoji}</span>
          <span>
            <span className="muted small">{best[nextStory.id] ? 'Mejora tus estrellas' : 'Siguiente cuento'}</span>
            <strong className="next-title">{nextStory.title}</strong>
          </span>
          <span className="next-go">▶</span>
        </button>
      )}

      {levels.map((level) => (
        <section key={level}>
          <h2 className="level-title">{LEVEL_NAMES[level]}</h2>
          <div className="story-grid">
            {stories
              .filter((s) => s.level === level)
              .map((s) => (
                <StoryCard key={s.id} story={s} stars={best[s.id] ?? 0} onClick={() => onRead(s.id)} />
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}

function StoryCard({ story, stars, onClick }: { story: Story; stars: number; onClick: () => void }) {
  const wordCount = story.text.split(/\s+/).length;
  return (
    <button className="card story-card" onClick={onClick}>
      <span className="story-emoji">{story.emoji}</span>
      <strong>{story.title}</strong>
      <span className="muted small">{wordCount} palabras</span>
      <Stars n={stars} />
    </button>
  );
}
