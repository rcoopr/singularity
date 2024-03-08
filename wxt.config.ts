import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  runner: {
    startUrls: ['https://www.google.com/'],
  },
  manifest: {
    web_accessible_resources: [
      {
        resources: ['/injected.js'],
        matches: ['<all_urls>'],
      },
    ],
    permissions: ['contextMenus', 'clipboardRead', 'tabs'],
  },
});
