import { bindings as sublimeBindings } from '@/utils/keybindings/presets/sublime';
import { bindings as vscodeBindings } from '@/utils/keybindings/presets/vscode';

export type KeybindPreset = (typeof keybinds)[number]['id'];

export const keybinds = [
  { id: 'vscode', displayName: 'VS Code', keybinds: vscodeBindings },
  { id: 'sublime', displayName: 'Sublime', keybinds: sublimeBindings },
] as const satisfies {
  id: string;
  displayName: string;
  keybinds: unknown[];
}[];

const keybindsMap = Object.fromEntries(keybinds.map((entry) => [entry.id, entry.keybinds]));

export async function enableKeybinds(
  editor: AceAjax.Editor,
  preset: KeybindPreset,
  platform: 'mac' | 'win' | 'linux' = 'win'
) {
  for (const keybind of keybindsMap[preset]) {
    const key =
      platform in keybind.bindKey
        ? keybind.bindKey[platform as keyof typeof keybind.bindKey]
        : undefined;
    if (key) editor.commands.bindKey(key, keybind.name as unknown as AceAjax.CommandLike);
  }
}
