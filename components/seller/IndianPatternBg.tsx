"use client";

/**
 * Decorative, brand-tinted Indian motif backdrop for the seller auth pages.
 *
 * Implementation: a CSS `background-image` (tiling SVG data-URI) on an absolute
 * layer behind the form card. This is far more reliable than an inline <svg>
 * (no sizing/viewBox quirks) and tiles seamlessly via `background-repeat`.
 *
 * The form sits inside an opaque card on top of this layer, so the pattern only
 * shows in the empty background around the card — no readability mask needed.
 *
 * ── To use a real generated image instead ──
 * Replace PATTERN_URL below with your asset, e.g.
 *   const PATTERN_URL = `url("/seller-bg-pattern.png")`;
 * (or cdnUrl(...) for a CDN asset) and adjust BACKGROUND_SIZE / WRAPPER_OPACITY.
 */

const WRAPPER_OPACITY = 0.55;
const BACKGROUND_SIZE = "180px 180px";

// 180x180 jaali tile: overlapping-circle lattice + central rosette + paisleys.
const TILE_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'>
  <g fill='none' stroke='#1A6FD4' stroke-width='1.2'>
    <circle cx='0'   cy='0'   r='90' opacity='0.55'/>
    <circle cx='180' cy='0'   r='90' opacity='0.55'/>
    <circle cx='0'   cy='180' r='90' opacity='0.55'/>
    <circle cx='180' cy='180' r='90' opacity='0.55'/>
    <circle cx='90'  cy='90'  r='90' opacity='0.55'/>
    <circle cx='90'  cy='0'   r='90' opacity='0.4'/>
    <circle cx='0'   cy='90'  r='90' opacity='0.4'/>
    <circle cx='180' cy='90'  r='90' opacity='0.4'/>
    <circle cx='90'  cy='180' r='90' opacity='0.4'/>
  </g>

  <!-- central 8-petal rosette -->
  <g fill='none' stroke='#1A6FD4' stroke-width='1.1' opacity='0.9'>
    <ellipse cx='90' cy='90' rx='13' ry='5' transform='rotate(0 90 90)'/>
    <ellipse cx='90' cy='90' rx='13' ry='5' transform='rotate(45 90 90)'/>
    <ellipse cx='90' cy='90' rx='13' ry='5' transform='rotate(90 90 90)'/>
    <ellipse cx='90' cy='90' rx='13' ry='5' transform='rotate(135 90 90)'/>
  </g>
  <circle cx='90' cy='90' r='2.5' fill='#1A6FD4' opacity='0.6'/>

  <!-- paisleys in each quadrant -->
  <g fill='none' stroke='#1A6FD4' stroke-width='1.1' opacity='0.85'>
    <path d='M45 30 C60 31 63 50 47 58 C36 63 27 54 32 45 C35 39 44 40 45 47'/>
    <path d='M135 30 C150 31 153 50 137 58 C126 63 117 54 122 45 C125 39 134 40 135 47'/>
    <path d='M45 120 C60 121 63 140 47 148 C36 153 27 144 32 135 C35 129 44 130 45 137'/>
    <path d='M135 120 C150 121 153 140 137 148 C126 153 117 144 122 135 C125 129 134 130 135 137'/>
  </g>

  <!-- kolam dots on edge midpoints -->
  <g fill='#1A6FD4' opacity='0.5'>
    <circle cx='90' cy='0'   r='2.5'/>
    <circle cx='0'  cy='90'  r='2.5'/>
    <circle cx='180' cy='90' r='2.5'/>
    <circle cx='90' cy='180' r='2.5'/>
  </g>
</svg>`;

const PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(TILE_SVG)}")`;

export default function IndianPatternBg() {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        opacity: WRAPPER_OPACITY,
        backgroundImage: PATTERN_URL,
        backgroundRepeat: "repeat",
        backgroundSize: BACKGROUND_SIZE,
      }}
    />
  );
}
