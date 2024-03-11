import { Snippet, getSnippetsRepo, isSnippetContext } from '@/utils/snippets/repo';
import { selectSnippet } from '@/components/snippet-manager/select-snippet';

var isInitialized = false;
export function initDialogs() {
  if (isInitialized) return;
  isInitialized = true;

  const dialogs = document.querySelectorAll('dialog');

  for (const dialog of dialogs) {
    const trigger = dialog.dataset.trigger;
    if (!trigger) return;

    const button = document.querySelector<HTMLButtonElement>(`#${trigger}`);
    const form = dialog.querySelector<HTMLFormElement>('form');

    button?.addEventListener('click', () => dialog.showModal());
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget as HTMLFormElement);

      let snippet;
      try {
        if (trigger.includes('add')) {
          snippet = await addSnippetFormHandler(formData);
        } else if (trigger.includes('edit')) {
          snippet = await editSnippetFormHandler(formData);
        } else if (trigger.includes('delete')) {
          deleteSnippetFormHandler(formData);
        }
      } catch (err) {
        log.error('Error submitting form', err);
      }

      selectSnippet(snippet);

      if (trigger.includes('add')) form.reset();
      dialog.close();
    });

    form?.addEventListener('reset', (e) => {
      // don't reset the form if it's an edit form
      if (trigger.includes('edit')) e.preventDefault();

      dialog.close();
    });
  }
}

export function updateDialogs(selectedSnippet: Snippet | undefined) {
  const dialogs = document.querySelectorAll('dialog');
  // TODO: handle radio buttons
  for (const dialog of dialogs) {
    if (dialog.dataset.trigger?.includes('edit')) {
      dialog.querySelectorAll('input').forEach((input) => {
        // Reset when no snippet is selected, and don't auto-fill when adding a new snippet
        if (!selectedSnippet) {
          input.value = '';
          return;
        }

        // TODO - maybe causes issues with booleans etc
        input.value = selectedSnippet[input.name as keyof Snippet]?.toString() || '';
      });
      const codeInput = dialog.querySelector('textarea');
      if (codeInput && selectedSnippet) {
        codeInput.value = selectedSnippet.code;
      }
    } else if (dialog.dataset.trigger?.includes('delete')) {
      const idInput = dialog.querySelector('input');
      if (idInput && selectedSnippet) {
        idInput.value = selectedSnippet.id;
      }
    }
  }
}

async function addSnippetFormHandler(formData: FormData) {
  const name = formData.get('name')?.toString() ?? '';
  const code = formData.get('code')?.toString() ?? '';
  const desc = formData.get('description')?.toString() ?? '';
  const contextStr = formData.get('context')?.toString() ?? '';
  const context = isSnippetContext(contextStr) ? contextStr : 'composition';

  const snippetsRepo = getSnippetsRepo();
  return await snippetsRepo.createOrUpdate({ name, code, desc, context });
}

async function editSnippetFormHandler(formData: FormData) {
  const id = formData.get('name')?.toString();
  if (!id) {
    log.warn('No id found for snippet');
    return;
  }
  const name = formData.get('name')?.toString() ?? '';
  const code = formData.get('code')?.toString() ?? '';
  const desc = formData.get('description')?.toString() ?? '';
  const contextStr = formData.get('context')?.toString() ?? '';
  const context = isSnippetContext(contextStr) ? contextStr : 'composition';

  const snippetsRepo = getSnippetsRepo();
  return await snippetsRepo.update(id, { name, code, desc, context });
}

async function deleteSnippetFormHandler(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) {
    log.warn('No id found for snippet');
    return;
  }

  const snippetsRepo = getSnippetsRepo();
  return await snippetsRepo.delete(id);
}
