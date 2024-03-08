import { appendControls } from '@/components/quick-options/quick-options';

const options = document.querySelector<HTMLDivElement>('#quick-options');
if (options) {
  appendControls(options);
}

// const managerLinkEl = document.querySelector<HTMLButtonElement>('#manager-link');
// if (managerLinkEl) {
//   managerLinkEl.addEventListener('click', () => {
//     browser.tabs.create({
//       url: browser.runtime.getURL('/manager.html'),
//     });
//   });
// }
