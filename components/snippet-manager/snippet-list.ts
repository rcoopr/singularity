import { updateDialogs } from '@/components/snippet-manager/dialogs';
import { renderSnippetEditor } from '@/components/snippet-manager/snippet-editor';
import { snippetEditor } from '@/entrypoints/manager/main';
import { Snippet, getSnippetsRepo, groupSnippetsByContext } from '@/utils/snippets/repo';

var isInitialized = false;
export async function initSnippetList(root: HTMLElement | null) {
  if (isInitialized) return;
  isInitialized = true;

  if (!root) {
    log.warn('No root element found for snippet list');
    return;
  }

  const snippetsRepo = getSnippetsRepo();
  const snippets = groupSnippetsByContext(await snippetsRepo.getAll());

  // render current snippet names in folders + set up listeners to keep it updated
  const selectedSnippet = snippets[0]?.snippets[0];
  renderSnippetList(root, snippets);
  updateSelectedSnippetItem(root, selectedSnippet);
  renderSnippetEditor(snippetEditor, selectedSnippet);
  updateDialogs(selectedSnippet);
}

export async function renderSnippetList(
  root: HTMLElement | null,
  folders: ReturnType<typeof groupSnippetsByContext>,
  selectedSnippet?: Snippet
) {
  if (!root) {
    log.warn('No root element found for snippet list');
    return;
  }

  root.innerHTML = '';

  for (const folder of folders) {
    const folderContainer = document.createElement('div');
    folderContainer.classList.add('folder', 'open');

    const folderHeader = document.createElement('div');
    folderHeader.classList.add('folder-header');
    folderHeader.textContent = folder.context;
    folderHeader.addEventListener('click', () => folderContainer.classList.toggle('open'));
    folderContainer.appendChild(folderHeader);

    const folderItemsContainer = document.createElement('div');
    const folderItems = document.createElement('ul');
    folderItemsContainer.classList.add('folder-items-container');
    folderItems.classList.add('folder-items');
    folderItemsContainer.appendChild(folderItems);

    // Create a list item for each snippet in the folder
    for (const snippet of folder.snippets) {
      const snippetItem = document.createElement('li');
      const snippetItemButton = document.createElement('button');
      snippetItem.dataset.id = snippet.id;
      snippetItemButton.classList.add('folder-item', 'w-full', 'text-left');
      snippetItemButton.textContent = snippet.name;
      snippetItem.appendChild(snippetItemButton);

      if (selectedSnippet?.id === snippet.id) {
        snippetItem.classList.add('selected');
      }

      snippetItem.addEventListener('click', async () => {
        root.querySelectorAll('.selected').forEach((el) => el.classList.remove('selected'));
        snippetItem.classList.add('selected');

        const newSelectedSnippet = await getSnippetsRepo().getOne(snippet.id);
        updateDialogs(newSelectedSnippet);
        renderSnippetEditor(snippetEditor, newSelectedSnippet);
      });
      folderItems.appendChild(snippetItem);
    }

    folderContainer.appendChild(folderItemsContainer);
    root.appendChild(folderContainer);
  }
}

export function updateSelectedSnippetItem(root: HTMLElement | null, selectedSnippet?: Snippet) {
  if (!root) {
    log.warn('No root element found for snippet list');
    return;
  }

  root.querySelectorAll('.selected').forEach((el) => el.classList.remove('selected'));

  const selectedSnippetItem = root.querySelector(`[data-id="${selectedSnippet?.id}"]`);
  selectedSnippetItem?.classList.add('selected');
}
