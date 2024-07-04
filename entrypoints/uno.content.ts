import { PublicPath } from 'wxt/browser';
import './uno-layout.css';

type MaybeHTMLElement = HTMLElement | null | undefined;

export default defineContentScript({
  matches: ['*://app.singular.live/control/*', '*://app.singular.live/appinstances/*/control'],
  async main() {
    log.debug('Content script init');

    const document = await waitForIFrameDocument();
    const page = await waitForEl<HTMLElement>('.page', document);
    const menuItemsRoot = page.querySelector('.menu-wrapper--inner');

    // Horizontal menu only has a 'Control' item with multiple overlays
    const hasControls = menuItemsRoot?.firstChild?.textContent === 'Control';
    if (!hasControls) return;

    const controls = page?.querySelector('div[data-index="0"] .tile.scroll');

    if (!document || !page || !controls) {
      log.warn('No content found');
      return;
    }

    const css = await loadCss();
    const styles = document.createElement('style');
    styles.textContent = css;
    document.head.append(styles);

    const pageColumn = document.createElement('div');
    pageColumn.classList.add('page-column', 'controls');
    const controlsClone = controls.cloneNode(true) as HTMLElement;
    const tileGrid = controls.querySelector('.tile-grid');
    const tileGridClone = controlsClone.querySelector('.tile-grid');
    if (!tileGridClone) return;

    const menuClone = controlsClone.querySelector('.tile-content') as MaybeHTMLElement;
    const menuTitleClone = menuClone?.firstChild as MaybeHTMLElement;

    if (menuTitleClone) {
      const newMenuTitle = document.createElement('div');
      newMenuTitle.classList.add('tnl-controls-title');

      const specialMenuItemsContainer = document.createElement('div');
      specialMenuItemsContainer.classList.add('special-menu-items');
      const customizeLabel = document.createElement('label');
      customizeLabel.classList.add('tile-grid-label', 'underline');
      customizeLabel.textContent = 'Customize';

      const settingsLabel = document.createElement('label');
      settingsLabel.classList.add('tile-grid-label', 'underline');
      settingsLabel.textContent = 'Settings';

      customizeLabel.onclick = () =>
        (menuItemsRoot.lastChild?.previousSibling?.firstChild as MaybeHTMLElement)?.click();
      settingsLabel.onclick = () =>
        (menuItemsRoot.lastChild?.firstChild as MaybeHTMLElement)?.click();

      specialMenuItemsContainer.append(customizeLabel, settingsLabel);
      newMenuTitle.append(menuTitleClone, specialMenuItemsContainer);
      // menuClone?.prepend(newMenuTitle);
      pageColumn.append(newMenuTitle);
    }

    for (let i = 0; i < tileGridClone.children.length; i++) {
      const child = tileGridClone?.children[i] as MaybeHTMLElement;
      if (!child) continue;

      // remove Slot dropdowns
      if (child.tagName === 'SPAN') {
        child.outerHTML = '<span></span>';
        continue;
      }

      // add event handlers to checkboxes
      else if (child.tagName === 'DIV') {
        const inputClone = child.querySelector('input');
        const input = tileGrid?.children[i]?.querySelector('input');

        if (!input || !inputClone) {
          log.warn(`Mismatched inputs (${i})`, { input, inputClone });
          continue;
        }

        // send click event to original input
        inputClone.onclick = () => input.click();

        // sync state from original input
        input.onchange = (e) => (inputClone.checked = (e.target as HTMLInputElement)?.checked);

        continue;
      }

      // add event handlers to overlay titles
      else if (child.tagName === 'LABEL') {
        // const menuItem
        if (!menuItemsRoot) {
          log.warn('No menu items found');
          continue;
        }

        const menuItem = menuItemsRoot.children[1 + Math.floor(i / 3)];
        const menuItemClickElement = menuItem?.firstChild as MaybeHTMLElement;

        if (menuItemClickElement) child.onclick = () => menuItemClickElement.click();
      }
    }

    // for (const node of tileGridClone?.children || []) {
    //   // remove Slot dropdowns
    //   if (node.tagName === 'SPAN') node.outerHTML = '<span></span>';

    //   if (node.tagName === 'DIV') {
    //     const input = node.querySelector('input');
    //     if (input) {
    //       input.onclick = function (e) {
    //         console.log('clicked', e);
    //       };
    //     }
    //   }
    // }

    pageColumn.append(controlsClone);
    page.append(pageColumn);
  },
});

// Notes for slots
/**
 * .tile-grid has css for 3 columns, every 3rd child is a span. When an overlay has slots enabled, the spans have content
 * this causes overflow with a small min-width. should sync the min-width with slots/no slots and change width based on it
 *
 */

async function waitForIFrameDocument(): Promise<Document | undefined> {
  const iFrame: HTMLIFrameElement = await waitForEl(
    'iframe[title="Control App Instance"]',
    document
  );

  if (!iFrame?.contentDocument) {
    log.warn('No content document found');
    return;
  }

  log.debug('Found iframe', iFrame.contentDocument);

  await waitForIFrameBodyChildren(iFrame, 100, 10000);
  log.debug('Found body with children', iFrame.contentDocument.body);

  return iFrame.contentDocument;
}

function waitForIFrameBodyChildren(
  iframe: HTMLIFrameElement,
  checkFrequencyInMs = 100,
  timeoutInMs = 10000
): Promise<HTMLElement> {
  const startTimeInMs = Date.now();

  return new Promise((resolve) => {
    (function loopSearch() {
      if (iframe.contentDocument?.body?.children.length) {
        resolve(iframe.contentDocument.body);
        return;
      } else {
        setTimeout(function () {
          if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
          loopSearch();
        }, checkFrequencyInMs);
      }
    })();
  });
}

// https://github.com/wxt-dev/wxt/blob/4c6a57dd3309352a5dc63073877cded4ef7f734a/packages/wxt/src/client/content-scripts/ui/index.ts#L243
async function loadCss(): Promise<string> {
  const url = browser.runtime.getURL(
    `/content-scripts/${import.meta.env.ENTRYPOINT}.css` as PublicPath
  );
  try {
    const res = await fetch(url);
    return await res.text();
  } catch (err) {
    log.warn(
      `Failed to load styles @ ${url}. Did you forget to import the stylesheet in your entrypoint?`,
      err
    );
    return '';
  }
}
