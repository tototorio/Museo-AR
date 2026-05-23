
// src/routes/assets.ts
import { Hono } from 'hono'
import { db } from '../db/index.js'
import { assets } from '../db/schema.js'
import { processImage, processModel } from '../lib/pipeline.js'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export const assetsRoute = new Hono()

assetsRoute.post('/', async (c) => {
    // parseBody() reads a multipart/form-data request.
    // It returns an object where file fields are File objects (Web API standard).
    const body = await c.req.parseBody()

    // The field name ('file', 'sceneId') must match what your frontend sends.
    const file = body['file']

    // Security: 'instanceof File' checks if we actually got a File
    if (!(file instanceof File)) {
        return c.json({ error: 'No file uploaded' }, 400)
    }

    // file.arrayBuffer() reads the entire file into memory as raw bytes.
    // For large 3D models this could be significant — more on this below.
    const buffer = Buffer.from(await file.arrayBuffer())

    // File size limiter. 50MB at the moment.
    if (buffer.byteLength > MAX_SIZE) {
        return c.json({ error: 'File too large' }, 413)
    }
    
    // Determine the asset type from the MIME type.
    // TO DO: implement a library to detect real format 
    // from the buffer's magic bytes (like file-type) 
    const isModel = file.type === 'model/gltf-binary' || file.name.endsWith('.glb')
    const isImage = file.type.startsWith('image/')

    if (!isModel && !isImage) {
        return c.json({ error: 'Unsupported file type' }, 400)
    }

    // Name definition. UUID usage prevents filename guessing and collisions
    const ext = isModel ? 'glb' : 'webp'
    const filename = `${randomUUID()}.${ext}`
    const outputPath = path.join('./uploads', filename)

    // Makes sure uploads folder exists
    await fs.mkdir('./uploads', { recursive: true })

    let finalSize: number

    if (isModel) {
        // processModel() runs gltf-transform
        const optimized = await processModel(buffer)
        await fs.writeFile(outputPath, optimized)
        finalSize = optimized.byteLength
    } else {
        // processImage() runs Sharp
        const optimized = await processImage(buffer)
        await fs.writeFile(outputPath, optimized)
        finalSize = optimized.byteLength
    }

    // Insert asset record into the database.
    const inserted = await db.insert(assets).values({
        type: isModel ? 'model' : 'image',
        filename,
        originalName: file.name,
        size: finalSize,
    }).returning({ id: assets.id })

    const assetId = inserted[0].id

    // Return the public URL the AR viewer will use to load this asset.
    // TO DO: replace localhost with actual web name
    return c.json({
        id: assetId,
        url: `http://localhost:3000/uploads/${filename}`,
    })
})