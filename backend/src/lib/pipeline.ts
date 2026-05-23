import sharp from 'sharp'
import { NodeIO } from '@gltf-transform/core'
import { KHRMaterialsSpecular } from '@gltf-transform/extensions'
import { draco } from '@gltf-transform/functions'

// processImage takes raw file bytes, returns WebP bytes.
export async function processImage(input: Buffer): Promise<Buffer> {
    return sharp(input)
        // Resize to max 1024px on either dimension.
        // `fit: 'inside'` preserves aspect ratio — it won't stretch or crop.
        // `withoutEnlargement: true` skips upscaling small images.
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        // Convert to WebP. quality 80, ~30% smaller.
        .webp({ quality: 80 })
        // toBuffer() runs the pipeline and returns the result in memory.
        // Alternative: .toFile(path) writes directly to disk.
        .toBuffer()
}

// processModel takes a GLB buffer and returns an optimized GLB buffer.
// GLB is the binary container format for GLTF.
export async function processModel(input: Buffer): Promise<Buffer> {

    // NodeIO is gltf-transform's file reader/writer for Node.js environments.
    const io = new NodeIO().registerExtensions([KHRMaterialsSpecular])

    // readBinary() parses the GLB buffer into an in-memory Document object 
    const document = await io.readBinary(new Uint8Array(input))

    // draco() applies Draco mesh compression. It can reduce mesh size 
    // by 60-80% with no visible quality loss for typical models.
    await document.transform(draco())
    // TO DO: Draco requires the THREE.DRACOLoader on the client side. 
    // Verify this in the A-Frame docs for our version.

    // writeBinary() serializes the Document back to a GLB buffer.
    return Buffer.from(await io.writeBinary(document))
}