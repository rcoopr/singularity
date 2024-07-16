import { bundledColors } from '@/utils/shiki/bundled-colors';
import { bundledThemesInfo, BundledTheme } from 'shiki';

export function prefersDark() {
  return true;
}
// export function prefersDark() {
//   try {
//     if (typeof window == undefined) {
//       return true;
//     }

//     return typeof window === undefined
//       ? true
//       : window.matchMedia('(prefers-color-scheme: dark)').matches;
//   } catch (e) {
//     log.debug('Error in prefersDark', e);
//   }
//   return true;
// }

let lastTheme: string | undefined = undefined;
export async function updatePageTheme(theme: BundledTheme) {
  if (theme === lastTheme) return;
  lastTheme = theme;

  const themeInfo = bundledThemesInfo.find((t) => t.id === theme);
  log.debug('Updating theme:', themeInfo);
  document.body.classList[themeInfo?.type === 'light' ? 'remove' : 'add']('dark');

  // createThemeOptionGroups filters themes by keys of bundledColors
  const channels = bundledColors[theme as keyof typeof bundledColors];

  document.body.style.setProperty('--fg', channels.fg);
  document.body.style.setProperty('--bg', channels.bg);
  document.body.style.setProperty('--btn-fg', channels.btnFg);
  document.body.style.setProperty('--btn-bg', channels.btnBg);
}
