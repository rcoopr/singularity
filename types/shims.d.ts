import { SnippetContext } from '@/utils/snippets/repo';
import { ProtocolWithReturn } from 'webext-bridge';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    context: SnippetContext | null;

    // Sends last known cursor position so snippets can be inserted without an active cursor
    cursorPosition: { anchor: AceAjax.Position; lead: AceAjax.Position };

    // Insert snippet into active element
    insert: { code: Snippet['code']; position?: CursorPosition };

    // Enable keybindings for the given preset
    enableKeybinds: { preset: KeybindPreset; platform: Platform };
  }
}
