import { defineProxyService } from '@webext-core/proxy-service';
import { IDBPDatabase } from 'idb';
import { nanoid } from 'nanoid';
import groupBy from 'object.groupby';

export type SnippetsRepo = {
  create(snippet: SnippetInput): Promise<Snippet>;
  update(snippet: Snippet): Promise<Snippet>;
  delete(id: Snippet['id']): Promise<void>;
  getOne(id: Snippet['id']): Promise<Snippet>;
  getAll(): Promise<Snippet[]>;
};

export type SnippetInput = Omit<Snippet, 'id'>;
export type Snippet = {
  id: string;
  name: string;
  context: SnippetContext;
  code: string;
  desc?: string;
  lang?: 'javascript' | 'typescript' | 'html';
  createdAt: number;
  updatedAt?: number;
};

function createSnippetsRepo(db: Promise<IDBPDatabase>): SnippetsRepo {
  return {
    async create(snippet) {
      const id = nanoid();
      const snippetWithMetadata = { ...snippet, id, createdAt: Date.now() };
      await (await db).put('snippets', snippetWithMetadata);
      return snippetWithMetadata;
    },
    async update(snippet) {
      const updatedSnippet = { ...snippet, updatedAt: Date.now() };
      await (await db).put('snippets', updatedSnippet);
      return updatedSnippet;
    },
    async delete(id) {
      await (await db).delete('snippets', id);
    },
    async getOne(id) {
      return await (await db).get('snippets', id);
    },
    async getAll() {
      return await (await db).getAll('snippets');
    },
  };
}

export const [registerSnippetsRepo, getSnippetsRepo] = defineProxyService(
  'snippets-repo',
  createSnippetsRepo
);

export const snippetContexts = ['composition', 'global', 'overlay', 'shared'] as const;
export type SnippetContext = (typeof snippetContexts)[number];

export function groupSnippetsByContext(snippets: Snippet[]): {
  context: 'composition' | 'global' | 'overlay' | 'shared';
  snippets: Snippet[];
}[] {
  const grouped = groupBy(snippets, (snippet) => snippet.context);
  return snippetContexts
    .map((context) => ({
      context,
      snippets: grouped[context] || [],
    }))
    .filter((group) => group.snippets.length > 0);
}

export function isSnippetContext(context: string): context is SnippetContext {
  return snippetContexts.includes(context as SnippetContext);
}
