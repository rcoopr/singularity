import { PublicPath } from 'wxt/browser';
import './uno-layout.css';

type MaybeHTMLElement = HTMLElement | null | undefined;

export default defineContentScript({
  matches: ['*://app.singular.live/control/*', '*://app.singular.live/appinstances/*/control'],
  async main() {
    log.debug('Content script init');

    const document = await waitForIFrameDocument();
    const page = await waitForEl<HTMLElement>('.page', document);
    const menuItems = page?.querySelector('.menu-wrapper--inner') as MaybeHTMLElement;
    const controls = page?.querySelector('div[data-index="0"] .tile.scroll') as MaybeHTMLElement;

    // Horizontal menu only has a 'Control' item with multiple overlays
    const hasControls = menuItems?.firstChild?.textContent === 'Control';
    if (!menuItems || !hasControls) {
      log.info('No controls found');
      return;
    }

    if (!document || !page || !controls) {
      log.warn('No content found');
      return;
    }

    initCustomLayout({ document, page, controls, menuItems });
  },
});

async function initCustomLayout({
  document,
  page,
  controls,
  menuItems,
}: {
  document: Document;
  page: HTMLElement;
  controls: HTMLElement;
  menuItems: HTMLElement;
}) {
  const controlsOriginalParent = controls?.parentElement;

  if (!document || !page || !controls) {
    log.warn('No content found');
    return;
  }

  // Append custom styles to iFrame
  const css = await loadCss();
  const styles = document.createElement('style');
  styles.textContent = css;
  document.head.append(styles);

  // Create a new column for the controls and move the original controls into it
  const pageColumn = document.createElement('div');
  pageColumn.classList.add('page-column', 'controls');

  page.append(pageColumn);
  pageColumn.append(controls);

  // Replace the original controls with a message
  const messageText =
    'Controls have been customized by the Singularity Extension.\n\nTo access the original controls, click the toggle button in the top left corner, or disable the extension.';
  const message = document.createElement('div');
  message.classList.add('tnl-custom-message');
  message.textContent = messageText;
  controlsOriginalParent?.append(message);

  // Add additional controls for the settings and customize tab
  const header = controls.querySelector('.tile-content') as MaybeHTMLElement;
  const headerLabel = header?.firstChild as MaybeHTMLElement;

  if (header && headerLabel) {
    headerLabel.classList.add('pointer');

    const customHeader = document.createElement('div');
    customHeader.classList.add('tnl-controls-title');

    const extraMenuItemsContainer = document.createElement('div');
    extraMenuItemsContainer.classList.add('special-menu-items');

    const customizeLabel = document.createElement('label');
    customizeLabel.classList.add('tile-grid-label', 'underline');
    customizeLabel.textContent = 'Customize';
    customizeLabel.onclick = () =>
      (menuItems.lastChild?.previousSibling?.firstChild as MaybeHTMLElement)?.click();

    const settingsLabel = document.createElement('label');
    settingsLabel.classList.add('tile-grid-label', 'underline');
    settingsLabel.textContent = 'Settings';
    settingsLabel.onclick = () => (menuItems.lastChild?.firstChild as MaybeHTMLElement)?.click();

    // Attach the custom header to the new page column and move the original label and extra menu items to the new header
    pageColumn.prepend(customHeader);
    customHeader.append(headerLabel, extraMenuItemsContainer);
    extraMenuItemsContainer.append(customizeLabel, settingsLabel);

    // Add toggle controls
    const toggle = document.createElement('button');
    toggle.classList.add('tnl-toggle-button');
    toggle.title = 'Toggle Sidebar';

    toggle.onclick = () => {
      if (!controlsOriginalParent) return;

      const isCustomLayout = controlsOriginalParent.textContent === messageText;
      if (isCustomLayout) {
        controlsOriginalParent.innerHTML = '';
        controlsOriginalParent.append(controls);
        header.prepend(headerLabel);
        pageColumn.remove();
      } else {
        page.append(pageColumn);
        pageColumn.append(controls);
        customHeader.prepend(headerLabel);
        controlsOriginalParent?.append(message);
      }
    };
    headerLabel.prepend(toggle);
  }
}

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
