import { Snippet } from '@/utils/snippets/repo';
import { dateTimeFormat, html, writeToClipboard } from '@/utils/misc';
import { BundledTheme } from 'shiki';
import { options } from '@/utils/preferences/storage';
import { langAbbreviations } from '@/utils/misc';
import { getHighlighter, loadSelectedTheme } from '@/utils/shiki/shiki';
import { transpile } from '@/utils/sucrase/transpile';
import { updatePageTheme } from '@/utils/preferences/color-scheme';

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
    snippet?.desc || html`<span class="text-zinc-400 italic">No description</span>`;
}

let storedSnippet: Snippet | undefined;
async function renderSnippetCode(
  root: HTMLElement | null,
  selectedSnippet: Snippet | undefined,
  theme?: BundledTheme
) {
  storedSnippet = selectedSnippet;
  theme = theme || (await options.theme.getValue());
  if (!root) {
    log.warn('No root element found for snippet editor');
    return;
  }

  if (!selectedSnippet) {
    log.debug('no selected snippet');
    root.innerHTML = html`<p class="snippet-editor-empty bg-gradient-to-b from-fg/10 text-fg/60">
      No snippet selected
    </p>`;
    updatePageTheme(theme);
    return;
  }

  const existingSnippet = root.querySelector<HTMLDivElement>('#snippet');
  let snippetPreview = existingSnippet;

  if (!snippetPreview) {
    snippetPreview = document.createElement('div');
    snippetPreview.id = 'snippet';
    snippetPreview.className =
      'h-full animate-in fade-in duration-500 relative group flex flex-col';
  }

  await loadSelectedTheme();
  const codeHtml = (await getHighlighter()).codeToHtml(selectedSnippet.code, {
    lang: selectedSnippet.lang || 'javascript',
    theme,
  });

  snippetPreview.innerHTML = codeHtml;

  const copyButton = document.createElement('button');
  copyButton.className = 'copy opacity-0 group-hover:opacity-100';
  copyButton.addEventListener('click', async () => {
    let code = selectedSnippet.code;
    if (selectedSnippet.lang === 'typescript') {
      code = transpile(code).trim();
      copyButton.style.setProperty('--content', '"Transpiled & copied!"');
    } else {
      copyButton.style.setProperty('--content', '"Copied!"');
    }

    await writeToClipboard(code);
    log.debug('Write to clipboard:\n', code);
    copyButton.classList.add('copied');
    window.setTimeout(() => copyButton.classList.remove('copied'), 3000);
  });

  snippetPreview.prepend(copyButton);

  appendMetadata(snippetPreview, selectedSnippet);
  if (!existingSnippet) {
    root.innerHTML = '';
    root.appendChild(snippetPreview);
  }

  updatePageTheme(theme);
}

export async function updateEditorTheme(theme: BundledTheme) {
  await renderSnippetCode(document.querySelector('#snippet-editor'), storedSnippet, theme);
}

function appendMetadata(root: HTMLElement, snippet: Snippet) {
  const metadata = document.createElement('div');
  metadata.className = 'flex flex-wrap justify-end gap-x-4 relative border-t border-fg/20 px-1';

  if (snippet.updatedAt) {
    metadata.innerHTML += html`<span class="snippet-date"
      >Updated:<wbr /> ${dateTimeFormat.format(snippet.updatedAt)}</span
    >`;
  }

  metadata.innerHTML += html`
    <span class="snippet-date text-fg bg-bg"
      >Created:<wbr /> ${dateTimeFormat.format(snippet.createdAt)}</span
    >
  `;

  const langIndicator = document.createElement('div');
  langIndicator.className =
    'absolute bottom-full right-0 mb-4 mr-5 text-sm font-bold not-italic text-fg opacity-40';
  langIndicator.textContent = langAbbreviations[snippet.lang];

  metadata.appendChild(langIndicator);
  root.appendChild(metadata);
}
