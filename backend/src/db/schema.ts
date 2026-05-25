// Schema for the database tables

import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const users = sqliteTable('users', {
    id:           text('id').primaryKey().$defaultFn(createId),
    email:        text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    created_at:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const scenes = sqliteTable('scenes', {
  id:          text('id').primaryKey().$defaultFn(createId),
  userId:      text('user_id').notNull().references(() => users.id),
  name:        text('name').notNull(),
  description: text('description'),
  sceneConfig: text('scene_config').notNull().default('{}'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const assets = sqliteTable('assets', {
  id:           text('id').primaryKey().$defaultFn(createId),
  userId:       text('user_id').notNull().references(() => users.id),
  type:         text('type').notNull(),
  filename:     text('filename').notNull(),
  originalName: text('original_name').notNull(),
  size:         integer('size').notNull(),
  createdAt:    integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const sceneAssets = sqliteTable('scene_assets', {
  sceneId:  text('scene_id').notNull().references(() => scenes.id),
  assetId:  text('asset_id').notNull().references(() => assets.id),
  // Per-asset transforms within a scene.
  // Null until the user sets them in the editor.
  // Stored as A-Frame space-separated strings: "x y z"
  position: text('position'),   // e.g. "0 0 0"
  rotation: text('rotation'),   // e.g. "0 90 0"
  scale:    text('scale'),      // e.g. "0.05 0.05 0.05"
}, (table) => [
  primaryKey({ columns: [table.sceneId, table.assetId] })
])

// Drizzle infers these types from the schema — no need to write them manually.
export type Scene      = typeof scenes.$inferSelect
export type NewScene   = typeof scenes.$inferInsert
export type Asset      = typeof assets.$inferSelect
export type NewAsset   = typeof assets.$inferInsert
export type SceneAsset = typeof sceneAssets.$inferSelect

export const sessions = sqliteTable('sessions', {
  token:      text('token').primaryKey().$defaultFn(createId),
  userId:     text('user_id').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})