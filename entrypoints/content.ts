import { backgroundMessenger } from '@/utils/messenger/background';
import { websiteMessenger } from '@/utils/messenger/website';
import { config, options } from '@/utils/preferences/storage';
import { injectScript } from '../utils/inject-script';

let isInjected = false;

export default defineContentScript({
  matches: ['*://app.singular.live/compositions/*', '*://www.google.com/*'],
  main() {
    log.debug('Content script init');

    injectScript('/injected.js', () => {
      isInjected = true;
      syncKeybindsOption();
    });

    // Relay messages from Injected -> Content Script
    websiteMessenger.onMessage('context', (message) => {
      if (!browser.runtime.id) return;
      backgroundMessenger.sendMessage('context', message.data);
    });

    websiteMessenger.onMessage('cursorPosition', (message) => {
      if (!browser.runtime.id) return;
      backgroundMessenger.sendMessage('cursorPosition', message.data);
    });

    // Relay messages from Background -> Content Script
    backgroundMessenger.onMessage('insert', (message) => {
      if (!isInjected || !browser.runtime.id) return;
      websiteMessenger.sendMessage('insert', message.data);
    });

    options.keybindings.watch(() => syncKeybindsOption());
    config.platform.watch(() => syncKeybindsOption());
  },
});

async function syncKeybindsOption() {
  if (!browser.runtime.id) return;

  const preset = await options.keybindings.getValue();
  if (!preset) return; // TODO: disable keybinds

  const platform = await config.platform.getValue();
  websiteMessenger.sendMessage('enableKeybinds', {
    preset,
    platform,
  });
}
