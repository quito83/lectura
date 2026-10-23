export type WordStatus = 'pending' | 'read' | 'skipped';

export interface Token {
  /** Texto tal como se muestra (con puntuación). */
  display: string;
  /** Forma normalizada para comparar; vacía si es solo puntuación. */
  norm: string;
}

/** Minúsculas, sin tildes (pero conservando la ñ) y sin puntuación. */
export function normalize(word: string): string {
  return word
    .toLowerCase()
    .replace(/ñ/g, '\u0000')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0000/g, 'ñ')
    .replace(/[^a-z0-9ñ]/g, '');
}

export function tokenize(text: string): Token[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((display) => ({ display, norm: normalize(display) }));
}

export function words(text: string): string[] {
  return text.split(/\s+/).map(normalize).filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/** Coincidencia tolerante: el reconocimiento de voz a veces cambia una letra. */
export function similar(expected: string, heard: string): boolean {
  if (expected === heard) return true;
  if (expected.length < 4 || heard.length < 3) return false;
  return levenshtein(expected, heard) <= (expected.length >= 8 ? 2 : 1);
}

/** Cuántas palabras del texto puede saltarse el lector antes de que dejemos de buscar. */
const LOOKAHEAD = 4;

export interface Alignment {
  statuses: WordStatus[];
  /** Índice (en tokens) de la siguiente palabra a leer. */
  cursor: number;
  correct: number;
  skipped: number;
}

/**
 * Alinea lo que se ha oído con el texto esperado. Avanza de izquierda a
 * derecha: cada palabra oída se busca en las siguientes palabras del texto;
 * si se encuentra, las intermedias quedan como "saltadas". Las palabras
 * oídas que no encajan se ignoran (repeticiones, muletillas…).
 */
export function align(tokens: Token[], heard: string[]): Alignment {
  const statuses: WordStatus[] = tokens.map((t) => (t.norm ? 'pending' : 'read'));
  const idx = tokens.map((t, i) => (t.norm ? i : -1)).filter((i) => i >= 0);
  let pos = 0;
  for (const h of heard) {
    for (let k = pos; k < Math.min(idx.length, pos + LOOKAHEAD + 1); k++) {
      if (similar(tokens[idx[k]].norm, h)) {
        for (let s = pos; s < k; s++) statuses[idx[s]] = 'skipped';
        statuses[idx[k]] = 'read';
        pos = k + 1;
        break;
      }
    }
  }
  const correct = idx.filter((i) => statuses[i] === 'read').length;
  const skipped = idx.filter((i) => statuses[i] === 'skipped').length;
  return { statuses, cursor: pos < idx.length ? idx[pos] : tokens.length, correct, skipped };
}

/** Palabras correctas por minuto. */
export function wordsPerMinute(correctWords: number, ms: number): number {
  if (ms <= 0) return 0;
  return Math.round(correctWords / (ms / 60000));
}

/** Precisión sobre las palabras alcanzadas (leídas + saltadas). */
export function accuracy(a: Pick<Alignment, 'correct' | 'skipped'>): number {
  const reached = a.correct + a.skipped;
  return reached === 0 ? 0 : a.correct / reached;
}
