import { backgroundMessenger } from '@/utils/messenger/background';
import { WebsiteMessengerProtocol, websiteMessenger } from '@/utils/messenger/website';
import { options } from '@/utils/preferences/storage';
import { PublicPath } from 'wxt/browser';

let isInjected = false;

export default defineContentScript({
  matches: ['*://*.google.com/*', '*://app.singular.live/*'],
  main() {
    log.debug('Content script init');
    injectScript('/injected.js', () => {
      isInjected = true;
      enableKeybinds();
    });

    // Injected -> Content Script
    websiteMessenger.onMessage('context', (message) => {
      backgroundMessenger.sendMessage('context', message.data);
    });

    websiteMessenger.onMessage('cursorPosition', (message) => {
      backgroundMessenger.sendMessage('cursorPosition', message.data);
    });

    // Background -> Content Script
    backgroundMessenger.onMessage('insert', (message) => {
      log.debug('insert (background -> content -> injected)', message);
      if (isInjected) websiteMessenger.sendMessage('insert', message.data);
    });

    // backgroundMessenger.onMessage('enableKeybinds', (message) => {
    //   log.debug('enableKeybinds (background -> content -> injected)', message);
    //   if (isInjected) websiteMessenger.sendMessage('enableKeybinds', message.data);
    // });

    options.keybindings.watch(() => enableKeybinds());
    options.platform.watch(() => enableKeybinds());
  },
});

function injectScript(path: PublicPath, onLoad?: () => void) {
  const scriptElement = document.createElement('script');
  scriptElement.src = browser.runtime.getURL(path);
  scriptElement.onload = () => {
    if (onLoad) onLoad();
    scriptElement.remove();
  };
  (document.head || document.documentElement).appendChild(scriptElement);
}

async function enableKeybinds() {
  const platform = await options.platform.getValue();
  const preset = await options.keybindings.getValue();

  if (preset) {
    websiteMessenger.sendMessage('enableKeybinds', {
      preset,
      platform,
    });
  }
}
