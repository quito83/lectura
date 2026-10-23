import { describe, expect, it } from 'vitest';
import { accuracy, align, normalize, tokenize, words, wordsPerMinute } from '../align';

describe('normalize', () => {
  it('quita tildes y puntuación pero conserva la ñ', () => {
    expect(normalize('¿Podía?')).toBe('podia');
    expect(normalize('«Compártela».')).toBe('compartela');
    expect(normalize('Niño,')).toBe('niño');
    expect(normalize('—')).toBe('');
  });
});

describe('align', () => {
  const tokens = tokenize('El faro, siempre tenía sueño.');

  it('marca como leídas las palabras oídas en orden', () => {
    const a = align(tokens, words('el faro siempre'));
    expect(a.statuses).toEqual(['read', 'read', 'read', 'pending', 'pending']);
    expect(a.cursor).toBe(3);
    expect(a.correct).toBe(3);
  });

  it('marca como saltadas las palabras omitidas', () => {
    const a = align(tokens, words('el faro tenia sueño'));
    expect(a.statuses[2]).toBe('skipped');
    expect(a.cursor).toBe(tokens.length);
    expect(accuracy(a)).toBeCloseTo(4 / 5);
  });

  it('ignora palabras extra y repeticiones', () => {
    const a = align(tokens, words('el eh el faro faro siempre'));
    expect(a.correct).toBe(3);
    expect(a.skipped).toBe(0);
  });

  it('tolera pequeños errores del reconocimiento en palabras largas', () => {
    const a = align(tokenize('Los marineros dicen'), words('los marinero dicen'));
    expect(a.correct).toBe(3);
  });

  it('no avanza si la palabra está demasiado lejos', () => {
    const a = align(tokenize('uno dos tres cuatro cinco seis siete'), words('siete'));
    expect(a.correct).toBe(0);
    expect(a.cursor).toBe(0);
  });
});

describe('wordsPerMinute', () => {
  it('calcula palabras correctas por minuto', () => {
    expect(wordsPerMinute(90, 60000)).toBe(90);
    expect(wordsPerMinute(45, 30000)).toBe(90);
    expect(wordsPerMinute(10, 0)).toBe(0);
  });
});
