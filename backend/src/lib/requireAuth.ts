import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { db } from '../db/index.js'
import { sessions, users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { AppVariables } from './types.js'

export type AuthVariables = {
  user: { id: string; email: string }
}

export const requireAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const token = getCookie(c, 'session')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .get()

  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const user = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .get()

  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  c.set('user', user) 
  await next()
})