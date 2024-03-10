import { openExtensionDatabase } from '@/utils/db';
import { backgroundMessenger } from '@/utils/messenger/background';
import { capitalize } from '@/utils/misc';
import { defaultSnippets } from '@/utils/snippets/default-snippets';
import {
  Snippet,
  SnippetContext,
  groupSnippetsByContext,
  registerSnippetsRepo,
  snippetContexts,
} from '@/utils/snippets/repo';

export default defineBackground(() => {
  log.debug('Background script init');

  let currentTab: number | undefined = undefined;
  const tabContexts: Record<number, SnippetContext | null> = {};

  const idb = openExtensionDatabase();
  const snippetsRepo = registerSnippetsRepo(idb);

  backgroundMessenger.onMessage('snippetAdded', async () => {
    await createContextMenus();
  });

  backgroundMessenger.onMessage('snippetUpdated', async () => {
    await createContextMenus();
  });

  backgroundMessenger.onMessage('snippetDeleted', async () => {
    await createContextMenus();
  });

  backgroundMessenger.onMessage('context', async (message) => {
    currentTab = currentTab || (await browser.tabs.query({ active: true }))?.[0]?.id;
    if (currentTab) tabContexts[currentTab] = message.data;
    createContextMenus();
  });

  backgroundMessenger.onMessage('cursorPosition', async (message) => {
    // store for later use in popup quick-actions
  });

  // TODO: replace with prompt in sidebar if empty. Good for dev though
  browser.runtime.onInstalled.addListener(async (details) => {
    if (!details.previousVersion) {
      for (const snippet of defaultSnippets) {
        snippetsRepo.create(snippet);
      }
    }
  });

  createContextMenus({ addEventListener: true });

  browser.tabs.onActivated.addListener((info) => {
    currentTab = info.tabId;
    createContextMenus();
  });

  async function createContextMenus(opts?: { addEventListener?: boolean }) {
    const [all, _] = await Promise.all([
      await snippetsRepo.getAll(),
      await browser.contextMenus.removeAll(),
    ]);

    const groupedSnippets = groupSnippetsByContext(all);
    const contextMenuSnippetMap: Record<string, Snippet> = {};
    const currentContext = currentTab ? tabContexts[currentTab] : null;
    const contexts = currentContext ? [currentContext] : snippetContexts;

    let parentId: string | number | undefined = undefined;
    groupedSnippets.forEach(({ context, snippets }, i) => {
      if (!snippets) return;
      if (!parentId) {
        parentId = browser.contextMenus.create({
          id: 'insert-snippet',
          title: 'Insert Snippet',
          contexts: ['editable'],
        });
      }

      if (i > 0) {
        browser.contextMenus.create({
          type: 'separator',
          parentId,
          id: context,
          contexts: ['editable'],
        });
      }
      browser.contextMenus.create({
        enabled: false,
        parentId,
        id: `${context}-header`,
        title: capitalize(context),
        contexts: ['editable'],
      });

      if (snippets) {
        for (const snippet of snippets) {
          const menuItemId = browser.contextMenus.create({
            parentId,
            id: snippet.id,
            title: snippet.name,
            contexts: ['editable'],
          });
          contextMenuSnippetMap[menuItemId] = snippet;
        }
      }
    });

    if (Object.keys(contextMenuSnippetMap).length === 0) {
      browser.contextMenus.create({
        id: 'no-snippets',
        title: 'No snippets available',
        enabled: false,
        contexts: ['editable'],
      });
    }

    if (opts?.addEventListener) {
      browser.contextMenus.onClicked.addListener((info, tab) => {
        // message to content script to execute paste
        if (tab && info.parentMenuItemId === parentId) {
          // handle paste/insert snippet
          const snippet = contextMenuSnippetMap[info.menuItemId];
          if (!snippet) {
            log.warn('Matching snippet was not found', info.menuItemId, contextMenuSnippetMap);
            return;
          }
          log.debug('send insert message', snippet.code, tab.id);
          backgroundMessenger.sendMessage('insert', snippet.code, tab.id);
        }
      });
    }
  }
});
