import { SnippetContext } from '@/utils/snippets/repo';
import { defineCustomEventMessaging } from '@webext-core/messaging/page';

export interface WebsiteMessengerSchema {
  insert(data: string): void;
  context(data: SnippetContext | null): void;
}

export const websiteMessenger = defineCustomEventMessaging<WebsiteMessengerSchema>({
  namespace: '<some-unique-string>',
});
