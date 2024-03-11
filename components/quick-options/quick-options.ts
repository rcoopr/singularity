import '@/assets/controls.css';
import { options } from '@/utils/preferences/storage';
import { BundledTheme, bundledThemesInfo } from 'shiki';
import { prefersDark } from '@/utils/preferences/color-scheme';
import { log } from '@/utils/log';

type OptionName = keyof typeof options;

// TODO: add bulk import/export/delete/restore to default options
const createOptionControls: Record<OptionName, () => Promise<HTMLElement>> = {
  theme: createThemeControls,
};

export async function appendControls(
  root: HTMLDivElement | null,
  selectedOptions: OptionName[] = ['theme']
) {
  if (!root) {
    log.warn('No element to setup quick options');
    return;
  }

  if (selectedOptions.length === 0) {
    log.warn('No options selected for quick options');
    return;
  }

  const controls = await Promise.all(
    (selectedOptions ?? []).map(async (opt) => {
      return createOptionControls[opt]();
    })
  );

  controls.forEach((control) => root.appendChild(control));
}

async function createThemeControls() {
  const container = document.createElement('div');
  container.classList.add('flex', 'flex-col', 'grow');
  container.innerHTML = html`
    <label for="color-theme" class="label">Color Theme</label>
    <select id="color-theme" class="select sm:max-w-max">
      ${createThemeOptionGroups()}
    </select>
  `;

  const themeSelectEl = container.querySelector<HTMLSelectElement>('#color-theme')!;
  const theme = await options.theme.getValue();
  themeSelectEl.value = theme;
  themeSelectEl.addEventListener('change', (e) => {
    const target = e.currentTarget as HTMLSelectElement;
    options.theme.setValue(target.value as BundledTheme);
  });

  options.theme.watch((theme) => (themeSelectEl.value = theme));

  return container;
}

function createThemeOptionGroups() {
  const dark = bundledThemesInfo.filter((theme) => theme.type === 'dark');
  const light = bundledThemesInfo.filter((theme) => theme.type === 'light');
  const darkFirst = prefersDark();

  return html`
    <optgroup label="Dark">${createThemeOptions(darkFirst ? dark : light)}</optgroup>
    <optgroup label="Light">${createThemeOptions(darkFirst ? light : dark)}</optgroup>
  `;
}

function createThemeOptions(themes: typeof bundledThemesInfo) {
  return themes.map((theme) => html`<option value="${theme.id}">${theme.displayName}</option>`);
}
