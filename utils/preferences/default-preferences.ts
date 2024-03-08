import { BundledTheme } from 'shiki';

export type Preferences = {
  theme: BundledTheme;
};

export const defaultPreferences: Preferences = {
  theme: 'rose-pine',
};
