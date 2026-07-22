import { useMemo } from 'react';

/**
 * Deep-water atmosphere behind the console: caustic light filtering down from
 * the surface and slow marine snow. The snow drifts *upward* — you are
 * descending, so the particulate streams past the viewport toward the light
 * you're leaving behind. Purely decorative, pointer-transparent, and frozen
 * under prefers-reduced-motion (see app.css).
 */
export function Backdrop({ depth }: { depth: number }) {
  // Deterministic-enough spread; generated once. Not gameplay RNG.
  const flakes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const seed = (i * 2654435761) >>> 0;
        const r = (n: number) => (((seed >> n) & 0xff) / 255);
        return {
          left: r(0) * 100,
          size: 1.5 + r(4) * 3,
          delay: -(r(8) * 18),
          dur: 14 + r(12) * 12,
          drift: (r(16) - 0.5) * 40,
          opacity: 0.12 + r(20) * 0.3,
        };
      }),
    [],
  );

  return (
    <div className="dc-backdrop" aria-hidden data-depth={Math.min(depth, 12)}>
      <div className="dc-caustics" />
      <div className="dc-caustics dc-caustics--2" />
      <div className="dc-snow">
        {flakes.map((f, i) => (
          <span
            key={i}
            className="dc-flake"
            style={
              {
                '--left': `${f.left}%`,
                '--size': `${f.size}px`,
                '--delay': `${f.delay}s`,
                '--dur': `${f.dur}s`,
                '--drift': `${f.drift}px`,
                '--op': f.opacity,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="dc-vignette" />
    </div>
  );
}
