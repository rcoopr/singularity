import { bundledThemesInfo, BundledTheme } from 'shiki';

export const html = String.raw;

export function toNumOr<F = undefined>(val: unknown, fallback?: F): number | F {
  const asNum = Number(val);
  return isNaN(asNum) ? (fallback as F) : asNum;
}

export async function writeToClipboard(text: string) {
  const type = 'text/plain';
  const blob = new Blob([text], { type });
  const data = [new ClipboardItem({ [type]: blob })];
  await navigator.clipboard.write(data);
}

export const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function updatePageTheme(theme: BundledTheme, pre?: HTMLPreElement | null) {
  const themeInfo = bundledThemesInfo.find((t) => t.id === theme);
  document.body.classList[themeInfo?.type === 'light' ? 'remove' : 'add']('dark');

  // if (pre) {
  //   const fg = pre.style.color;
  //   const bg = pre.style.backgroundColor;
  //   const fgChannels = getColorChannels(fg);
  //   const bgChannels = getColorChannels(bg);

  //   if (fgChannels) document.body.style.setProperty('--fg', fgChannels);
  //   if (bgChannels) document.body.style.setProperty('--bg', bgChannels);
  // }
}

function getColorChannels(color: CSSStyleDeclaration['color']) {
  const rgb = colorStringToRgb(color);
  if (!rgb) return;
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

function colorStringToRgb(color: string) {
  if (color.startsWith('#')) return hexToRgb(color) || undefined;
  if (color.startsWith('rgb')) {
    const [r, g, b] = color.match(/\d+/g)!.map(Number);
    return { r, g, b };
  }
}

function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export const langAbbreviations = {
  html: 'HTML',
  javascript: 'JS',
  typescript: 'TS',
};
