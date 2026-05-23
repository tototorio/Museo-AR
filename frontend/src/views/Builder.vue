<script setup lang="ts">
import { ref } from 'vue'
import { uploadAsset, createScene } from '../api/clients.ts'

const sceneName = ref('')
const uploadedAssets = ref<Array<{ id: string, url: string, type: string }>>([])
const isUploading = ref(false)
const isCreating = ref(false)
const qrDataUrl = ref('')
const error = ref('')

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  isUploading.value = true
  error.value = ''

  for (const file of Array.from(input.files)) {
    try {
      const data = await uploadAsset(file)
      // Detect type from the filename since the backend doesn't return it
      const type = file.name.endsWith('.glb') ? 'model' : 'image'
      uploadedAssets.value.push({ id: data.id, url: data.url, type })
    } catch (e) {
      error.value = `Failed to upload ${file.name}`
    }
  }

  isUploading.value = false
}

async function handleCreateScene() {
  if (!sceneName.value.trim()) {
    error.value = 'Please enter a scene name'
    return
  }
  if (uploadedAssets.value.length === 0) {
    error.value = 'Please upload at least one asset'
    return
  }

  isCreating.value = true
  error.value = ''

  try {
    const assetIds = uploadedAssets.value.map(a => a.id)
    const data = await createScene(sceneName.value, assetIds)
    qrDataUrl.value = data.qrDataUrl
  } catch (e) {
    error.value = 'Failed to create scene'
  }

  isCreating.value = false
}
</script>

<template>
  <div>
    <h1>Build your AR scene</h1>

    <input v-model="sceneName" placeholder="Scene name" />

    <!--
      accept=".glb,image/*" restricts the file picker to GLB files and images.
      multiple allows uploading several assets at once.
    -->
    <input
      type="file"
      accept=".glb,image/*"
      multiple
      @change="handleFileUpload"
    />

    <div v-if="isUploading">Processing assets...</div>

    <div v-if="error" style="color: red;">{{ error }}</div>

    <!--
      v-for renders a list. The :key attribute must be unique per item —
      Vue uses it to efficiently update only changed items.
    -->
    <div v-for="asset in uploadedAssets" :key="asset.id">
      {{ asset.type }} — {{ asset.url }}
    </div>

    <button @click="handleCreateScene" :disabled="isCreating">
      {{ isCreating ? 'Creating...' : 'Generate QR' }}
    </button>

    <!--
      v-if conditionally renders — qrDataUrl starts as '' which is falsy.
      img src can accept a data URL directly — no network request needed.
    -->
    <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR code for AR scene" />
  </div>
</template>