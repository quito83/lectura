import { describe, expect, it } from 'vitest';
import { computeStars, dailyWpm, longestStreak, readToday, streak, type Session } from '../storage';

const at = (y: number, m: number, d: number): Session => ({
  storyId: 'x',
  date: new Date(y, m - 1, d, 18).toISOString(),
  wpm: 80,
  accuracy: 0.9,
  seconds: 60,
  quizCorrect: 3,
  quizTotal: 3,
  stars: 3,
});

describe('streak', () => {
  const today = new Date(2026, 9, 23, 12);

  it('cuenta los días seguidos hasta hoy', () => {
    expect(streak([at(2026, 10, 21), at(2026, 10, 22), at(2026, 10, 23)], today)).toBe(3);
  });

  it('mantiene la racha si hoy aún no ha leído', () => {
    expect(streak([at(2026, 10, 21), at(2026, 10, 22)], today)).toBe(2);
  });

  it('se rompe con un día sin leer', () => {
    expect(streak([at(2026, 10, 20), at(2026, 10, 23)], today)).toBe(1);
    expect(streak([at(2026, 10, 20)], today)).toBe(0);
  });

  it('calcula la racha más larga y las lecturas de hoy', () => {
    const s = [at(2026, 10, 1), at(2026, 10, 2), at(2026, 10, 3), at(2026, 10, 10), at(2026, 10, 23), at(2026, 10, 23)];
    expect(longestStreak(s)).toBe(3);
    expect(readToday(s, today)).toBe(2);
  });
});

describe('computeStars', () => {
  it('da de 1 a 3 estrellas según preguntas y precisión', () => {
    expect(computeStars(0, 3, 0.95)).toBe(1);
    expect(computeStars(2, 3, 0.95)).toBe(2);
    expect(computeStars(3, 3, 0.95)).toBe(3);
    expect(computeStars(3, 3, 0.6)).toBe(2);
    expect(computeStars(3, 3, null)).toBe(3);
  });
});

describe('dailyWpm', () => {
  const withWpm = (s: Session, wpm: number | null, accuracy: number | null = 0.9): Session => ({ ...s, wpm, accuracy });

  it('promedia las lecturas del mismo día y omite los días sin lectura', () => {
    const s = [
      withWpm(at(2026, 10, 22), 90),
      withWpm(at(2026, 10, 20), 70),
      withWpm(at(2026, 10, 22), 101),
      withWpm(at(2026, 10, 23), 95),
    ];
    expect(dailyWpm(s)).toEqual([
      { day: '2026-10-20', wpm: 70, readings: 1 },
      { day: '2026-10-22', wpm: 96, readings: 2 },
      { day: '2026-10-23', wpm: 95, readings: 1 },
    ]);
  });

  it('ignora las lecturas sin micrófono', () => {
    expect(dailyWpm([withWpm(at(2026, 10, 20), 120, null)])).toEqual([]);
  });
});
