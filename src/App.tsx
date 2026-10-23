import { useCallback, useEffect, useState } from 'react';
import { stories } from './data/stories';
import { load, save, computeStars, badges, type Progress, type Session } from './lib/storage';
import Home from './components/Home';
import ReadAloud, { type ReadingResult } from './components/ReadAloud';
import Quiz from './components/Quiz';
import Rewards from './components/Rewards';
import ProgressView from './components/ProgressView';
import ParentPanel from './components/ParentPanel';

export type Screen =
  | { name: 'home' }
  | { name: 'read'; storyId: string }
  | { name: 'quiz'; storyId: string; reading: ReadingResult }
  | { name: 'rewards'; session: Session; newBadges: string[] }
  | { name: 'progress' }
  | { name: 'parents' };

export default function App() {
  const [progress, setProgress] = useState<Progress>(load);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  // El botón "atrás" del móvil vuelve al inicio en lugar de cerrar la app.
  const go = useCallback((s: Screen) => {
    if (s.name !== 'home') history.pushState({ screen: s.name }, '');
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    const onPop = () => setScreen({ name: 'home' });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const home = () => (history.state?.screen ? history.back() : setScreen({ name: 'home' }));

  const finishQuiz = (storyId: string, reading: ReadingResult, correct: number, total: number) => {
    const session: Session = {
      storyId,
      date: new Date().toISOString(),
      wpm: reading.wpm,
      accuracy: reading.accuracy,
      seconds: reading.seconds,
      quizCorrect: correct,
      quizTotal: total,
      stars: computeStars(correct, total, reading.accuracy),
    };
    const before = new Set(badges(progress.sessions, stories.length).filter((b) => b.earned).map((b) => b.id));
    const after = badges([...progress.sessions, session], stories.length);
    const newBadges = after.filter((b) => b.earned && !before.has(b.id)).map((b) => b.id);
    update((p) => ({ ...p, sessions: [...p.sessions, session] }));
    setScreen({ name: 'rewards', session, newBadges });
  };

  const story = 'storyId' in screen ? stories.find((s) => s.id === screen.storyId) : undefined;

  switch (screen.name) {
    case 'read':
      return (
        <ReadAloud
          key={screen.storyId}
          story={story!}
          lang={progress.lang}
          fontSize={progress.fontSize}
          onFontSize={(fontSize) => update((p) => ({ ...p, fontSize }))}
          onBack={home}
          onDone={(reading) => setScreen({ name: 'quiz', storyId: screen.storyId, reading })}
        />
      );
    case 'quiz':
      return (
        <Quiz
          story={story!}
          onBack={home}
          onDone={(correct, total) => finishQuiz(screen.storyId, screen.reading, correct, total)}
        />
      );
    case 'rewards':
      return (
        <Rewards
          session={screen.session}
          newBadges={screen.newBadges}
          progress={progress}
          onHome={home}
          onRetry={() => setScreen({ name: 'read', storyId: screen.session.storyId })}
        />
      );
    case 'progress':
      return <ProgressView progress={progress} onBack={home} />;
    case 'parents':
      return <ParentPanel progress={progress} update={update} onBack={home} />;
    default:
      return (
        <Home
          progress={progress}
          update={update}
          onRead={(storyId) => go({ name: 'read', storyId })}
          onProgress={() => go({ name: 'progress' })}
          onParents={() => go({ name: 'parents' })}
        />
      );
  }
}
