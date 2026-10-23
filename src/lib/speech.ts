// Envoltorio mínimo de la Web Speech API (reconocimiento y síntesis).

type Recognition = any;

function RecognitionCtor(): (new () => Recognition) | undefined {
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const canRecognize = (): boolean => typeof window !== 'undefined' && !!RecognitionCtor();
export const canSpeak = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

export interface Listener {
  stop(): void;
}

export interface ListenOptions {
  lang?: string;
  /** Recibe todo el texto oído hasta ahora (final + provisional). */
  onText(text: string): void;
  onError?(error: string): void;
}

/**
 * Escucha de forma continua. Algunos navegadores (Chrome en Android) cortan
 * la sesión tras unos segundos de silencio; en ese caso se reinicia sola y se
 * conserva lo que ya se había oído.
 */
export function listen({ lang = 'es-ES', onText, onError }: ListenOptions): Listener {
  const Ctor = RecognitionCtor();
  if (!Ctor) throw new Error('SpeechRecognition no disponible');
  let finalText = '';
  let active = true;
  let rec: Recognition;

  const start = () => {
    rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let sessionFinal = '';
    rec.onresult = (e: any) => {
      const finals: string[] = [];
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finals.push(r[0].transcript);
        else interim += ' ' + r[0].transcript;
      }
      sessionFinal = mergeResults(finals);
      onText(`${finalText} ${sessionFinal} ${interim}`);
    };
    rec.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      active = false;
      onError?.(e.error);
    };
    rec.onend = () => {
      finalText += ' ' + sessionFinal;
      if (active) {
        try {
          start();
        } catch {
          active = false;
        }
      }
    };
    rec.start();
  };

  start();
  return {
    stop() {
      active = false;
      rec?.stop();
    },
  };
}

/**
 * Une los resultados finales de una sesión. Chrome en Android a veces repite
 * en cada resultado todo lo reconocido antes («el faro», «el faro que»…);
 * si un resultado empieza con el anterior, lo sustituye en lugar de sumarse.
 */
export function mergeResults(results: string[]): string {
  const pieces: string[] = [];
  const key = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  for (const r of results) {
    const last = pieces[pieces.length - 1];
    if (last !== undefined && key(r).startsWith(key(last))) pieces[pieces.length - 1] = r;
    else pieces.push(r);
  }
  return pieces.join(' ');
}

export function speak(text: string, rate = 0.85): void {
  if (!canSpeak()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  u.rate = rate;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('es'));
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}
