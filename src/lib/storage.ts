export interface Session {
  storyId: string;
  /** ISO date-time. */
  date: string;
  /** Palabras correctas por minuto; null si se leyó sin micrófono. */
  wpm: number | null;
  /** 0–1; null si se leyó sin micrófono. */
  accuracy: number | null;
  /** Segundos que tardó en leer. */
  seconds: number;
  quizCorrect: number;
  quizTotal: number;
  stars: number;
}

export interface Progress {
  childName: string;
  /** Cuentos al día para cumplir la meta. */
  dailyGoal: number;
  /** Idioma del reconocimiento de voz (es-ES, es-MX…). */
  lang: string;
  /** Tamaño del texto de lectura en px. */
  fontSize: number;
  sessions: Session[];
}

const KEY = 'lectura.progress.v1';

export const emptyProgress = (): Progress => ({
  childName: '',
  dailyGoal: 1,
  lang: 'es-ES',
  fontSize: 26,
  sessions: [],
});

export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* almacenamiento lleno o bloqueado: seguimos sin guardar */
  }
}

/** Fecha local YYYY-MM-DD. */
export function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function computeStars(quizCorrect: number, quizTotal: number, acc: number | null): number {
  const ratio = quizTotal ? quizCorrect / quizTotal : 0;
  let stars = 1;
  if (ratio >= 0.5) stars++;
  if (ratio === 1 && (acc === null || acc >= 0.85)) stars++;
  return stars;
}

/** Días seguidos (hasta hoy, o hasta ayer si hoy aún no ha leído) con al menos una lectura. */
export function streak(sessions: Session[], today = new Date()): number {
  const days = new Set(sessions.map((s) => dayKey(new Date(s.date))));
  const d = new Date(today);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function readToday(sessions: Session[], today = new Date()): number {
  const k = dayKey(today);
  return sessions.filter((s) => dayKey(new Date(s.date)) === k).length;
}

export function bestStars(sessions: Session[]): Record<string, number> {
  const best: Record<string, number> = {};
  for (const s of sessions) best[s.storyId] = Math.max(best[s.storyId] ?? 0, s.stars);
  return best;
}

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  hint: string;
  earned: boolean;
}

export function badges(sessions: Session[], totalStories: number): Badge[] {
  const best = bestStars(sessions);
  const totalStars = Object.values(best).reduce((a, b) => a + b, 0);
  const maxWpm = Math.max(0, ...sessions.map((s) => s.wpm ?? 0));
  const longest = longestStreak(sessions);
  const perfectQuizzes = sessions.filter((s) => s.quizTotal > 0 && s.quizCorrect === s.quizTotal).length;
  const b = (id: string, emoji: string, name: string, hint: string, earned: boolean): Badge => ({
    id, emoji, name, hint, earned,
  });
  return [
    b('first', '📖', 'Primer cuento', 'Lee tu primer cuento', sessions.length >= 1),
    b('five', '📚', 'Lector constante', 'Lee 5 cuentos', sessions.length >= 5),
    b('streak3', '🔥', 'Racha de 3', 'Lee 3 días seguidos', longest >= 3),
    b('streak7', '🌟', 'Semana lectora', 'Lee 7 días seguidos', longest >= 7),
    b('quiz', '🧠', 'Detective', 'Acierta todas las preguntas de 3 cuentos', perfectQuizzes >= 3),
    b('fast80', '⚡', 'Veloz', 'Lee a 80 palabras por minuto', maxWpm >= 80),
    b('fast110', '🚀', 'Cohete', 'Lee a 110 palabras por minuto', maxWpm >= 110),
    b('stars', '🏆', 'Coleccionista', `Consigue ${totalStories * 3} estrellas`, totalStars >= totalStories * 3),
  ];
}

export function longestStreak(sessions: Session[]): number {
  const days = [...new Set(sessions.map((s) => dayKey(new Date(s.date))))].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const [y, m, d] = k.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    run = prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}
