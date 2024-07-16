import { options } from '@/utils/preferences/storage';
import {
  getSnippetsRepo,
  groupSnippetsByContext,
  registerSnippetsRepo,
} from '@/utils/snippets/repo';
import { transpile } from 'typescript';
import { sendMessage } from 'webext-bridge/popup';

export async function appendQuickActions(el: HTMLElement) {
  const useFavourites = await options.useFavourites.getValue();
  if (!useFavourites) {
    return;
  }

  const currentTab = (await browser.tabs.query({ active: true, lastFocusedWindow: true }))?.[0]?.id;
  if (!currentTab) {
    return;
  }

  const snippetsRepo = getSnippetsRepo();

  try {
    const nonFavouriteSnippets = (await snippetsRepo.getAll()).filter(
      (snippet) => !snippet.favourite
    );
    const groupedSnippets = groupSnippetsByContext(nonFavouriteSnippets);

    for (const { context, snippets } of groupedSnippets) {
      const contextDiv = document.createElement('div');
      contextDiv.classList.add('quick-action-context');
      el.appendChild(contextDiv);

      const contextTitle = document.createElement('span');
      contextTitle.classList.add('quick-action-context-title');
      contextTitle.textContent = context;
      contextDiv.appendChild(contextTitle);

      for (const snippet of snippets) {
        const code = snippet.lang === 'typescript' ? transpile(snippet.code).trim() : snippet.code;
        const button = document.createElement('button');
        button.classList.add('quick-action');
        button.textContent = snippet.name;
        button.addEventListener('click', () => {
          sendMessage('insert', { code }, `window@${currentTab}`).catch(noop);
        });
        contextDiv.appendChild(button);
      }
    }
  } catch (e) {}
}
