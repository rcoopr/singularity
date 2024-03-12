import { selectSnippet } from '@/components/snippet-manager/select-snippet';
import { createIconStar } from '@/components/svg';
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

    const folderHeader = document.createElement('button');
    folderHeader.className = 'folder-header';
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
      const folderItem = document.createElement('li');
      const folderItemButton = document.createElement('button');

      folderItem.dataset.id = snippet.id;
      folderItem.classList.add('folder-item');
      folderItemButton.innerHTML = html`<span class="px-2 py-1">${snippet.name}</span>`;
      folderItemButton.className = 'bg-fg/20';

      folderItem.appendChild(folderItemButton);
      folderItemButton.appendChild(createFavouriteCheckbox(snippet));

      if (selectedSnippet?.id === snippet.id) {
        folderItem.classList.add('selected');
      }

      folderItemButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newSelectedSnippet = await getSnippetsRepo().getOne(snippet.id);
        selectSnippet(newSelectedSnippet, { renderSnippetList: false });
      });

      folderItems.appendChild(folderItem);
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

function createFavouriteCheckbox(snippet: Snippet) {
  const button = document.createElement('button');
  button.classList.add('favourite');
  button.dataset.checked = snippet.favourite ? 'true' : 'false';

  button.addEventListener('click', async (e) => {
    e.stopPropagation();
    const currentTarget = e.currentTarget as HTMLButtonElement;
    if (!currentTarget) return;

    const wasFavourite = currentTarget.dataset.checked === 'true';
    currentTarget.dataset.checked = wasFavourite ? 'false' : 'true';

    await getSnippetsRepo().update(snippet.id, { favourite: !wasFavourite });
  });

  button.append(createIconStar());

  return button;
}
