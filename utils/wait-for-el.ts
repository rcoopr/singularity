export function waitForEl<T extends Element>(
  selector: string,
  doc = document,
  debug = false
): Promise<T> {
  return new Promise((resolve) => {
    if (doc.querySelector(selector)) {
      return resolve(doc.querySelector(selector) as T);
    }

    const observer = new MutationObserver((mutations) => {
      if (debug) log.debug(mutations);
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            const match = node.matches(selector) ? node : node.querySelector(selector);
            if (match) {
              observer.disconnect();
              resolve(match as T);
            }
          }
        }
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(doc.body, {
      childList: true,
      subtree: true,
    });
  });
}
