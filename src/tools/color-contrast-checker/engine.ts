import type {
  ColorContrastInput,
  ColorContrastOutput,
  ColorShade,
} from './definition';

function parseHex(hexStr: string): { r: number; g: number; b: number } | null {
  let hex = (hexStr || '').trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = transform(rgb.r);
  const g = transform(rgb.g);
  const b = transform(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function generatePalette(baseRgb: { r: number; g: number; b: number }): ColorShade[] {
  const steps = [
    { shade: 50, factor: 0.95, blendWithWhite: true },
    { shade: 100, factor: 0.85, blendWithWhite: true },
    { shade: 200, factor: 0.65, blendWithWhite: true },
    { shade: 300, factor: 0.45, blendWithWhite: true },
    { shade: 400, factor: 0.20, blendWithWhite: true },
    { shade: 500, factor: 0.0, blendWithWhite: true }, // Base
    { shade: 600, factor: 0.15, blendWithWhite: false }, // Blend with black
    { shade: 700, factor: 0.35, blendWithWhite: false },
    { shade: 800, factor: 0.55, blendWithWhite: false },
    { shade: 900, factor: 0.75, blendWithWhite: false },
  ];

  return steps.map(({ shade, factor, blendWithWhite }) => {
    if (shade === 500) {
      return { shade, hex: rgbToHex(baseRgb.r, baseRgb.g, baseRgb.b) };
    }
    const target = blendWithWhite ? 255 : 0;
    const r = baseRgb.r + (target - baseRgb.r) * factor;
    const g = baseRgb.g + (target - baseRgb.g) * factor;
    const b = baseRgb.b + (target - baseRgb.b) * factor;
    return { shade, hex: rgbToHex(r, g, b) };
  });
}

export function executeColorContrastChecker(
  input: ColorContrastInput
): ColorContrastOutput {
  const fg = (input?.foregroundHex || '').trim();
  const bg = (input?.backgroundHex || '').trim();

  const fgRgb = parseHex(fg);
  const bgRgb = parseHex(bg);

  if (!fgRgb || !bgRgb) {
    return {
      isValid: false,
      error: 'Please enter valid 3-digit or 6-digit HEX color codes (e.g. #000000, #FFFFFF).',
      foregroundHex: fg,
      backgroundHex: bg,
      contrastRatio: 1,
      ratioDisplay: '1:1',
      wcagAaNormal: false,
      wcagAaLarge: false,
      wcagAaaNormal: false,
      wcagAaaLarge: false,
      wcagUiComponent: false,
      paletteShades: [],
    };
  }

  const lumFg = getLuminance(fgRgb);
  const lumBg = getLuminance(bgRgb);

  const l1 = Math.max(lumFg, lumBg);
  const l2 = Math.min(lumFg, lumBg);

  const rawRatio = (l1 + 0.05) / (l2 + 0.05);
  const contrastRatio = Math.round(rawRatio * 100) / 100;
  const ratioDisplay = `${contrastRatio.toFixed(2)}:1`;

  const wcagAaNormal = contrastRatio >= 4.5;
  const wcagAaLarge = contrastRatio >= 3.0;
  const wcagAaaNormal = contrastRatio >= 7.0;
  const wcagAaaLarge = contrastRatio >= 4.5;
  const wcagUiComponent = contrastRatio >= 3.0;

  const paletteShades = generatePalette(fgRgb);

  return {
    isValid: true,
    foregroundHex: rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b),
    backgroundHex: rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b),
    contrastRatio,
    ratioDisplay,
    wcagAaNormal,
    wcagAaLarge,
    wcagAaaNormal,
    wcagAaaLarge,
    wcagUiComponent,
    paletteShades,
  };
}
