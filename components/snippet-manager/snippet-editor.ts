import { Snippet } from '@/utils/snippets/repo';
import { html, writeToClipboard } from '@/utils/misc';
import { BundledTheme, codeToHtml } from 'shiki';
import { options } from '@/utils/preferences/storage';

export function renderSnippetEditor(root: HTMLElement | null, snippet?: Snippet) {
  if (!root) {
    log.warn('No root element found for snippet editor');
    return;
  }

  root.innerHTML = '';

  if (!snippet) {
    root.innerHTML = html`<p
      class="w-full h-full rounded-md bg-gradient-to-b from-zinc-800 grid place-content-center text-base italic text-zinc-400"
    >
      No snippet selected
    </p>`;
    return;
  }

  // render current snippet names in folders + set up listeners to keep it updated
  renderSnippetCode(root, snippet);
}

async function renderSnippetCode(
  root: HTMLElement,
  selectedSnippet: Snippet,
  theme?: BundledTheme
) {
  const existingSnippet = root.querySelector('#snippet');
  let snippet = existingSnippet;
  if (!snippet) {
    snippet = document.createElement('div');
    snippet.id = 'snippet';
    snippet.classList.add('h-full', 'animate-in', 'fade-in', 'relative', 'group');
  }

  const codeHtml = await codeToHtml(selectedSnippet.code, {
    lang: selectedSnippet.lang || 'javascript',
    theme: theme || (await options.theme.getValue()),
  });

  snippet.innerHTML = codeHtml;

  const copyButton = document.createElement('button');
  copyButton.classList.add('copy', 'opacity-0', 'group-hover:opacity-100');
  copyButton.addEventListener('click', async () => {
    await writeToClipboard(selectedSnippet.code);
    copyButton.classList.add('copied');
    window.setTimeout(() => copyButton.classList.remove('copied'), 3000);
  });
  snippet.prepend(copyButton);

  if (!existingSnippet) root.appendChild(snippet);
}
