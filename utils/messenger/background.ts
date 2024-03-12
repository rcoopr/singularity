import { WebsiteMessengerProtocol } from '@/utils/messenger/website';
import { defineExtensionMessaging } from '@webext-core/messaging';

interface BackgroundMessageProtocol extends WebsiteMessengerProtocol {
  // snippetAdded(data: Snippet): void;
  // snippetUpdated(data: Snippet): void;
  // snippetDeleted(data: { id: string }): void;
}

export const backgroundMessenger = defineExtensionMessaging<BackgroundMessageProtocol>();
