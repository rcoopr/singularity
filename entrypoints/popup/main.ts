import { appendControls } from '@/components/quick-options/quick-options';
import { options } from '@/utils/preferences/storage';
import { updatePageTheme } from '@/utils/misc';

(async () => {
  updatePageTheme(await options.theme.getValue());
})();

options.theme.watch((theme) => {
  updatePageTheme(theme);
});

const optionsEl = document.querySelector<HTMLDivElement>('#quick-options');
if (optionsEl) appendControls(optionsEl);

const managerLinkEl = document.querySelector<HTMLButtonElement>('#manager-link');
if (managerLinkEl) {
  managerLinkEl.addEventListener('click', () => {
    browser.tabs.create({
      url: browser.runtime.getURL('/manager.html'),
    });
  });
}
