import { init } from '@/components/combobox/combobox';
import { updatePageTheme } from '@/utils/preferences/color-scheme';
import { options } from '@/utils/preferences/storage';

(async () => {
  updatePageTheme(await options.theme.getValue());
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

init(document.querySelector('.custom-combobox'));
