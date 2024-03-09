import { openExtensionDatabase } from '@/utils/db';
import { backgroundMessenger } from '@/utils/messenger/background';
import { defaultSnippets } from '@/utils/snippets/default-snippets';
import { registerSnippetsRepo } from '@/utils/snippets/repo';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(async (details) => {
    const idb = openExtensionDatabase();
    const snippetsRepo = registerSnippetsRepo(idb);

    if (!details.previousVersion) {
      for (const snippet of defaultSnippets) {
        snippetsRepo.create(snippet);
      }
    }

    const id = browser.contextMenus.create({
      id: 'test',
      title: 'Paste clipboard',
      contexts: ['editable'],
    });

    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (tab && info.menuItemId === id) {
        console.log('insert (background -> content)');
        backgroundMessenger.sendMessage('insert', 'test data', tab.id);
      }
    });
  });
});
