import { openExtensionDatabase } from '@/utils/db';
import { backgroundMessenger } from '@/utils/messenger/background';
import { capitalize } from '@/utils/misc';
import { defaultSnippets } from '@/utils/snippets/default-snippets';
import {
  Snippet,
  SnippetContext,
  groupSnippetsByContext,
  registerSnippetsRepo,
} from '@/utils/snippets/repo';

export default defineBackground(() => {
  let contextMenuListenerAdded = false;
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
    log.debug('Context:', message.data, currentTab);
    await createContextMenus();
  });

  backgroundMessenger.onMessage('cursorPosition', async (message) => {
    // store for later use in popup quick-actions
  });

  // TODO: replace with prompt in sidebar if empty. Good for dev though
  browser.runtime.onInstalled.addListener(async (details) => {
    if (!details.previousVersion) {
      await Promise.all(defaultSnippets.map((snippet) => snippetsRepo.create(snippet)));
    }

    await createContextMenus();
  });

  createContextMenus();

  browser.tabs.onActivated.addListener(async (info) => {
    currentTab = info.tabId;
    await createContextMenus();
  });

  let contextMenuSnippetMap: Record<string, Snippet> = {};
  let parentId: string | number | undefined = undefined;
  async function createContextMenus() {
    const [all, _] = await Promise.all([
      await snippetsRepo.getAll(),
      await browser.contextMenus.removeAll(),
    ]);

    const groupedSnippets = groupSnippetsByContext(all);
    const currentContext = currentTab ? tabContexts[currentTab] : null;
    const currentContextGroups = groupedSnippets.find((group) => group.context === currentContext);
    const contextualGroups = currentContext ? [currentContextGroups] : groupedSnippets;

    parentId = undefined;
    contextMenuSnippetMap = {};

    contextualGroups.forEach((group, i) => {
      if (!group || !group.snippets) return;
      const { context, snippets } = group;

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

    if (!contextMenuListenerAdded) {
      browser.contextMenus.onClicked.addListener((info, tab) => {
        log.debug('contextMenus.onClicked', info, tab);
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
      contextMenuListenerAdded = true;
    }
  }
});
