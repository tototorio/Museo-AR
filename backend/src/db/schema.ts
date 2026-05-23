// Schema for the database tables

import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const users = sqliteTable('users', {
    id:           text('id').primaryKey().$defaultFn(createId),
    email:        text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    created_at:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const scenes = sqliteTable('scenes', {
  id:          text('id').primaryKey().$defaultFn(createId),
  name:        text('name').notNull(),
  description: text('description'),
  // Stores the scene's configuration as a JSON string. Serialized and deserialized by route handlers
  sceneConfig: text('scene_config').notNull().default('{}'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const assets = sqliteTable ('assets', {
  id:           text('id').primaryKey().$defaultFn(createId),
  type:         text('type').notNull(),
  filename:     text('filename').notNull(),
  originalName: text('original_name').notNull(),
  size:         integer('size').notNull(),
  createdAt:    integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
})

export const sceneAssets = sqliteTable('scene_assets', {
  sceneId: text('scene_id').notNull().references(() => scenes.id),
  assetId: text('asset_id').notNull().references(() => assets.id),
}, (table) => [
  primaryKey({ columns: [table.sceneId, table.assetId] })
])


// Exporting the types lets you use them in route handlers for type safety.
// Drizzle infers these from the schema — you don't write them manually.
export type Scene = typeof scenes.$inferSelect
export type NewScene = typeof scenes.$inferInsert
export type Asset = typeof assets.$inferSelect
export type NewAsset = typeof assets.$inferInsert
export type SceneAsset = typeof sceneAssets.$inferSelect

export const sessions = sqliteTable('sessions', {
  token:       text('token').primaryKey().$defaultFn(createId),
  userId:      text('user_id').notNull(),
  created_at:  integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})