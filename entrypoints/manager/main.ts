import './styles.css';
import { enableSplitPanelInteractivity } from '@/components/snippet-manager/split-pane';
import { appendControls } from '@/components/quick-options/quick-options';
import { initSnippetList } from '@/components/snippet-manager/snippet-list';
import { initDialogs } from '../../components/snippet-manager/dialogs';

const options = document.querySelector<HTMLDivElement>('#options');

appendControls(options, ['theme']);
initSnippetList();
enableSplitPanelInteractivity();
initDialogs();
