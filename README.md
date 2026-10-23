# Lectura 📖

PWA en español para que niños de 8 a 11 años mejoren su **fluidez** y **comprensión lectora**.

- **Lectura en voz alta**: el niño lee un cuento y el micrófono (Web Speech API) va marcando en verde las palabras leídas y en amarillo las saltadas. Al terminar muestra el tiempo, las **palabras correctas por minuto** y la **precisión**, y propone practicar las palabras difíciles (toca una palabra para oírla).
- **Sin micrófono**: modo cronómetro con botón «Terminé».
- **Comprensión**: preguntas de opción múltiple después de cada cuento.
- **Premios**: de 1 a 3 estrellas por cuento, racha de días seguidos, meta diaria e insignias.
- **Progreso**: gráfica de palabras por minuto, historial e insignias.
- **Zona de padres** (protegida con una multiplicación): nombre, meta diaria, acento del reconocimiento de voz (España, México, Argentina…), consejos y borrar progreso.
- Instalable y funciona sin conexión (el reconocimiento de voz sí necesita internet en Chrome). Los datos se guardan solo en el dispositivo (`localStorage`).

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm test          # pruebas unitarias (Vitest)
npm run build     # comprobación de tipos + build de producción en dist/
npm run preview   # sirve dist/ para probar la PWA
```

Los iconos se generan desde `public/favicon.svg` con `node scripts/icons.mjs`.

Para añadir cuentos, edita `src/data/stories.ts` (texto, nivel y preguntas). Evita escribir números con cifras: el reconocimiento de voz los devuelve de forma imprevisible.

## Publicar

Es un sitio estático: sube `dist/` a cualquier hosting con HTTPS (necesario para el micrófono y el service worker), por ejemplo Vercel o Netlify (comando `npm run build`, carpeta `dist`).

## Instalar en el móvil

- **Android (Chrome)**: abre la web → menú ⋮ → «Instalar aplicación».
- **iPhone/iPad (Safari)**: botón Compartir → «Añadir a pantalla de inicio».

El reconocimiento de voz funciona mejor en Chrome (Android/ordenador) y Safari (iOS). Firefox no lo soporta, así que allí se usa el modo cronómetro.
