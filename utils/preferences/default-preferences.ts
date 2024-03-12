import { BundledTheme } from 'shiki';

export type Preferences = {
  theme: BundledTheme;
  useFavourites: boolean;
};

export const defaultPreferences: Preferences = {
  theme: 'rose-pine',
  useFavourites: false,
};
