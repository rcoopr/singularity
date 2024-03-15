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
    permissions: ['contextMenus', 'tabs', 'storage', 'clipboardRead', 'clipboardWrite'],
    host_permissions: ['*://*.google.com/*', '*://app.singular.live/compositions/*'],
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
    },
    name: 'Singularity',
    description: 'A snippet manager for Singular.live composition scripts',
    author: 'Ross Cooper',
  },
});
