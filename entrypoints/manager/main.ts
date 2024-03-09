import './styles.css';
import { enableSplitPanelInteractivity } from '@/components/snippet-manager/split-pane';
import { appendControls } from '@/components/quick-options/quick-options';
import { initSnippetList } from '@/components/snippet-manager/snippet-list';
import { initDialogs } from '../../components/snippet-manager/dialogs';
import { options } from '@/utils/preferences/storage';
import { updateEditorTheme } from '@/components/snippet-manager/snippet-editor';

const optionsEl = document.querySelector<HTMLDivElement>('#options');

appendControls(optionsEl, ['theme']);
initSnippetList();
enableSplitPanelInteractivity();
initDialogs();

options.theme.watch((theme) => {
  updateEditorTheme(theme);
});
