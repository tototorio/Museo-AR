// src/routes/assets.ts
import { Hono } from 'hono'
import { eq, notInArray, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { assets, sceneAssets } from '../db/schema.js'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { processImage, processModel } from '../lib/pipeline.js'
import { requireAuth } from '../lib/requireAuth.js'
import type { AppVariables } from '../lib/types.js'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export const assetsRoute = new Hono<{ Variables: AppVariables }>()
assetsRoute.use('*', requireAuth)

// ─── GET / ──────────────────────────────────────────────────────────────────
// List all assets. Optional query param: ?excludeScene=sceneId
// When excludeScene is provided, assets already linked to that scene
// are filtered out — used by the editor's "add asset" tab.
assetsRoute.get('/', async (c) => {
  const user = c.get('user')
  const excludeScene = c.req.query('excludeScene')

  if (excludeScene) {
    // Find asset IDs already in this scene
    const linked = await db
      .select({ assetId: sceneAssets.assetId })
      .from(sceneAssets)
      .where(eq(sceneAssets.sceneId, excludeScene))

    const linkedIds = linked.map(r => r.assetId)

    // If all assets are linked, notInArray with empty array would
    // return nothing — handle that edge case explicitly.
    if (linkedIds.length === 0) {
      const all = await db.select().from(assets).where(eq(assets.userId, user.id))
      return c.json(all.map(a => ({
        ...a,
        url: `http://localhost:3000/uploads/${a.filename}`
      })))
    }

    const available = await db
      .select()
      .from(assets)
      .where(and(notInArray(assets.id, linkedIds), eq(assets.userId, user.id)))

    return c.json(available.map(a => ({
      ...a,
      url: `http://localhost:3000/uploads/${a.filename}`
    })))
  }

  // No filter — return all assets
  const all = await db.select().from(assets).where(eq(assets.userId, user.id))
  return c.json(all.map(a => ({
    ...a,
    url: `http://localhost:3000/uploads/${a.filename}`
  })))
})

// ─── POST / ─────────────────────────────────────────────────────────────────
// Upload and process a new asset (image or GLB model).
assetsRoute.post('/', async (c) => {
  const user = c.get('user')
  const body = await c.req.parseBody()
  const file = body['file']

  if (!(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400)
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (buffer.byteLength > MAX_SIZE) {
    return c.json({ error: 'File too large' }, 413)
  }

  const isModel = file.type === 'model/gltf-binary' || file.name.endsWith('.glb')
  const isImage = file.type.startsWith('image/')

  if (!isModel && !isImage) {
    return c.json({ error: 'Unsupported file type' }, 400)
  }

  const ext = isModel ? 'glb' : 'webp'
  const filename = `${randomUUID()}.${ext}`
  const outputPath = path.join('./uploads', filename)

  await fs.mkdir('./uploads', { recursive: true })

  let finalSize: number

  if (isModel) {
    const optimized = await processModel(buffer)
    await fs.writeFile(outputPath, optimized)
    finalSize = optimized.byteLength
  } else {
    const optimized = await processImage(buffer)
    await fs.writeFile(outputPath, optimized)
    finalSize = optimized.byteLength
  }

  const inserted = await db.insert(assets).values({
    userId: user.id,
    type: isModel ? 'model' : 'image',
    filename,
    originalName: file.name,
    size: finalSize,
  }).returning({ id: assets.id })

  const assetId = inserted[0].id

  return c.json({
    id: assetId,
    url: `http://localhost:3000/uploads/${filename}`,
  })
})