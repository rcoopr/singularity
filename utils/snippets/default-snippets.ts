import { SnippetInput } from '@/utils/snippets/repo';

export const defaultSnippets: SnippetInput[] = [
  {
    code: `(function() {
  return {
    init: function(comp, context) {},
    close: function(comp, context) {}
  };
})();
`,
    context: 'composition',
    name: 'Boilerplate',
    desc: 'Standard boilerplate for any composition script',
    lang: 'javascript',
  },
];
