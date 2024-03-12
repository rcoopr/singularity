import { options } from '@/utils/preferences/storage';
import { initialUpdatePageTheme } from '@/utils/misc';

(async () => {
  initialUpdatePageTheme(await options.theme.getValue());
})();

options.theme.watch((theme) => {
  updatePageTheme(theme);
});

// const optionsEl = document.querySelector<HTMLDivElement>('#quick-options');
// if (optionsEl) appendControls(optionsEl);

const managerLinkEl = document.querySelector<HTMLButtonElement>('#manager-link');
if (managerLinkEl) {
  managerLinkEl.addEventListener('click', () => {
    browser.tabs.create({
      url: browser.runtime.getURL('/manager.html'),
    });
  });
}
