/**
 * Console chrome. A pointer-transparent overlay that turns the shell into a
 * physical instrument housing: a bevelled bezel, hull bolts in the corners,
 * corner brackets, and a small etched ID plate. Purely decorative.
 */
export function Frame() {
  return (
    <div className="dc-frame" aria-hidden>
      <span className="dc-bolt dc-bolt--tl" />
      <span className="dc-bolt dc-bolt--tr" />
      <span className="dc-bolt dc-bolt--bl" />
      <span className="dc-bolt dc-bolt--br" />
      <span className="dc-bracket dc-bracket--tl" />
      <span className="dc-bracket dc-bracket--tr" />
      <span className="dc-bracket dc-bracket--bl" />
      <span className="dc-bracket dc-bracket--br" />
    </div>
  );
}
