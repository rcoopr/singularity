import { defineProxyService } from '@webext-core/proxy-service';
import { IDBPDatabase } from 'idb';
import { nanoid } from 'nanoid';
import type { SetOptional } from 'type-fest';
import groupBy from 'object.groupby';
import { getUpdateContextMenuRepo } from '@/utils/context-menus/repo';

export type SnippetsRepo = {
  createOrUpdate(snippet: SnippetInput): Promise<Snippet | undefined>;
  update(id: Snippet['id'], snippet: SnippetUpdate): Promise<Snippet | undefined>;
  delete(id: Snippet['id']): Promise<void>;
  getOne(id: Snippet['id']): Promise<Snippet>;
  getAll(): Promise<Snippet[]>;
};

export type Snippet = {
  id: string;
  name: string;
  context: SnippetContext;
  code: string;
  desc?: string;
  lang: 'javascript' | 'typescript' | 'html';
  favourite: boolean;
  createdAt: number;
  updatedAt?: number;
};
export type SnippetInput = SetOptional<
  Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>,
  'favourite' | 'lang'
>;
export type SnippetUpdate = Partial<Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>>;

function createSnippetsRepo(db: Promise<IDBPDatabase>): SnippetsRepo {
  return {
    async createOrUpdate(snippet) {
      const id = nanoid();
      const snippetWithDefaults = {
        ...snippet,
        code: snippet.code.trim(),
        id,
        createdAt: Date.now(),
        favourite: snippet.favourite === undefined ? true : !!snippet.favourite,
        lang: snippet.lang || 'javascript',
      };

      try {
        await (await db).put('snippets', snippetWithDefaults);
      } catch (e) {
        log.warn('Failed to add snippet', e);
        return;
      }

      log.debug('Snippet added:', snippetWithDefaults);
      const updateContextMenu = getUpdateContextMenuRepo();
      updateContextMenu.update();
      // void backgroundMessenger.sendMessage('snippetAdded', snippetWithDefaults);
      return snippetWithDefaults;
    },
    async update(id, properties) {
      let snippet: Snippet | undefined = undefined;
      try {
        snippet = await (await db).get('snippets', id);
      } catch (e) {
        log.warn(`Failed to update snippet (Couldn't access snippet)`);
        return;
      }
      if (!snippet) {
        log.warn(`Failed to update snippet (Couldn't retrieve snippet)`);
        return;
      }

      const updatedSnippet = {
        ...snippet,
        ...properties,
        updatedAt: Date.now(),
      };
      updatedSnippet.code = updatedSnippet.code.trim();

      try {
        await (await db).put('snippets', updatedSnippet);
      } catch (e) {
        log.warn(`Failed to update snippet (Couldn't update snippet)`, e);
        return;
      }

      log.debug('Snippet updated:', updatedSnippet);
      const updateContextMenu = getUpdateContextMenuRepo();
      updateContextMenu.update();
      // void backgroundMessenger.sendMessage('snippetUpdated', updatedSnippet);
      return updatedSnippet;
    },
    async delete(id) {
      try {
        await (await db).delete('snippets', id);
      } catch (e) {
        log.warn(`Failed to delete snippet`, e);
        return;
      }

      log.debug('Snippet deleted:', id);
      const updateContextMenu = getUpdateContextMenuRepo();
      updateContextMenu.update();
      // void backgroundMessenger.sendMessage('snippetDeleted', { id });
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
      snippets:
        grouped[context]?.sort(
          (a, b) => Number(b.favourite) - Number(a.favourite) || a.name.localeCompare(b.name)
        ) || [],
    }))
    .filter((group) => group.snippets.length > 0);
}

export function isSnippetContext(context: string): context is SnippetContext {
  return snippetContexts.includes(context as SnippetContext);
}

export function isValidLang(lang: string): lang is Snippet['lang'] {
  return ['javascript', 'typescript', 'html'].includes(lang);
}
