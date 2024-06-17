import { init } from '@/components/combobox/combobox';
import { appendQuickActions } from '@/components/quick-actions/quick-actions';
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

const managerLinkButton = document.querySelector<HTMLButtonElement>('#manager-link');
if (managerLinkButton) {
  managerLinkButton.addEventListener('click', () => {
    browser.tabs.create({
      url: browser.runtime.getURL('/manager.html'),
    });
  });
}

const quickActionsSection = document.querySelector<HTMLElement>('#quick-actions');
if (quickActionsSection) {
  appendQuickActions(quickActionsSection);
}

init(document.querySelector('.custom-combobox'));
