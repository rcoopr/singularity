// https://twoslash.netlify.app/packages/cdn#synchronize-usage

// TODO: Replace with explicit versions in production
import { createTransformerFactory, rendererRich } from '@shikijs/twoslash';
import { codeToHtml } from 'shiki';
import { createTwoslashFromCDN } from 'twoslash-cdn';
// import { createStorage } from 'unstorage';
// import localStorageDriver from 'unstorage/drivers/localstorage';

// ============= Initialization =============

// An example using unstorage with IndexedDB to cache the virtual file system
// const storage = createStorage({
//   driver: localStorageDriver({ base: 'twoslash-cdn' }),
// });

const twoslash = createTwoslashFromCDN({
  // storage,
  compilerOptions: {
    lib: ['esnext', 'dom'],
  },
});

const transformerTwoslash = createTransformerFactory(twoslash.runSync)({
  renderer: rendererRich(),
});

// ============= Execution =============

export async function doTwoSlash() {
  const source = `
  import { ref } from 'vue'
  
  console.log("Hi! Shiki + Twoslash on CDN :)")
  
  const count = ref(0)
  //     ^?
  `.trim();

  // Before rendering, we need to prepare the types, so that the rendering can happen synchronously
  await twoslash.prepareTypes(source);

  // Then we can render the code
  await codeToHtml(source, {
    lang: 'ts',
    theme: 'vitesse-dark',
    transformers: [transformerTwoslash],
  });
}
