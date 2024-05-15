import { config, options } from '@/utils/preferences/storage';
import { injectScript } from '../utils/inject-script';
import { allowWindowMessaging, sendMessage } from 'webext-bridge/content-script';

let isInjected = false;

export default defineContentScript({
  matches: ['*://app.singular.live/compositions/*', '*://www.google.com/*'],
  main() {
    log.debug('Content script init');
    if (
      window.location.origin.includes('//app.singular.live/compositions') ||
      window.location.origin.includes('//www.google.com')
    ) {
      allowWindowMessaging('com.rcoopr.singularity');
    }

    injectScript('/injected.js', () => {
      isInjected = true;
      syncKeybindsOption();
    });

    options.keybindings.watch(() => syncKeybindsOption());
    config.platform.watch(() => syncKeybindsOption());
  },
});

async function syncKeybindsOption() {
  if (!browser.runtime.id) return;

  const preset = await options.keybindings.getValue();
  log.debug('Syncing keybinds option', preset);
  if (!preset) return; // TODO: disable keybinds

  const platform = await config.platform.getValue();
  sendMessage(
    'enableKeybinds',
    {
      preset,
      platform,
    },
    'window'
  );
}
