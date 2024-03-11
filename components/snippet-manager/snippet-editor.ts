import { Snippet } from '@/utils/snippets/repo';
import { dateFormat, html, writeToClipboard } from '@/utils/misc';
import { BundledTheme, codeToHtml } from 'shiki';
import { options } from '@/utils/preferences/storage';
import { updatePageTheme, langAbbreviations } from '@/utils/misc';

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
    root.innerHTML = html`<p class="snippet-editor-empty">No snippet selected</p>`;
    updatePageTheme(theme);
    return;
  }

  const existingSnippet = root.querySelector<HTMLDivElement>('#snippet');
  let snippetPreview = existingSnippet;

  if (!snippetPreview) {
    snippetPreview = document.createElement('div');
    snippetPreview.id = 'snippet';
    snippetPreview.classList.add('h-full', 'animate-in', 'fade-in', 'relative', 'group');
  }

  const codeHtml = await codeToHtml(selectedSnippet.code, {
    lang: selectedSnippet.lang || 'javascript',
    theme,
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

  appendMetadata(snippetPreview, selectedSnippet);
  if (!existingSnippet) root.appendChild(snippetPreview);
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
  if (color) metadata.style.color = color;
  if (backgroundColor) metadata.style.backgroundColor = backgroundColor;

  if (snippet.updatedAt) {
    metadata.innerHTML += html`<span class="snippet-date"
      >Updated:<wbr /> ${dateFormat.format(snippet.updatedAt)}</span
    >`;
  }

  metadata.innerHTML += html`
    <span class="snippet-date">Created:<wbr /> ${dateFormat.format(snippet.createdAt)}</span>
  `;

  const langIndicator = document.createElement('div');
  langIndicator.classList.add(
    'absolute',
    'm-3',
    'bottom-full',
    'right-0',
    'text-sm',
    'font-bold',
    'not-italic',
    'text-gray-400',
    'opacity-50'
  );
  langIndicator.textContent = langAbbreviations[snippet.lang || 'javascript'];
  metadata.appendChild(langIndicator);

  root.appendChild(metadata);
}
