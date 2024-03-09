import { Snippet } from '@/utils/snippets/repo';

export function renderSnippetEditor(root: HTMLElement | null, snippet?: Snippet) {
  if (!root) {
    log.warn('No root element found for snippet editor');
    return;
  }

  // render current snippet names in folders + set up listeners to keep it updated
}
