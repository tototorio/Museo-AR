import { Hono } from 'hono'
import { serve } from '@hono/node-server' 
import { serveStatic } from '@hono/node-server/serve-static' 
import { logger } from 'hono/logger' 
import { cors } from 'hono/cors'
import auth from './routes/auth.js'
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

// API routes 
app.route('/api/auth', auth)

// frontend — must be last 
app.use('/*', serveStatic({ root: './dist' }))
serve({ fetch: app.fetch, port: 3000 }) 
console.log('running on localhost:3000') 
