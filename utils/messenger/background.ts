import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  insert(data: string): void;
}

export const backgroundMessenger = defineExtensionMessaging<ProtocolMap>();
