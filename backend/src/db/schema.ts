// Schema for the database tables

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
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
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const sessions = sqliteTable('sessions', {
  token:       text('token').primaryKey().$defaultFn(createId),
  userId:      text('user_id').notNull(),
  created_at:  integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})