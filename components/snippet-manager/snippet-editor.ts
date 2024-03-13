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
    snippet?.name || html`<span class="text-zinc-400 italic">No description</span>`;
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
    snippetPreview.className = 'h-full animate-in fade-in duration-500 relative group';
  }

  await loadSelectedTheme();
  const codeHtml = (await getHighlighter()).codeToHtml(selectedSnippet.code, {
    lang: selectedSnippet.lang || 'javascript',
    theme,
  });

  snippetPreview.innerHTML = codeHtml;

  const copyButton = document.createElement('button');
  copyButton.classList.add('copy', 'opacity-0', 'group-hover:opacity-100');
  copyButton.addEventListener('click', async () => {
    let code = selectedSnippet.code;
    if (selectedSnippet.lang === 'typescript') {
      code = transpile(code);
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
  const pre = root.querySelector('pre');
  const color = pre?.style.color;
  const backgroundColor = pre?.style.backgroundColor;

  const metadata = document.createElement('div');
  metadata.classList.add('metadata');

  if (snippet.updatedAt) {
    metadata.innerHTML += html`<span class="snippet-date"
      >Updated:<wbr /> ${dateTimeFormat.format(snippet.updatedAt)}</span
    >`;
  }

  metadata.innerHTML += html`
    <span class="snippet-date">Created:<wbr /> ${dateTimeFormat.format(snippet.createdAt)}</span>
  `;

  const langIndicator = document.createElement('div');
  langIndicator.className =
    'absolute m-3 bottom-full right-0 text-sm font-bold not-italic text-zinc-900 dark:text-zinc-100 opacity-40';
  langIndicator.textContent = langAbbreviations[snippet.lang];

  if (color) {
    metadata.style.color = color;
    langIndicator.style.color = color;
  }
  if (backgroundColor) {
    // metadata.style.backgroundColor = backgroundColor;
    // document.body.style.backgroundColor = backgroundColor;
  }

  metadata.appendChild(langIndicator);
  root.appendChild(metadata);
}
