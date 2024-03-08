import { prefersDark } from '@/utils/preferences/color-scheme';
import { Preferences } from '@/utils/preferences/default-preferences';
import { BundledTheme } from 'shiki';
import type { WxtStorageItem } from 'wxt/storage';

export const options: {
  [K in keyof Preferences]: WxtStorageItem<Preferences[K], {}>;
} = {
  theme: storage.defineItem<BundledTheme>('sync:colorScheme', {
    defaultValue: prefersDark() ? 'rose-pine' : 'catppuccin-latte',
  }),
};