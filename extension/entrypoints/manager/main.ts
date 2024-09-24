import { enableSplitPanelInteractivity } from '@/components/snippet-manager/split-pane';
import { appendControls } from '@/components/quick-options/quick-options';
import { initSnippetList } from '@/components/snippet-manager/snippet-list';
import { initDialogs } from '../../components/snippet-manager/dialogs';
import { options } from '@/utils/preferences/storage';
import { updateEditorTheme } from '@/components/snippet-manager/snippet-editor';
import { updatePageTheme } from '@/utils/preferences/color-scheme';

(async () => {
  updatePageTheme(await options.theme.getValue());
})();

const optionsEl = document.querySelector<HTMLDivElement>('#options');

appendControls(optionsEl, ['theme', 'useFavourites', 'keybindings']);
initSnippetList();
enableSplitPanelInteractivity();
initDialogs();

options.theme.watch((theme) => {
  updateEditorTheme(theme);
  // Opting to move this to where the snippet is rendered to try to sync changes
  // updatePageTheme(theme);
});
