import { backgroundMessenger } from '@/utils/messenger/background';
import { websiteMessenger } from '@/utils/messenger/website';
import { PublicPath } from 'wxt/browser';

export default defineContentScript({
  matches: ['*://*.google.com/*', '*://app.singular.live/*'],
  main() {
    log.debug('Content script init');
    injectScript('/injected.js');

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
      websiteMessenger.sendMessage('insert', message.data);
    });
  },
});

function injectScript(path: PublicPath) {
  const scriptElement = document.createElement('script');
  scriptElement.src = browser.runtime.getURL(path);
  scriptElement.onload = () => scriptElement.remove();
  (document.head || document.documentElement).appendChild(scriptElement);
}
