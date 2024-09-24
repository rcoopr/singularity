import { PublicPath } from 'wxt/browser';

export function injectScript(path: PublicPath, onLoad?: () => void) {
  const scriptElement = document.createElement('script');
  scriptElement.src = browser.runtime.getURL(path);
  scriptElement.onload = () => {
    if (onLoad) onLoad();
    scriptElement.remove();
  };
  (document.head || document.documentElement).appendChild(scriptElement);
}
