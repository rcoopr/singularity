import { KeybindPreset } from '@/utils/keybindings/keybindings';
import { prefersDark } from '@/utils/preferences/color-scheme';
import { BundledTheme } from 'shiki';
import type { WxtStorageItem } from 'wxt/storage';

export type Preferences = {
  theme: BundledTheme;
  useFavourites: boolean;
  keybindings: KeybindPreset | null;
  platform: Platform;
};

export const options: {
  [K in keyof Preferences]: WxtStorageItem<Preferences[K], {}>;
} = {
  theme: storage.defineItem<BundledTheme>('sync:theme', {
    defaultValue: prefersDark() ? 'rose-pine' : 'catppuccin-latte',
  }),
  useFavourites: storage.defineItem<boolean>('sync:useFavourites', {
    defaultValue: true,
  }),
  keybindings: storage.defineItem<KeybindPreset | null>('sync:keybindings', {
    defaultValue: null,
  }),
  platform: storage.defineItem<Platform>('local:platform', {
    defaultValue: 'win',
  }),
};

export type Platform = Awaited<ReturnType<typeof browser.runtime.getPlatformInfo>>['os'];
