import { describe, expect, it } from 'vitest';
import { mergeResults } from '../speech';

describe('mergeResults', () => {
  it('une resultados normales', () => {
    expect(mergeResults(['el faro', ' que siempre'])).toBe('el faro  que siempre');
  });

  it('no duplica los resultados acumulados de Chrome en Android', () => {
    expect(mergeResults(['el faro', 'el faro que siempre', 'El faro que siempre tenía sueño'])).toBe(
      'El faro que siempre tenía sueño',
    );
  });
});
