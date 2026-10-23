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

describe('align · casos reales', () => {
  const text = tokenize('Cada noche bostezaba y su luz se apagaba un poco. Una gaviota llamada Lila se dio cuenta.');

  it('no salta palabras cuando se repite una frase ya leída', () => {
    // Chrome en Android a veces devuelve otra vez lo ya reconocido; los niños también se corrigen.
    const a = align(text, words('cada noche bostezaba y su luz se y su luz se apagaba'));
    expect(a.skipped).toBe(0);
    expect(a.correct).toBe(8);
  });

  it('no salta por una palabra común oída de más', () => {
    const a = align(text, words('cada noche bostezaba se y su luz'));
    expect(a.skipped).toBe(0);
    expect(a.correct).toBe(6);
  });

  it('no salta cuando el reconocimiento confunde la palabra siguiente', () => {
    // «bostezaba» se oye mal como «se» y no debe saltar hasta el «se» de más adelante
    const a = align(text, words('cada noche se y su luz se apagaba'));
    expect(a.skipped).toBe(1);
    expect(a.correct).toBe(7);
  });

  it('sí detecta un salto real cuando sigue leyendo bien después', () => {
    const a = align(text, words('cada noche una gaviota llamada lila se dio cuenta'));
    expect(a.skipped).toBe(8);
    expect(a.correct).toBe(9);
  });
});

describe('wordsPerMinute', () => {
  it('calcula palabras correctas por minuto', () => {
    expect(wordsPerMinute(90, 60000)).toBe(90);
    expect(wordsPerMinute(45, 30000)).toBe(90);
    expect(wordsPerMinute(10, 0)).toBe(0);
  });
});
