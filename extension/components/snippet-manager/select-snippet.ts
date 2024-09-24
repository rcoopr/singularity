import { updateDialogs } from '@/components/snippet-manager/dialogs';
import { renderSnippetEditor } from '@/components/snippet-manager/snippet-editor';
import {
  renderSnippetList,
  updateSelectedSnippetItem,
} from '@/components/snippet-manager/snippet-list';
import { Snippet } from '@/utils/snippets/repo';

export function selectSnippet(
  selectedSnippet: Snippet | undefined,
  opts?: {
    renderSnippetList?: boolean;
  }
) {
  if (opts?.renderSnippetList !== false) renderSnippetList(selectedSnippet);
  updateSelectedSnippetItem(selectedSnippet);
  renderSnippetEditor(selectedSnippet);
  updateDialogs(selectedSnippet);
}
