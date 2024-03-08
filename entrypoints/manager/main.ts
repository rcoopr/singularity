import { enableSplitPaneInteractivity } from '@/components/snippet-manager/snippet-manager';
import './styles.css';
import { appendControls } from '@/components/quick-options/quick-options';

const options = document.querySelector<HTMLDivElement>('#options');
appendControls(options, ['theme']);
enableSplitPaneInteractivity(
  document.querySelector<HTMLDivElement>('#snippet-manager > .split-panel-container')
);

// (async () => {
//   const snippetsRepo = getSnippetsRepo();
//   const all = await snippetsRepo.getAll();

//   const compositionSnippets = all.filter((s) => s.contexts.includes('composition'));
//   const globalSnippets = all.filter((s) => s.contexts.includes('global'));
//   const folders = [
//     { name: 'Composition', snippets: compositionSnippets },
//     { name: 'Global', snippets: globalSnippets },
//   ];

//   document.querySelector<HTMLDivElement>('#snippet-manager')!.appendChild(createBook().book);
//   renderSidebar(folders, folders[0].snippets[0]);
//   renderSnippet(folders[0].snippets[0]);
// })();
