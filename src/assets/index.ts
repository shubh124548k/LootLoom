/**
 * LootLoom — Centralized Asset Manifest
 *
 * Folder structure for assets:
 *   src/assets/images/      — raster images
 *   src/assets/icons/        — custom SVG icons
 *   src/assets/illustrations — empty-state & hero illustrations
 *   src/assets/lottie/       — Lottie JSON animations
 *   src/assets/videos/       — video assets
 *   src/assets/audio/        — audio assets
 *   src/assets/fonts/        — custom font files
 *   src/assets/logos/        — brand logos
 *   src/assets/ads/          — future advertisement assets
 *
 * Re-export all asset URLs here so components import from one place.
 */
export const ASSETS = {
  logo: "/logo.svg",
  // future: images, illustrations, lottie, videos, audio, fonts, logos, ads
} as const;
