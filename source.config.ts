import {
  defineCollections,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

const customDocsSchema = frontmatterSchema.extend({
  preview: z.string().optional(),
  index: z.boolean().default(false),
});

const customMetaSchema = metaSchema.extend({
  description: z.string().optional(),
});

/**
 * https://fumadocs.dev/docs/mdx/collections#schema-1
 */
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: customDocsSchema,
  },
  meta: {
    schema: customMetaSchema,
  },
});

/**
 * Changelog
 */
export const changelog = defineCollections({
  type: 'doc',
  dir: 'content/changelog',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().datetime(),
    version: z.string(),
    published: z.boolean().default(true),
  }),
});

/**
 * Pages
 */
export const pages = defineCollections({
  type: 'doc',
  dir: 'content/pages',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().datetime(),
    published: z.boolean().default(true),
  }),
});
