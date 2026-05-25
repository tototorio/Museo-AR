// src/api/clients.ts
// All fetch calls to the backend. credentials: 'include' is required on every
// call so the browser sends the HttpOnly session cookie automatically.

const BASE = '/api'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Asset {
    id: string
    userId: string
    url: string
    type: 'model' | 'image'
    filename: string
    originalName: string
    size: number
    createdAt: string
}

export interface Scene {
    id: string
    userId: string
    name: string
    description?: string
    assets: Asset[]
    createdAt: string
}

// ─── Helper ──────────────────────────────────────────────────────────────────
// Wraps fetch with credentials and throws a readable error on non-ok responses.

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include', // always send the session cookie
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Request failed: ${res.status}`)
    }

    return res.json()
}

// ─── Assets ──────────────────────────────────────────────────────────────────

// Fetch all assets belonging to the logged-in user.
export async function getAssets(): Promise<Asset[]> {
    return api<Asset[]>('/assets')
}

// Upload a single file to the user's asset library.
// Note: FormData uploads must NOT set Content-Type manually — the browser
// sets it with the correct multipart boundary automatically.
export async function uploadAsset(file: File): Promise<{ id: string; url: string }> {
    const form = new FormData()
    form.append('file', file)

    const res = await fetch(`${BASE}/assets`, {
        method: 'POST',
        credentials: 'include',
        body: form, // no Content-Type header here on purpose
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Upload failed: ${res.status}`)
    }

    return res.json()
}

// Delete an asset from the user's library.
export async function deleteAsset(id: string): Promise<void> {
    await api(`/assets/${id}`, { method: 'DELETE' })
}

// Rename an asset (updates originalName).
export async function renameAsset(id: string, name: string): Promise<void> {
    await api(`/assets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ originalName: name }),
    })
}

// ─── Scenes ──────────────────────────────────────────────────────────────────

// Fetch all scenes belonging to the logged-in user.
export async function getScenes(): Promise<Scene[]> {
    return api<Scene[]>('/scenes')
}

// Fetch a single scene by id (public — used by viewer).
export async function getScene(id: string): Promise<Scene> {
    return api<Scene>(`/scenes/${id}`)
}

// Create a new scene with a name. Assets are added separately in the editor.
export async function createScene(
    name: string
): Promise<{ id: string; qrDataUrl: string; viewerUrl: string }> {
    return api('/scenes', {
        method: 'POST',
        body: JSON.stringify({ name, assetIds: [] }),
    })
}

// Rename a scene.
export async function renameScene(id: string, name: string): Promise<void> {
    await api(`/scenes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    })
}

// Delete a scene.
export async function deleteScene(id: string): Promise<void> {
    await api(`/scenes/${id}`, { method: 'DELETE' })
}

// Open the builder for a scene. Destroys Vue and navigates to the raw HTML editor.
export function openEditor(sceneId: string): void {
    window.location.href = `/builder/${sceneId}`
}