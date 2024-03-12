import './styles.css';
import { enableSplitPanelInteractivity } from '@/components/snippet-manager/split-pane';
import { appendControls } from '@/components/quick-options/quick-options';
import { initSnippetList } from '@/components/snippet-manager/snippet-list';
import { initDialogs } from '../../components/snippet-manager/dialogs';
import { options } from '@/utils/preferences/storage';
import { updateEditorTheme } from '@/components/snippet-manager/snippet-editor';
import { initialUpdatePageTheme } from '@/utils/misc';

(async () => {
  initialUpdatePageTheme(await options.theme.getValue());
})();

const optionsEl = document.querySelector<HTMLDivElement>('#options');

appendControls(optionsEl, ['theme']);
initSnippetList();
enableSplitPanelInteractivity();
initDialogs();

options.theme.watch((theme) => {
  updateEditorTheme(theme);
  // Opting to move this to where the snippet is rendered to try to sync changes
  // updatePageTheme(theme);
});

function setupImportExportButtons() {
  const importButton = document.querySelector<HTMLButtonElement>('#import-button');
  const exportButton = document.querySelector<HTMLButtonElement>('#export-button');

  if (importButton) {
    importButton?.addEventListener('click', () => {
      const confirmState = importButton.dataset.confirm;
      if (confirmState === 'true') {
        importButton.removeAttribute('data-confirm');
        importButton.textContent = 'Click again to confirm';
        return;
      } else {
        importButton.dataset.confirm = 'true';
        importButton.textContent = 'Confirm';
      }
    });
  }
}
