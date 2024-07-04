import { config, options } from '@/utils/preferences/storage';
import { injectScript } from '../utils/inject-script';
import { allowWindowMessaging, sendMessage } from 'webext-bridge/content-script';

export default defineContentScript({
  matches: ['*://www.google.com/*', '*://app.singular.live/compositions/*'],
  main() {
    log.debug('Content script init');
    if (
      window.location.hostname === 'app.singular.live' ||
      window.location.hostname === 'www.google.com'
    ) {
      allowWindowMessaging('com.rcoopr.singularity');
    }

    injectScript('/injected.js', () => {
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
  ).catch(noop);
}
