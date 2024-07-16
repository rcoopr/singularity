import { Snippet, getSnippetsRepo, isSnippetContext, isValidLang } from '@/utils/snippets/repo';
import { selectSnippet } from '@/components/snippet-manager/select-snippet';
import { BundledTheme } from 'shiki';
import { options, Preferences } from '@/utils/preferences/storage';

var isInitialized = false;
export function initDialogs() {
  if (isInitialized) return;
  isInitialized = true;

  const snippetCrudDialogs = document.querySelectorAll<HTMLDialogElement>('dialog.dialog-snippet');

  for (const dialog of snippetCrudDialogs) {
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

  const importExportDialog = document.querySelector<HTMLDialogElement>(
    'dialog.dialog-import-export'
  );
  if (importExportDialog) {
    const trigger = importExportDialog.dataset.trigger;
    const exportButton = document.querySelector<HTMLButtonElement>('#export');
    const deleteAllSnippetsButton = document.querySelector<HTMLButtonElement>('#delete-snippets');
    const form = importExportDialog.querySelector<HTMLFormElement>('form');
    const triggerButton = document.querySelector<HTMLButtonElement>(`#${trigger}`);

    triggerButton?.addEventListener('click', () => importExportDialog.showModal());
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const file = formData.get('import') as File;
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          const snippetsRepo = getSnippetsRepo();
          const { snippets, settings } = JSON.parse(content) as {
            snippets: Snippet[];
            settings: Preferences;
          };
          log.debug({ content, snippets, settings });
          try {
            await Promise.all([
              snippetsRepo.import(snippets),
              ...(settings
                ? [
                    options.theme.setValue(settings.theme),
                    options.useFavourites.setValue(settings.useFavourites),
                    options.keybindings.setValue(settings.keybindings),
                  ]
                : []),
            ]);

            selectSnippet(undefined);
          } catch (e) {
            log.error('Error importing snippets', e);
          }
          form.reset();
          importExportDialog.close();
        };
        reader.readAsText(file);
      }
    });

    const snippetsRepo = getSnippetsRepo();
    exportButton?.addEventListener('click', () => exportProfile());
    deleteAllSnippetsButton?.addEventListener('click', async () => {
      const shouldDelete = confirm(
        "Are you sure you want to delete all snippets? This action can't be undone."
      );

      if (!!shouldDelete) {
        await snippetsRepo.deleteAll();
        selectSnippet(undefined);
      }
    });
    form?.addEventListener('reset', () => importExportDialog?.close());
  }
}

export function updateDialogs(selectedSnippet: Snippet | undefined) {
  const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog.dialog-snippet');
  // TODO: handle radio buttons
  for (const dialog of dialogs) {
    if (dialog.dataset.trigger?.includes('edit')) {
      const codeInput = dialog.querySelector('textarea');
      if (codeInput) {
        codeInput.value = selectedSnippet?.code || '';
      }

      dialog.querySelectorAll('input').forEach((input) => {
        // Reset when no snippet is selected, and don't auto-fill when adding a new snippet
        // if (!selectedSnippet) {
        //   input.value = '';
        //   return;
        // }

        const value = selectedSnippet?.[input.name as keyof Snippet];
        if (input.name === 'lang') {
          input.checked = input.value === (value || 'javascript');
          return;
        }

        if (input.name === 'context') {
          input.checked = input.value === (value || 'composition');
          return;
        }

        if (input.name === 'favourite') {
          input.checked = !!value;
        }

        input.value = selectedSnippet?.[input.name as keyof Snippet]?.toString() || '';
      });
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
  const desc = formData.get('desc')?.toString() ?? '';
  const favourite = Boolean(formData.get('favourite'));
  const contextStr = formData.get('context')?.toString() ?? '';
  const context = isSnippetContext(contextStr) ? contextStr : 'composition';
  const langStr = formData.get('lang')?.toString() ?? 'javascript';
  const lang = isValidLang(langStr) ? langStr : 'javascript';

  const snippetsRepo = getSnippetsRepo();
  return await snippetsRepo.createOrUpdate({ name, code, desc, context, favourite, lang });
}

async function editSnippetFormHandler(formData: FormData) {
  const id = formData.get('id')?.toString();
  if (!id) {
    log.warn('No id found for snippet');
    return;
  }
  const name = formData.get('name')?.toString() ?? '';
  const code = formData.get('code')?.toString() ?? '';
  const desc = formData.get('desc')?.toString() ?? '';
  const favourite = Boolean(formData.get('favourite'));
  const contextStr = formData.get('context')?.toString() ?? '';
  const context = isSnippetContext(contextStr) ? contextStr : 'composition';
  const langStr = formData.get('lang')?.toString() ?? 'javascript';
  const lang = isValidLang(langStr) ? langStr : 'javascript';

  const snippetsRepo = getSnippetsRepo();
  return await snippetsRepo.update(id, { name, code, desc, context, favourite, lang });
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

export async function exportProfile() {
  const snippetsRepo = getSnippetsRepo();
  const [snippets, theme, useFavourites, keybindings] = await Promise.all([
    snippetsRepo.getAll(),
    options.theme.getValue(),
    options.useFavourites.getValue(),
    options.keybindings.getValue(),
  ]);
  // const snippets = await snippetsRepo.getAll();
  const json = JSON.stringify({ snippets, settings: { theme, useFavourites, keybindings } });
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `singularity-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Add this code where you initialize your buttons
const exportButton = document.querySelector<HTMLButtonElement>('#exportButton');
exportButton?.addEventListener('click', exportProfile);
