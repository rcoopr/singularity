import { updateDialogs } from '@/components/snippet-manager/dialogs';
import { selectSnippet } from '@/components/snippet-manager/select-snippet';
import { renderSnippetEditor } from '@/components/snippet-manager/snippet-editor';
import { Snippet, getSnippetsRepo, groupSnippetsByContext } from '@/utils/snippets/repo';

var isInitialized = false;
export async function initSnippetList() {
  if (isInitialized) return;
  isInitialized = true;

  const root = document.querySelector<HTMLDivElement>('#snippet-list');

  if (!root) {
    log.warn('No root element found for snippet list');
    return;
  }

  const snippetsRepo = getSnippetsRepo();
  const snippets = groupSnippetsByContext(await snippetsRepo.getAll());

  // render current snippet names in folders + set up listeners to keep it updated
  const selectedSnippet = snippets[0]?.snippets[0];
  selectSnippet(selectedSnippet);
}

export async function renderSnippetList(selectedSnippet: Snippet | undefined) {
  const root = document.querySelector<HTMLDivElement>('#snippet-list');

  if (!root) {
    log.warn('No root element found for snippet list');
    return;
  }

  const snippetsRepo = getSnippetsRepo();
  const folders = groupSnippetsByContext(await snippetsRepo.getAll());

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
        const newSelectedSnippet = await getSnippetsRepo().getOne(snippet.id);
        selectSnippet(newSelectedSnippet, { renderSnippetList: false });
      });
      folderItems.appendChild(snippetItem);
    }

    folderContainer.appendChild(folderItemsContainer);
    root.appendChild(folderContainer);
  }
}

export function updateSelectedSnippetItem(selectedSnippet: Snippet | undefined) {
  const root = document.querySelector<HTMLDivElement>('#snippet-list');

  if (!root) {
    log.warn('No root element found for snippet list');
    return;
  }

  root.querySelectorAll('.selected').forEach((el) => el.classList.remove('selected'));

  const selectedSnippetItem = root.querySelector(`[data-id="${selectedSnippet?.id}"]`);
  selectedSnippetItem?.classList.add('selected');
}
