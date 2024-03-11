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

export function updatePageTheme(theme: BundledTheme) {
  const themeInfo = bundledThemesInfo.find((t) => t.id === theme);
  document.body.classList[themeInfo?.type === 'light' ? 'remove' : 'add']('dark');
}

export const langAbbreviations = {
  html: 'HTML',
  javascript: 'JS',
  typescript: 'TS',
};
