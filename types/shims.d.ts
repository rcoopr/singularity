import { SnippetContext } from '@/utils/snippets/repo';
import { ProtocolWithReturn } from 'webext-bridge';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    context: SnippetContext | null;

    // Insert snippet into active element
    insert: { code: Snippet['code']; position?: CursorPosition };

    // Enable keybindings for the given preset
    enableKeybinds: { preset: KeybindPreset; platform: Platform };
  }
}
