import './styles.css';
import { enableSplitPanelInteractivity } from '@/components/snippet-manager/split-pane';
import { appendControls } from '@/components/quick-options/quick-options';
import { initSnippetList } from '@/components/snippet-manager/snippet-list';
import { initDialogs } from '../../components/snippet-manager/dialogs';

const options = document.querySelector<HTMLDivElement>('#options');
export const snippetList = document.querySelector<HTMLDivElement>('#snippet-list');
export const snippetEditor = document.querySelector<HTMLDivElement>('#snippet-editor');
const splitPanel = document.querySelector<HTMLDivElement>(
  '#snippet-manager > .split-panel-container'
);

appendControls(options, ['theme']);
initSnippetList(snippetList);
enableSplitPanelInteractivity(splitPanel);

initDialogs();
