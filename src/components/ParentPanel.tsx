import { useMemo, useState } from 'react';
import { emptyProgress, type Progress } from '../lib/storage';
import TopBar from './TopBar';

interface Props {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  onBack: () => void;
}

const LANGS = [
  ['es-ES', 'Español (España)'],
  ['es-MX', 'Español (México)'],
  ['es-US', 'Español (EE. UU.)'],
  ['es-AR', 'Español (Argentina)'],
  ['es-CO', 'Español (Colombia)'],
  ['es-CL', 'Español (Chile)'],
  ['es-PE', 'Español (Perú)'],
];

export default function ParentPanel({ progress, update, onBack }: Props) {
  const [a, b] = useMemo(() => [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)], []);
  const [answer, setAnswer] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <main className="screen">
        <TopBar title="Zona de padres" onBack={onBack} />
        <form
          className="card center-text"
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(answer) === a * b) setUnlocked(true);
            else setAnswer('');
          }}
        >
          <p>Para entrar, resuelve:</p>
          <h2>
            {a} × {b} = ?
          </h2>
          <input className="input" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value)} autoFocus />
          <button className="btn primary">Entrar</button>
        </form>
      </main>
    );
  }

  return (
    <main className="screen">
      <TopBar title="Zona de padres" onBack={onBack} />

      <section className="card form">
        <label>
          Nombre del lector
          <input
            className="input"
            value={progress.childName}
            maxLength={20}
            onChange={(e) => update((p) => ({ ...p, childName: e.target.value }))}
          />
        </label>
        <label>
          Meta diaria (cuentos al día)
          <select className="input" value={progress.dailyGoal} onChange={(e) => update((p) => ({ ...p, dailyGoal: Number(e.target.value) }))}>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Acento para el reconocimiento de voz
          <select className="input" value={progress.lang} onChange={(e) => update((p) => ({ ...p, lang: e.target.value }))}>
            {LANGS.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card tips">
        <h2>Consejos</h2>
        <ul>
          <li>
            <strong>Palabras por minuto (p/min)</strong> mide la fluidez: solo cuenta palabras leídas correctamente. Como referencia
            orientativa, entre 3.º y 5.º de primaria muchos niños leen entre 80 y 130 p/min, pero lo importante es que mejore respecto a sí mismo.
          </li>
          <li>Repetir el mismo cuento varias veces (lectura repetida) es una de las mejores formas de ganar fluidez.</li>
          <li>Leed juntos: escucha el cuento con «🔊 Escuchar» y después que lo lea él. Hablad de las preguntas al terminar.</li>
          <li>
            El reconocimiento de voz funciona mejor en Chrome (Android/ordenador) o Safari (iPhone), con conexión a internet y en un
            lugar tranquilo. Sin micrófono también se puede practicar con el cronómetro.
          </li>
          <li>Los datos se guardan solo en este dispositivo.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Borrar progreso</h2>
        <p className="muted small">Elimina todas las lecturas, estrellas e insignias de este dispositivo.</p>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('¿Seguro que quieres borrar todo el progreso?')) update(() => emptyProgress());
          }}
        >
          Borrar todo
        </button>
      </section>
    </main>
  );
}
