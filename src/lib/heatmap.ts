export const LEVEL_ALPHAS = [0, 0.24, 0.5, 0.7, 0.9];

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = Number.parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function getCellBackground(hex: string, level: number): string {
  if (level <= 0) return "transparent";
  const [r, g, b] = hexToRgb(hex);
  const alpha = LEVEL_ALPHAS[level];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
