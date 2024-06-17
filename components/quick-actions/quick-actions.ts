import { options } from '@/utils/preferences/storage';
import { groupSnippetsByContext, registerSnippetsRepo } from '@/utils/snippets/repo';
import { sendMessage } from 'webext-bridge/popup';

export async function appendQuickActions(el: HTMLElement) {
  const useFavourites = await options.useFavourites.getValue();
  if (!useFavourites) {
    return;
  }

  const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))?.[0]?.id;
  if (!currentTab) {
    return;
  }

  const idb = openExtensionDatabase();
  const snippetsRepo = registerSnippetsRepo(idb);

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
        const button = document.createElement('button');
        button.classList.add('quick-action');
        button.textContent = snippet.name;
        button.addEventListener('click', () => {
          sendMessage('insert', { code: snippet.code }, `window@${currentTab}`).catch(noop);
        });
        contextDiv.appendChild(button);
      }
    }
  } catch (e) {}
}
