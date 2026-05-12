// src/lib/gpu-engine/palettes.ts — Named colour palettes and sampling function
// All values in linear [0..1] range

export type PaletteColors = {
  primary: [number, number, number];
  accent: [number, number, number];
};

export const PALETTES: Record<string, PaletteColors> = {
  EMERALD:  { primary: [0.12, 0.85, 0.52], accent: [0.95, 0.95, 0.20] },
  GOLD:     { primary: [1.00, 0.78, 0.10], accent: [1.00, 0.40, 0.05] },
  CRIMSON:  { primary: [1.00, 0.15, 0.20], accent: [1.00, 0.70, 0.10] },
  AZURE:    { primary: [0.10, 0.55, 1.00], accent: [0.80, 0.20, 1.00] },
  AMETHYST: { primary: [0.60, 0.15, 0.95], accent: [0.95, 0.50, 1.00] },
  FROST:    { primary: [0.70, 0.90, 1.00], accent: [0.30, 0.80, 1.00] },
  ROSE:     { primary: [1.00, 0.30, 0.50], accent: [1.00, 0.85, 0.50] },
  NEBULA:   { primary: [0.40, 0.10, 0.90], accent: [0.90, 0.20, 0.50] },
  AMBER:    { primary: [1.00, 0.55, 0.05], accent: [1.00, 0.95, 0.60] },
  JADE:     { primary: [0.15, 0.75, 0.55], accent: [0.80, 1.00, 0.40] },
  SOLAR:    { primary: [1.00, 0.85, 0.20], accent: [1.00, 0.40, 0.00] },
  LUNAR:    { primary: [0.85, 0.88, 0.95], accent: [0.50, 0.60, 0.85] },
  VOID:     { primary: [0.30, 0.05, 0.80], accent: [0.05, 0.80, 0.90] },
};

export const PALETTE_NAMES = Object.keys(PALETTES);

/** Pick a colour from a named palette obeying 85/15 split. Returns [r, g, b]. */
export function samplePalette(name?: string): [number, number, number] {
  const finalName = name && PALETTES[name] ? name : 'GOLD';
  const p = PALETTES[finalName];
  return Math.random() < 0.85 ? p.primary : p.accent;
}

/** Randomly distinct a palette for fireworks variation */
export function getRandomPaletteName(): string {
  return PALETTE_NAMES[Math.floor(Math.random() * PALETTE_NAMES.length)];
}
