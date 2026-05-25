import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'
import { rateLimiter } from 'hono-rate-limiter'
import { cors } from 'hono/cors'
import { readFile } from 'fs/promises'
import { join } from 'path'

import auth from './routes/auth.js'
import { scenesRoute } from './routes/scenes.js'
import { assetsRoute } from './routes/assets.js'

const app = new Hono()

// ─── Global middleware ───────────────────────────────────────────────────────
app.use('*', logger())
app.use('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

// ─── Rate limiter on the public scene API only ───────────────────────────────
// This is the expensive call — it fetches scene data and asset URLs.
// All other /api/scenes routes require auth so they're already protected.
app.use('/api/scenes/:id', rateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  limit: 30,            // 30 requests per IP per minute
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
  handler: (c) => c.json({ error: 'Too many requests' }, 429)
}))

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/uploads/*', serveStatic({ root: './' }))

app.route('/api/auth', auth)
app.route('/api/scenes', scenesRoute)
app.route('/api/assets', assetsRoute)

// ─── Raw HTML pages ──────────────────────────────────────────────────────────
app.get('/viewer/:id', async (c) => {
  const html = await readFile(join(process.cwd(), 'public/viewer.html'), 'utf-8')
  return c.html(html)
})

app.get('/builder/:id', async (c) => {
  const html = await readFile(join(process.cwd(), 'public/editor.html'), 'utf-8')
  return c.html(html)
})

// ─── Frontend fallback ───────────────────────────────────────────────────────
app.use('/*', serveStatic({ root: './dist' }))

serve({ fetch: app.fetch, port: 3000 })
console.log('running on localhost:3000')