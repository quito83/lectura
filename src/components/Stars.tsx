export default function Stars({ n, size = '1em', animate = false }: { n: number; size?: string; animate?: boolean }) {
  return (
    <span className={`stars${animate ? ' stars-pop' : ''}`} style={{ fontSize: size }} aria-label={`${n} de 3 estrellas`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'star on' : 'star'} style={{ animationDelay: `${i * 0.25}s` }}>
          ★
        </span>
      ))}
    </span>
  );
}
