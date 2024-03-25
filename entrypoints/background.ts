import { openExtensionDatabase } from '@/utils/db';
import { backgroundMessenger } from '@/utils/messenger/background';
import { capitalize } from '@/utils/misc';
import { createSemaphore } from '@/utils/semaphore';
import {
  Snippet,
  SnippetInput,
  groupSnippetsByContext,
  registerSnippetsRepo,
} from '@/utils/snippets/repo';
import type { SetRequired } from 'type-fest';
import { registerUpdateContextMenuRepo } from '@/utils/context-menus/repo';
import { config, options } from '@/utils/preferences/storage';

export default defineBackground(() => {
  const INSERT_SNIPPET_ID = 'insert-snippet';
  type SnippetCreateArgs = [
    SetRequired<Partial<Parameters<typeof browser.contextMenus.create>[0]>, 'id'>,
    Snippet | SnippetInput | string | number
  ];

  let contextMenuListenerAdded = false;
  let contextMenuItemMap: Record<string, Snippet | SnippetInput | string | number> = {};
  let parentMenuCreated = false;
  let currentTab: number | undefined = undefined;
  const semaphore = createSemaphore();
  log.debug('Background script init');

  const idb = openExtensionDatabase();
  const snippetsRepo = registerSnippetsRepo(idb);
  registerUpdateContextMenuRepo(createContextMenus);

  backgroundMessenger.onMessage('context', async (message) => {
    if (!browser.runtime.id) return;

    currentTab = currentTab || (await browser.tabs.query({ active: true }))?.[0]?.id;
    if (currentTab) {
      const tabsContext = await config.tabsContext.getValue();
      config.tabsContext.setValue({
        ...tabsContext,
        [currentTab]: message.data,
      });
    }
    log.debug('Context:', message.data, currentTab);
    await createContextMenus();
  });

  backgroundMessenger.onMessage('cursorPosition', async (message) => {
    if (!browser.runtime.id) return;

    currentTab = currentTab || (await browser.tabs.query({ active: true }))?.[0]?.id;
    if (currentTab) {
      const allTabsCursorPositions = await config.tabsCursorPosition.getValue();
      config.tabsCursorPosition.setValue({
        ...allTabsCursorPositions,
        [currentTab]: message.data,
      });
    }
    // store for later use in popup quick-actions
  });

  browser.runtime.onInstalled.addListener(async () => {
    await createContextMenus();
  });

  browser.tabs.onActivated.addListener(async (info) => {
    if (!browser.runtime.id) return;

    currentTab = info.tabId;
    await createContextMenus();
  });

  options.keybindings.watch(async (preset) => {
    if (!browser.runtime.id) return;

    log.debug('keybindings changed', preset);
    if (!preset) return;

    if (!(await config.platform.getValue())) {
      await config.platform.setValue((await browser.runtime.getPlatformInfo()).os);
    }
  });

  // HMR will also trigger this
  if (process.env.NODE_ENV === 'development') createContextMenus();

  async function createContextMenus() {
    // Queue multiple calls to this function
    await semaphore.acquire();

    try {
      const useFavourites = await options.useFavourites.getValue();
      const [all] = await Promise.all([
        (
          await snippetsRepo.getAll()
        ).filter((snippet) => (useFavourites ? snippet.favourite : true)),
        await browser.contextMenus.removeAll(),
      ]);
      contextMenuItemMap = {};
      parentMenuCreated = false;

      const groupedSnippets = groupSnippetsByContext(all);
      const tabsContext = await config.tabsContext.getValue();
      const currentContext = currentTab ? tabsContext[currentTab] : null;
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

        if (group.context === 'global') {
          subMenuItems.push([
            { id: 'meta__global-utils', title: 'All utils' },
            createGlobalBoilerplateWithUtilsSnippet(group.snippets),
          ]);
        }

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
            if (tab.id && browser.runtime.id) {
              backgroundMessenger.sendMessage('insert', { code: snippet.code }, tab.id);
            }
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

// TODO: make this more flexible and expose as options to the user
function createGlobalBoilerplateWithUtilsSnippet(snippets: Snippet[]): SnippetInput {
  const utils = snippets
    .filter((snippet) => snippet.name !== 'Init' && snippet.name !== 'Boilerplate')
    .map((snippet) => snippet.code.split('\n').join('\n\t\t\t'))
    .join('\n\n\t\t\t');

  return {
    code: `(function() {
  return {
    init: function(context) {
      ${utils}
    },
    close: function(comp, context) {}
  };
})();
`,
    context: 'global',
    lang: 'javascript',
    name: 'Boilderplate & all utils',
    desc: 'Global script with all global snippets in one',
  };
}
