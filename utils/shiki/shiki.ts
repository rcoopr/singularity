import { bundledThemes } from 'shiki';
import { getHighlighterCore, HighlighterCore } from 'shiki/core';
import getWasm from 'shiki/wasm';
import { options } from '@/utils/preferences/storage';

let highlighter: HighlighterCore | undefined = undefined;

export async function getHighlighter() {
  if (!highlighter) {
    highlighter = await getHighlighterCore({
      loadWasm: getWasm,
      langs: [
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/html.mjs'),
      ],
    });
  }

  return highlighter;
}

export async function loadSelectedTheme() {
  const theme = (await options.theme.getValue()) || 'rose-pine';
  const highlighter = await getHighlighter();
  const loadedThemes = highlighter.getLoadedThemes();
  if (loadedThemes.includes(theme)) return;

  await highlighter.loadTheme(bundledThemes[theme]);
}
