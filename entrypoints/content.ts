import { backgroundMessenger } from '@/utils/messenger/background';
import { websiteMessenger } from '@/utils/messenger/website';
import { PublicPath } from 'wxt/browser';

export default defineContentScript({
  matches: ['*://*.google.com/*'],
  main() {
    console.log('Hello content.');
    injectScript('/injected.js');

    backgroundMessenger.onMessage('insert', (message) => {
      console.log('insert (content <- background)', message);

      console.log('insert (content -> injected)', message);
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
