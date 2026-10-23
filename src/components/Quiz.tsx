import { useState } from 'react';
import type { Story } from '../data/stories';
import TopBar from './TopBar';

interface Props {
  story: Story;
  onBack: () => void;
  onDone: (correct: number, total: number) => void;
}

export default function Quiz({ story, onBack, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = story.questions[index];
  const last = index === story.questions.length - 1;

  const choose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    if (i === q.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (last) {
      onDone(correct, story.questions.length);
    } else {
      setIndex(index + 1);
      setChosen(null);
    }
  };

  return (
    <main className="screen">
      <TopBar title="¿Lo entendiste?" onBack={onBack} />
      <div className="progress-dots" aria-label={`Pregunta ${index + 1} de ${story.questions.length}`}>
        {story.questions.map((_, i) => (
          <span key={i} className={i < index ? 'dot done' : i === index ? 'dot current' : 'dot'} />
        ))}
      </div>
      <div className="card quiz-card">
        <p className="muted small">
          Pregunta {index + 1} de {story.questions.length}
        </p>
        <h2 className="quiz-q">{q.q}</h2>
        <div className="options">
          {q.options.map((opt, i) => {
            let cls = 'option';
            if (chosen !== null) {
              if (i === q.answer) cls += ' right';
              else if (i === chosen) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => choose(i)} disabled={chosen !== null && i !== chosen && i !== q.answer}>
                {opt}
              </button>
            );
          })}
        </div>
        {chosen !== null && (
          <div className="feedback">
            <p className={chosen === q.answer ? 'good' : 'bad'}>
              {chosen === q.answer ? '¡Muy bien! 🎉' : 'Casi… la respuesta correcta está en verde.'}
            </p>
            <button className="btn primary big" onClick={next}>
              {last ? 'Ver mis estrellas ★' : 'Siguiente ➜'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
