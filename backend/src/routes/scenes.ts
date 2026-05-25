import { Hono } from 'hono'
import QRCode from 'qrcode'
import { db } from '../db/index.js'
import { scenes, sceneAssets, assets } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../lib/requireAuth.js'
import type { AppVariables } from '../lib/types.js'

export const scenesRoute = new Hono<{ Variables: AppVariables }>()

// ─── Helper ─────────────────────────────────────────────────────────────────
// Fetch a scene and verify it belongs to the requesting user.
// Returns the scene or throws a response directly.
async function getOwnedScene(sceneId: string, userId: string, c: any) {
  const scene = await db.query.scenes.findFirst({
    where: (scenes, { eq }) => eq(scenes.id, sceneId)
  })

  if (!scene) return c.json({ error: 'Not found' }, 404)

  // Someone else's scene — pretend it doesn't exist (don't leak that it does)
  if (scene.userId !== userId) return c.json({ error: 'Not found' }, 404)

  return scene
}

// ─── GET / ──────────────────────────────────────────────────────────────────
// List all scenes belonging to the logged-in user.
scenesRoute.get('/', requireAuth, async (c) => {
  const user = c.get('user')

  const userScenes = await db
    .select()
    .from(scenes)
    .where(eq(scenes.userId, user.id))

  return c.json(userScenes)
})

// ─── GET /:id ───────────────────────────────────────────────────────────────
// PUBLIC — used by viewer.html and editor.html. No auth required.
scenesRoute.get('/:id', async (c) => {
  const id = c.req.param('id')

  const scene = await db.query.scenes.findFirst({
    where: (scenes, { eq }) => eq(scenes.id, id)
  })

  if (!scene) return c.json({ error: 'Not found' }, 404)

  const linkedAssets = await db
    .select({
      id:           assets.id,
      type:         assets.type,
      filename:     assets.filename,
      originalName: assets.originalName,
      size:         assets.size,
      position:     sceneAssets.position,
      rotation:     sceneAssets.rotation,
      scale:        sceneAssets.scale,
    })
    .from(assets)
    .innerJoin(sceneAssets, eq(sceneAssets.assetId, assets.id))
    .where(eq(sceneAssets.sceneId, id))

  return c.json({
    id: scene.id,
    name: scene.name,
    description: scene.description,
    createdAt: scene.createdAt,
    assets: linkedAssets.map(row => ({
      ...row,
      url: `http://localhost:3000/uploads/${row.filename}`
    }))
  })
})

// ─── POST / ─────────────────────────────────────────────────────────────────
// Create a new scene, owned by the logged-in user.
scenesRoute.post('/', requireAuth, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()

  const inserted = await db.insert(scenes).values({
    userId: user.id,
    name: body.name,
    sceneConfig: JSON.stringify(body.config ?? {}),
  }).returning({ id: scenes.id })

  const id = inserted[0].id

  const assetIds: string[] = body.assetIds ?? []
  if (assetIds.length > 0) {
    await db.insert(sceneAssets).values(
      assetIds.map(assetId => ({ sceneId: id, assetId }))
    )
  }

  const viewerUrl = `http://localhost:3000/viewer/${id}`
  const qrDataUrl = await QRCode.toDataURL(viewerUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
  })

  return c.json({ id, qrDataUrl, viewerUrl })
})

// ─── PATCH /:id/assets/:assetId/transform ───────────────────────────────────
// Auth + ownership required.
scenesRoute.patch('/:id/assets/:assetId/transform', requireAuth, async (c) => {
  const user    = c.get('user')
  const sceneId = c.req.param('id')
  const assetId = c.req.param('assetId')
  const body    = await c.req.json()

  const scene = await getOwnedScene(sceneId, user.id, c)
  if (!scene.id) return // getOwnedScene already sent the response

  const existing = await db
    .select()
    .from(sceneAssets)
    .where(and(eq(sceneAssets.sceneId, sceneId), eq(sceneAssets.assetId, assetId)))
    .limit(1)

  if (existing.length === 0) return c.json({ error: 'Scene-asset link not found' }, 404)

  await db
    .update(sceneAssets)
    .set({ position: body.position, rotation: body.rotation, scale: body.scale })
    .where(and(eq(sceneAssets.sceneId, sceneId), eq(sceneAssets.assetId, assetId)))

  return c.json({ ok: true })
})

// ─── POST /:id/assets ────────────────────────────────────────────────────────
// Auth + ownership required.
scenesRoute.post('/:id/assets', requireAuth, async (c) => {
  const user    = c.get('user')
  const sceneId = c.req.param('id')
  const body    = await c.req.json()

  const scene = await getOwnedScene(sceneId, user.id, c)
  if (!scene.id) return

  if (!body.assetId) return c.json({ error: 'assetId required' }, 400)

  await db.insert(sceneAssets).values({ sceneId, assetId: body.assetId })

  const asset = await db.query.assets.findFirst({
    where: (assets, { eq }) => eq(assets.id, body.assetId)
  })

  return c.json({
    ...asset,
    url: `http://localhost:3000/uploads/${asset!.filename}`,
    position: null,
    rotation: null,
    scale: null,
  })
})

// ─── DELETE /:id/assets/:assetId ─────────────────────────────────────────────
// Auth + ownership required.
scenesRoute.delete('/:id/assets/:assetId', requireAuth, async (c) => {
  const user    = c.get('user')
  const sceneId = c.req.param('id')
  const assetId = c.req.param('assetId')

  const scene = await getOwnedScene(sceneId, user.id, c)
  if (!scene.id) return

  await db
    .delete(sceneAssets)
    .where(and(eq(sceneAssets.sceneId, sceneId), eq(sceneAssets.assetId, assetId)))

  return c.json({ ok: true })
})