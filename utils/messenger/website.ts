import { defineCustomEventMessaging } from '@webext-core/messaging/page';
type SnippetContext = any;
export interface WebsiteMessengerSchema {
  insert(data: string): void;
  context(data: SnippetContext | null): void;
}

export const websiteMessenger = defineCustomEventMessaging<WebsiteMessengerSchema>({
  namespace: '<some-unique-string>',
});
