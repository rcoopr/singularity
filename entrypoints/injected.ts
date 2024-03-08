import { websiteMessenger } from '@/utils/messenger/website';

export default defineUnlistedScript(() => {
  console.log('Hello from injected script!');

  websiteMessenger.onMessage('insert', (message) => {
    console.log('insert (injected <- content)', message);

    insertIntoActiveElement(message.data);
  });
});

function insertIntoActiveElement(text: string) {
  const activeElement = document.activeElement;
  if (!activeElement) {
    console.warn('No active element found');
    return;
  }

  if (
    !(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)
  ) {
    console.warn('Active element is not an input or textarea');
    return;
  }

  activeElement.value += text;
  return;
}
