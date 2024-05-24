import { AceSelectionEventHandler } from '@/types/ace';
import { enableKeybinds } from '@/utils/keybindings/keybindings';
import { CursorPosition } from '@/types/cursor';
import { SnippetContext } from '@/utils/snippets/repo';
import { onMessage, sendMessage, setNamespace } from 'webext-bridge/window';

export default defineUnlistedScript(() => {
  log.debug('Injected script init');
  setNamespace('com.rcoopr.singularity');

  if (window.ace) {
    initContextTracking();
    initCursorTracking();
  }

  onMessage('insert', (message) => {
    log.debug('insert (injected <- content)', message);
    if (window.ace) {
      insertIntoAceEditor(message.data);
    } else {
      insertIntoActiveElement(message.data.code);
    }
  });

  onMessage('enableKeybinds', async (message) => {
    log.debug('enableKeybinds (injected <- content)', message);
    const editor = await getEditor();
    if (!editor) {
      log.warn('No editor found to enable keybinds');
      return;
    }
    enableKeybinds(editor, message.data.preset, message.data.platform);
  });
});

const tabNameContextMap = {
  'Global Script': 'global',
  'Overlay Script': 'overlay',
} as const;

let editor: AceAjax.Editor | undefined = undefined;
async function getEditor() {
  if (editor) return editor;
  const el = await waitForEl<HTMLElement>('#jsonEditor-script');
  if (el) {
    editor = window.ace.edit(el);
  }
  return editor;
}

async function initCursorTracking() {
  const editor = await getEditor();
  if (!editor) return;

  const cursorChangeHandler: AceSelectionEventHandler<'changeCursor'> = (_event, details) => {
    log.debug('Cursor position:', details.lead.row, details.lead.column);
    sendMessage(
      'cursorPosition',
      {
        anchor: {
          row: details.anchor.row,
          column: details.anchor.column,
        },
        lead: {
          row: details.lead.row,
          column: details.lead.column,
        },
      },
      'background'
    ).catch((e) => log.warn(e));
  };

  editor.session.selection.on('changeCursor', cursorChangeHandler);
}

async function initContextTracking() {
  const activeTab = await waitForEl('.code-editor-tab.active');

  sendMessage('context', getContextFromTabName(activeTab?.textContent), 'background').catch((e) =>
    log.warn(e)
  );

  const tabs = await waitForEl('.code-editor-tabs');
  if (tabs && tabs.parentElement) {
    const tabObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'childList' &&
          mutation.addedNodes.length &&
          mutation.target instanceof HTMLElement
        ) {
          const activeTab = mutation.target.querySelector('.code-editor-tab.active');
          log.debug('Active tab:', activeTab?.textContent);
          sendMessage('context', getContextFromTabName(activeTab?.textContent), 'background').catch(
            (e) => log.warn(e)
          );
        }
      }
    });

    tabObserver.observe(tabs.parentElement, {
      childList: true,
    });
  }
}

function waitForEl<T extends Element>(selector: string): Promise<T | null | undefined> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector) as T | null);
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement && node.querySelector(selector)) {
            observer.disconnect();
            resolve(document.querySelector(selector) as T | null);
          }
        }
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function insertIntoAceEditor({ code, position }: { code: string; position?: CursorPosition }) {
  try {
    const editor = window.ace.edit('jsonEditor-script');

    if (position) {
      const range = {
        start: position.anchor,
        end: position.lead,
      };
      editor.session.selection.setSelectionRange(range);
    }

    // @ts-expect-error bad typings, missing method
    editor.insertSnippet(code);
  } catch (e) {
    log.warn('Error inserting snippet into Ace editor\n', e);
  }
}

function insertIntoActiveElement(text: string) {
  const activeElement = document.activeElement;
  if (!activeElement) {
    log.warn('No active element found');
    return;
  }

  if (
    !(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)
  ) {
    log.warn('Active element is not an input or textarea');
    return;
  }

  activeElement.value += text;
  return;
}

function getContextFromTabName(tabName: string | null | undefined): SnippetContext | null {
  if (!tabName) return null;
  return tabName in tabNameContextMap
    ? tabNameContextMap[tabName as keyof typeof tabNameContextMap]
    : 'composition';
}
