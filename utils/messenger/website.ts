import { KeybindPreset } from '@/utils/keybindings/keybindings';
import { Platform } from '@/utils/preferences/storage';
import { Snippet, SnippetContext } from '@/utils/snippets/repo';
import { defineCustomEventMessaging } from '@webext-core/messaging/page';

export interface WebsiteMessengerProtocol {
  // Used when right clicking the script editor - determines which snippets to show
  context(data: SnippetContext | null): void;

  // Sends last known cursor position so snippets can be inserted without an active cursor
  cursorPosition(data: AceAjax.Position): void;

  // Insert snippet into active element
  insert(data: Snippet['code']): void;

  // Enable keybindings for the given preset
  enableKeybinds(data: { preset: KeybindPreset; platform: Platform }): void;
}

export const websiteMessenger = defineCustomEventMessaging<WebsiteMessengerProtocol>({
  namespace: 'singularity-snippets',
});
