const BASE = '/api'

// --- Types ---

export interface Asset {
    id: string
    url: string
    type: 'model' | 'image'
    filename: string
    originalName: string
    size: number
}

export interface Scene {
    id: string
    name: string
    description?: string
    sceneConfig: Record<string, any>
    assets: Asset[]
    createdAt: Date
}

export interface AuthResponse {
    message?: string
    success?: boolean
}

// --- Assets ---

// Uploads a single file. Returns the generated id and public url.
// Do NOT pass sceneId here — assets are linked to scenes at scene creation time.
export async function uploadAsset(file: File): Promise<{ id: string, url: string }> {
    const form = new FormData()
    form.append('file', file)
    // ⚠️ Do NOT set Content-Type manually — the browser sets it automatically
    // with the correct multipart boundary string. Setting it manually breaks parsing.
    const res = await fetch(`${BASE}/assets`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    return res.json()
}

// --- Scenes ---

// Creates a scene and links the provided asset IDs to it via the join table.
// Returns the scene id, the QR code as a data URL, and the viewer URL.
export async function createScene(
    name: string,
    assetIds: string[]
): Promise<{ id: string, qrDataUrl: string, viewerUrl: string }> {
    const res = await fetch(`${BASE}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, assetIds })
    })
    if (!res.ok) throw new Error(`Failed to create scene: ${res.status}`)
    return res.json()
}

// Fetches a single scene by id, including its linked assets.
// Used by Viewer.vue after scanning the QR code.
export async function getScene(id: string): Promise<Scene> {
    const res = await fetch(`${BASE}/scenes/${id}`)
    if (!res.ok) throw new Error('Scene not found')
    return res.json()
}

// --- Auth ---

export async function register(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error('Registration failed')
    return res.json()
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error('Login failed')
    return res.json()
}