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
  const maxEdits = expected.length >= 8 ? 2 : 1;
  if (Math.abs(expected.length - heard.length) > maxEdits) return false;
  return levenshtein(expected, heard) <= maxEdits;
}

export interface Alignment {
  statuses: WordStatus[];
  /** Índice (en tokens) de la siguiente palabra a leer. */
  cursor: number;
  correct: number;
  skipped: number;
}

// Puntuación de la alineación: acertar una palabra suma; saltarse una del
// texto u oír una que sobra resta. Así, un salto solo compensa si después
// siguen coincidiendo varias palabras seguidas.
const MATCH = 2;
const FUZZY_MATCH = 1.5;
const SKIP = -1;
const EXTRA = -1;

const enum Step {
  Match = 1,
  Extra = 2,
  Skip = 3,
}

/**
 * Alinea lo que se ha oído con el texto esperado buscando la alineación de
 * mayor puntuación (programación dinámica, como un diff). Las palabras oídas
 * que no encajan (repeticiones, muletillas, errores del reconocimiento) se
 * descartan; las del texto que quedan entre dos aciertos se marcan como
 * saltadas, y las posteriores al último acierto siguen pendientes.
 */
export function align(tokens: Token[], heard: string[]): Alignment {
  const statuses: WordStatus[] = tokens.map((t) => (t.norm ? 'pending' : 'read'));
  const idx = tokens.map((t, i) => (t.norm ? i : -1)).filter((i) => i >= 0);
  const n = idx.length;
  const m = heard.length;
  const w = n + 1;
  const score = new Float64Array((m + 1) * w);
  const step = new Uint8Array((m + 1) * w);
  // El vocabulario es pequeño: se compara cada par de palabras distintas una sola vez.
  const ids = (list: string[]) => {
    const unique = [...new Set(list)];
    const pos = new Map(unique.map((u, k) => [u, k]));
    return { unique, of: list.map((x) => pos.get(x)!) };
  };
  const text = ids(idx.map((k) => tokens[k].norm));
  const said = ids(heard);
  const gains = new Float64Array(text.unique.length * said.unique.length);
  text.unique.forEach((e, a) =>
    said.unique.forEach((h, b) => {
      gains[a * said.unique.length + b] = e === h ? MATCH : similar(e, h) ? FUZZY_MATCH : -Infinity;
    }),
  );
  for (let j = 1; j <= n; j++) {
    score[j] = j * SKIP;
    step[j] = Step.Skip;
  }
  for (let i = 1; i <= m; i++) {
    score[i * w] = i * EXTRA;
    step[i * w] = Step.Extra;
    for (let j = 1; j <= n; j++) {
      const gain = gains[text.of[j - 1] * said.unique.length + said.of[i - 1]];
      // En caso de empate se prefiere acertar, luego descartar lo oído y por último saltar texto.
      let best = score[(i - 1) * w + j - 1] + gain;
      let how = Step.Match;
      const extra = score[(i - 1) * w + j] + EXTRA;
      if (extra > best) {
        best = extra;
        how = Step.Extra;
      }
      const skip = score[i * w + j - 1] + SKIP;
      if (skip > best) {
        best = skip;
        how = Step.Skip;
      }
      score[i * w + j] = best;
      step[i * w + j] = how;
    }
  }

  // Lo que queda del texto tras el último acierto no está saltado, sino pendiente.
  let end = 0;
  for (let j = 1; j <= n; j++) if (score[m * w + j] > score[m * w + end]) end = j;

  let i = m;
  let j = end;
  while (i > 0 || j > 0) {
    const how = step[i * w + j];
    if (how === Step.Match) {
      statuses[idx[--j]] = 'read';
      i--;
    } else if (how === Step.Extra) {
      i--;
    } else {
      statuses[idx[--j]] = 'skipped';
    }
  }

  const correct = idx.filter((k) => statuses[k] === 'read').length;
  const skipped = idx.filter((k) => statuses[k] === 'skipped').length;
  return { statuses, cursor: end < n ? idx[end] : tokens.length, correct, skipped };
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
