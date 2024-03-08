import { backgroundMessenger } from '@/utils/messenger/background';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(() => {
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
