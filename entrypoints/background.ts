import { openExtensionDatabase } from '@/utils/db';
import { backgroundMessenger } from '@/utils/messenger/background';
import { capitalize } from '@/utils/misc';
import { createSemaphore } from '@/utils/semaphore';
import {
  Snippet,
  SnippetContext,
  groupSnippetsByContext,
  registerSnippetsRepo,
} from '@/utils/snippets/repo';
import type { SetRequired } from 'type-fest';
import { registerUpdateContextMenuRepo } from '@/utils/context-menus/repo';
import { options } from '@/utils/preferences/storage';
import { defaultSnippets } from '@/utils/snippets/default-snippets';

export default defineBackground(() => {
  const INSERT_SNIPPET_ID = 'insert-snippet';
  type SnippetCreateArgs = [
    SetRequired<Partial<Parameters<typeof browser.contextMenus.create>[0]>, 'id'>,
    Snippet | string | number
  ];

  let contextMenuListenerAdded = false;
  let contextMenuItemMap: Record<string, Snippet | string | number> = {};
  let parentMenuCreated = false;
  let currentTab: number | undefined = undefined;
  const tabContexts: Record<number, SnippetContext | null> = {};
  const semaphore = createSemaphore();
  log.debug('Background script init');

  const idb = openExtensionDatabase();
  const snippetsRepo = registerSnippetsRepo(idb);
  registerUpdateContextMenuRepo(createContextMenus);

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
    if (!details.previousVersion && (await snippetsRepo.count()) === 0) {
      await snippetsRepo.import(defaultSnippets);
    }

    await createContextMenus();
  });

  browser.tabs.onActivated.addListener(async (info) => {
    currentTab = info.tabId;
    await createContextMenus();
  });

  options.keybindings.watch(async (preset) => {
    log.debug('keybindings changed', preset);
    if (!preset) return;

    if (!(await options.platform.getValue())) {
      await options.platform.setValue((await browser.runtime.getPlatformInfo()).os);
    }

    // backgroundMessenger.sendMessage('enableKeybinds', {
    //   preset,
    //   platform: await options.platform.getValue(),
    // });
  });

  // HMR will also trigger this
  if (process.env.NODE_ENV === 'development') createContextMenus();

  async function createContextMenus() {
    // Queue multiple calls to this function
    await semaphore.acquire();

    // async function getAllRelevantSnippets() {
    //   const snippets = await snippetsRepo.getAll();
    //   if ((await options.useFavourites.getValue()) === false) return snippets;
    //   return snippets.filter((snippet) => snippet.favourite);
    // }

    try {
      const useFavourites = await options.useFavourites.getValue();
      const [all] = await Promise.all([
        // await getAllRelevantSnippets(),
        (
          await snippetsRepo.getAll()
        ).filter((snippet) => (useFavourites ? snippet.favourite : true)),
        await browser.contextMenus.removeAll(),
      ]);
      contextMenuItemMap = {};
      parentMenuCreated = false;

      const groupedSnippets = groupSnippetsByContext(all);
      const currentContext = currentTab ? tabContexts[currentTab] : null;
      const currentContextGroups = groupedSnippets.find(
        (group) => group.context === currentContext
      );
      const contextualGroups = currentContext ? [currentContextGroups] : groupedSnippets;

      const subMenuItems: SnippetCreateArgs[] = [];

      for (const group of contextualGroups) {
        if (!group || !group.snippets) return;
        const { context, snippets } = group;

        if (!parentMenuCreated) {
          browser.contextMenus.create(
            {
              id: INSERT_SNIPPET_ID,
              title: 'Insert Snippet',
              contexts: ['editable'],
            },
            () => {
              browser.runtime.lastError &&
                log.debug('Error creating context menu', browser.runtime.lastError);
            }
          );
          parentMenuCreated = true;
        }

        if (subMenuItems.length > 0)
          subMenuItems.push([{ id: context, type: 'separator' }, context]);

        subMenuItems.push([
          { id: `${context}-header`, title: capitalize(context), enabled: false },
          `${context}-header`,
        ]);

        for (const snippet of snippets ?? []) {
          subMenuItems.push([{ id: snippet.id, title: snippet.name }, snippet]);
        }
      }

      await Promise.all(subMenuItems.map((args) => createMenuItem(...args)));

      if (!contextMenuListenerAdded) {
        browser.contextMenus.onClicked.addListener((info, tab) => {
          log.debug('contextMenus.onClicked', contextMenuItemMap, tab?.id);
          // message to content script to execute paste
          if (tab && info.parentMenuItemId === INSERT_SNIPPET_ID) {
            const snippet = contextMenuItemMap[info.menuItemId];
            if (typeof snippet !== 'object') return;

            // handle paste/insert snippet
            if (!snippet) {
              log.warn('Matching snippet was not found', info.menuItemId, contextMenuItemMap);
              return;
            }
            log.debug('send insert message', snippet.code, tab.id);
            backgroundMessenger.sendMessage('insert', snippet.code, tab.id);
          }
        });
        contextMenuListenerAdded = true;
      }
    } finally {
      semaphore.release();
    }
  }

  async function createMenuItem(args: SnippetCreateArgs[0], snippet?: SnippetCreateArgs[1]) {
    const entryInMap = contextMenuItemMap[args.id];
    contextMenuItemMap[args.id] = snippet || args.id;

    return new Promise<string>((resolve, reject) => {
      if (entryInMap) resolve(args.id);

      browser.contextMenus.create(
        {
          parentId: INSERT_SNIPPET_ID,
          contexts: ['editable'],
          ...args,
        },
        () => {
          if (browser.runtime.lastError) {
            log.warn('Error creating context menu', browser.runtime.lastError, contextMenuItemMap);
            reject(browser.runtime.lastError);
          } else {
            resolve(args.id);
          }
        }
      );
    });
  }
});
