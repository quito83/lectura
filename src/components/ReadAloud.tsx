import { useEffect, useMemo, useRef, useState } from 'react';
import type { Story } from '../data/stories';
import { accuracy, align, tokenize, words, wordsPerMinute, type Token } from '../lib/align';
import { canRecognize, canSpeak, listen, speak, type Listener } from '../lib/speech';
import TopBar from './TopBar';

export interface ReadingResult {
  /** null si se leyó sin micrófono. */
  wpm: number | null;
  accuracy: number | null;
  seconds: number;
}

interface Props {
  story: Story;
  lang: string;
  fontSize: number;
  onFontSize: (px: number) => void;
  onBack: () => void;
  onDone: (r: ReadingResult) => void;
}

type Phase = 'ready' | 'reading' | 'done';

const MIC_ERRORS: Record<string, string> = {
  'not-allowed': 'No hay permiso para usar el micrófono. Puedes leer sin micrófono.',
  'service-not-allowed': 'El reconocimiento de voz no está disponible. Puedes leer sin micrófono.',
  network: 'El reconocimiento de voz necesita internet. Puedes leer sin micrófono.',
  'audio-capture': 'No se encontró ningún micrófono. Puedes leer sin micrófono.',
};

export default function ReadAloud({ story, lang, fontSize, onFontSize, onBack, onDone }: Props) {
  const paragraphs = useMemo(() => {
    let start = 0;
    return story.text.split('\n').map((p) => {
      const tokens = tokenize(p);
      const para = { start, tokens };
      start += tokens.length;
      return para;
    });
  }, [story]);
  const tokens = useMemo<Token[]>(() => paragraphs.flatMap((p) => p.tokens), [paragraphs]);
  const totalWords = useMemo(() => tokens.filter((t) => t.norm).length, [tokens]);

  const [phase, setPhase] = useState<Phase>('ready');
  const [useMic, setUseMic] = useState(canRecognize());
  const [heard, setHeard] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReadingResult | null>(null);
  const startRef = useRef(0);
  const listenerRef = useRef<Listener | null>(null);
  const currentRef = useRef<HTMLSpanElement | null>(null);

  const alignment = useMemo(() => align(tokens, heard), [tokens, heard]);

  useEffect(() => () => listenerRef.current?.stop(), []);

  useEffect(() => {
    if (phase !== 'reading') return;
    const t = setInterval(() => setElapsed(Date.now() - startRef.current), 250);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [alignment.cursor]);

  const start = () => {
    setHeard([]);
    setError('');
    setElapsed(0);
    startRef.current = Date.now();
    if (useMic) {
      try {
        listenerRef.current = listen({
          lang,
          onText: (text) => setHeard(words(text)),
          onError: (e) => {
            setError(MIC_ERRORS[e] ?? `Error del micrófono (${e}).`);
            setUseMic(false);
            setPhase('ready');
          },
        });
      } catch {
        setUseMic(false);
        return;
      }
    }
    setPhase('reading');
  };

  const finish = () => {
    listenerRef.current?.stop();
    listenerRef.current = null;
    const ms = Date.now() - startRef.current;
    const r: ReadingResult = useMic
      ? { wpm: wordsPerMinute(alignment.correct, ms), accuracy: accuracy(alignment), seconds: Math.round(ms / 1000) }
      : { wpm: wordsPerMinute(totalWords, ms), accuracy: null, seconds: Math.round(ms / 1000) };
    setResult(r);
    setPhase('done');
  };

  // Termina solo al llegar a la última palabra.
  useEffect(() => {
    if (phase === 'reading' && useMic && alignment.cursor >= tokens.length) finish();
  }, [alignment.cursor]);

  const skippedWords = useMemo(
    () => [...new Set(tokens.filter((_, i) => alignment.statuses[i] === 'skipped').map((t) => t.display.replace(/[^\p{L}]/gu, '')))],
    [tokens, alignment],
  );

  const status = (i: number) => {
    if (!useMic || phase === 'ready') return '';
    if (i === alignment.cursor && phase === 'reading') return 'current';
    return alignment.statuses[i] === 'pending' ? '' : alignment.statuses[i];
  };

  const fontControls = (
    <div className="font-controls">
      <button className="icon-btn small" onClick={() => onFontSize(Math.max(18, fontSize - 2))} aria-label="Letra más pequeña">
        A−
      </button>
      <button className="icon-btn small" onClick={() => onFontSize(Math.min(40, fontSize + 2))} aria-label="Letra más grande">
        A+
      </button>
    </div>
  );

  return (
    <main className="screen reading-screen">
      <TopBar title={`${story.emoji} ${story.title}`} onBack={onBack} right={fontControls} />

      <article className="story-text" style={{ fontSize }}>
        {paragraphs.map((p, pi) => (
          <p key={pi}>
            {p.tokens.map((t, j) => {
              const i = p.start + j;
              return (
                <span key={i}>
                  <span
                    ref={i === alignment.cursor ? currentRef : undefined}
                    className={`word ${status(i)}`}
                    onClick={() => canSpeak() && t.norm && speak(t.display.replace(/[^\p{L}]/gu, ''))}
                  >
                    {t.display}
                  </span>{' '}
                </span>
              );
            })}
          </p>
        ))}
      </article>

      <footer className="reading-bar">
        {phase === 'ready' && (
          <>
            {error && <p className="error">{error}</p>}
            <p className="muted small center-text">
              {useMic
                ? 'Pulsa el micrófono y lee en voz alta. Las palabras se pondrán verdes.'
                : 'Pulsa empezar, lee el cuento y luego pulsa «Terminé».'}{' '}
              Toca una palabra para oírla.
            </p>
            <div className="row">
              {canSpeak() && (
                <button className="btn" onClick={() => speak(story.text, 0.9)}>
                  🔊 Escuchar
                </button>
              )}
              <button className="btn primary big" onClick={start}>
                {useMic ? '🎤 Empezar a leer' : '▶ Empezar'}
              </button>
            </div>
            {canRecognize() && (
              <label className="toggle small">
                <input type="checkbox" checked={useMic} onChange={(e) => setUseMic(e.target.checked)} /> Usar micrófono
              </label>
            )}
          </>
        )}

        {phase === 'reading' && (
          <div className="row">
            <span className="timer">
              {useMic && <span className="rec-dot" />} ⏱ {formatTime(elapsed)}
            </span>
            {useMic && (
              <span className="muted small">
                {alignment.correct}/{totalWords}
              </span>
            )}
            <button className="btn primary big" onClick={finish}>
              ✋ Terminé
            </button>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="result">
            <div className="stats-row">
              <div className="stat">
                <span className="stat-emoji">⏱</span>
                <strong>{formatTime(result.seconds * 1000)}</strong>
                <span>tiempo</span>
              </div>
              <div className="stat">
                <span className="stat-emoji">⚡</span>
                <strong>{result.wpm}</strong>
                <span>palabras/min</span>
              </div>
              {result.accuracy !== null && (
                <div className="stat">
                  <span className="stat-emoji">🎯</span>
                  <strong>{Math.round(result.accuracy * 100)}%</strong>
                  <span>precisión</span>
                </div>
              )}
            </div>
            {skippedWords.length > 0 && (
              <div className="practice">
                <p className="small">Practica estas palabras (tócalas para oírlas):</p>
                <div className="chips">
                  {skippedWords.slice(0, 12).map((w) => (
                    <button key={w} className="chip" onClick={() => speak(w)}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="row">
              <button className="btn" onClick={() => setPhase('ready')}>
                ↺ Otra vez
              </button>
              <button className="btn primary big" onClick={() => onDone(result)}>
                Preguntas ➜
              </button>
            </div>
          </div>
        )}
      </footer>
    </main>
  );
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
