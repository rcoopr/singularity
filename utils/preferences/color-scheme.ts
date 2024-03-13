import { bundledColors } from '@/utils/shiki/bundled-colors';
import { bundledThemesInfo, BundledTheme } from 'shiki';

export function prefersDark() {
  try {
    return typeof window === undefined
      ? true
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    log.debug('Error in prefersDark', e);
  }
  return true;
}

export async function updatePageTheme(theme: BundledTheme) {
  const themeInfo = bundledThemesInfo.find((t) => t.id === theme);
  log.debug('Updating theme:', themeInfo);
  document.body.classList[themeInfo?.type === 'light' ? 'remove' : 'add']('dark');

  const channels = bundledColors[theme];

  document.body.style.setProperty('--fg', channels.fg);
  document.body.style.setProperty('--bg', channels.bg);
  document.body.style.setProperty('--btn-fg', channels.btnFg);
  document.body.style.setProperty('--btn-bg', channels.btnBg);
}
