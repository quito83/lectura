import { useEffect, useRef } from 'react';

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
const SLOT = import.meta.env.VITE_ADSENSE_SLOT as string | undefined;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Anuncio de AdSense. No muestra nada si no están configurados
 * VITE_ADSENSE_CLIENT y VITE_ADSENSE_SLOT. El script se inserta en el
 * <head> al compilar (ver vite.config.ts). Como la app es para niños, los
 * anuncios se piden con tratamiento infantil (sin publicidad personalizada).
 */
export default function AdBanner() {
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !SLOT || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* bloqueador de anuncios o sin conexión */
    }
  }, []);

  if (!CLIENT || !SLOT) return null;
  return (
    <aside className="ad" aria-label="Publicidad">
      <span className="ad-label">Publicidad</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-tag-for-age-treatment="1"
      />
    </aside>
  );
}
