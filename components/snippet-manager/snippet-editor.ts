import { Snippet } from '@/utils/snippets/repo';
import { html, writeToClipboard } from '@/utils/misc';
import { BundledTheme, codeToHtml } from 'shiki';
import { options } from '@/utils/preferences/storage';

export function renderSnippetEditor(snippet: Snippet | undefined) {
  const root = document.querySelector<HTMLDivElement>('#snippet-editor');

  // render current snippet names in folders + set up listeners to keep it updated
  renderSnippetCode(root, snippet);
  updateHeader(snippet);
}

function updateHeader(snippet: Snippet | undefined) {
  const description = document.querySelector('#snippet-description');
  if (!description) return;

  description.innerHTML =
    snippet?.name || html`<span class="text-zinc-400 italic">No description</span>`;
}

let storedSnippet: Snippet | undefined;
async function renderSnippetCode(
  root: HTMLElement | null,
  selectedSnippet: Snippet | undefined,
  theme?: BundledTheme
) {
  storedSnippet = selectedSnippet;
  if (!root) {
    log.warn('No root element found for snippet editor');
    return;
  }

  if (!selectedSnippet) {
    root.innerHTML = html`<p class="snippet-editor-empty">No snippet selected</p>`;
    return;
  }

  const existingSnippet = root.querySelector('#snippet');
  let snippetPreview = existingSnippet;

  if (!snippetPreview) {
    snippetPreview = document.createElement('div');
    snippetPreview.id = 'snippet';
    snippetPreview.classList.add('h-full', 'animate-in', 'fade-in', 'relative', 'group');
  }

  const codeHtml = await codeToHtml(selectedSnippet.code, {
    lang: selectedSnippet.lang || 'javascript',
    theme: theme || (await options.theme.getValue()),
  });

  snippetPreview.innerHTML = codeHtml;

  const copyButton = document.createElement('button');
  copyButton.classList.add('copy', 'opacity-0', 'group-hover:opacity-100');
  copyButton.addEventListener('click', async () => {
    await writeToClipboard(selectedSnippet.code);
    copyButton.classList.add('copied');
    window.setTimeout(() => copyButton.classList.remove('copied'), 3000);
  });
  snippetPreview.prepend(copyButton);

  if (!existingSnippet) root.appendChild(snippetPreview);
}

export function updateEditorTheme(theme: BundledTheme) {
  renderSnippetCode(document.querySelector('#snippet-editor'), storedSnippet, theme);
}
