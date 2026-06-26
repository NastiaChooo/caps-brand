/**
 * Grain
 * A single fixed noise layer rendered once at the document root. The noise is an
 * inline SVG `feTurbulence` (no network request, no image asset), desaturated
 * and tiled. See `.grain` in globals.css for why this is essentially free.
 *
 * Server component — pure markup, computed at module load.
 */

const NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#n)'/>
</svg>`;

const NOISE_URI = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`;

export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="grain"
      style={{ backgroundImage: NOISE_URI, backgroundSize: "180px 180px" }}
    />
  );
}
