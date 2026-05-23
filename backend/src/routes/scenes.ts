import { Hono } from 'hono'
import QRCode from 'qrcode'
import { db } from '../db/index.js'
import { scenes, sceneAssets, assets } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export const scenesRoute = new Hono()

scenesRoute.post('/', async (c) => {
  const body = await c.req.json()

  const inserted = await db.insert(scenes).values({
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

  // Points to the backend viewer, not the Vue frontend
  const viewerUrl = `http://localhost:3000/ar/${id}`

  const qrDataUrl = await QRCode.toDataURL(viewerUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
  })

  return c.json({ id, qrDataUrl, viewerUrl })
})

scenesRoute.get('/:id', async (c) => {
  const id = c.req.param('id')

  const scene = await db.query.scenes.findFirst({
    where: (scenes, { eq }) => eq(scenes.id, id)
  })

  if (!scene) return c.json({ error: 'Not found' }, 404)

  const linkedAssets = await db
    .select()
    .from(assets)
    .innerJoin(sceneAssets, eq(sceneAssets.assetId, assets.id))
    .where(eq(sceneAssets.sceneId, id))

  return c.json({
    ...scene,
    sceneConfig: JSON.parse(scene.sceneConfig),
    assets: linkedAssets.map(row => ({
      ...row.assets,
      url: `http://localhost:3000/uploads/${row.assets.filename}`
    }))
  })
})