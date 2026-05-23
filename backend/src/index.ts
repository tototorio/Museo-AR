import { Hono } from 'hono'
import { serve } from '@hono/node-server' 
import { serveStatic } from '@hono/node-server/serve-static' 
import { logger } from 'hono/logger' 
import { cors } from 'hono/cors'
import { readFile } from 'fs/promises'
import { join } from 'path'

import auth from './routes/auth.js'
import { scenesRoute } from './routes/scenes.js'
import { assetsRoute } from './routes/assets.js'

//import { uploadRoutes } from './routes/upload.ts' 
//import { sceneRoutes } from './routes/scenes.ts' 
//import { qrRoutes } from './routes/qr.ts'

const app = new Hono()

// middleware — runs on every request 
app.use('*', logger()) 
app.use('*', cors({
  origin: 'http://localhost:5173', 
  credentials: true,               
}));

// We make uploads folder accesible through HTTP.
// Will be used to both store and fetch assets
app.use('/uploads/*', serveStatic({ root: './'}))

// Scene routes
app.route('/api/scenes', scenesRoute)
// Asset routes
app.route('/api/assets', assetsRoute)
// API routes 
app.route('/api/auth', auth)

app.get('/ar/:id', async (c) => {
  const html = await readFile(join(process.cwd(), 'public/viewer.html'), 'utf-8')
  return c.html(html)
})

// Frontend 
app.use('/*', serveStatic({ root: './dist' }))


serve({ fetch: app.fetch, port: 3000 }) 
console.log('running on localhost:3000') 
