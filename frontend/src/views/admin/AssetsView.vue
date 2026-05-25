<!-- src/views/admin/AssetsView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAssets, uploadAsset, renameAsset, deleteAsset } from '@/api/clients'
import type { Asset } from '@/api/clients'

const assets    = ref<Asset[]>([])
const loading   = ref(true)
const error     = ref('')
const uploading = ref(false)

// Rename dialog
const renameDialog  = ref(false)
const renamingAsset = ref<Asset | null>(null)
const renameValue   = ref('')
const renaming      = ref(false)

// Delete dialog
const deleteDialog  = ref(false)
const deletingAsset = ref<Asset | null>(null)
const deleting      = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    assets.value = await getAssets()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Triggered by the hidden file input
async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  uploading.value = true
  error.value = ''

  for (const file of Array.from(input.files)) {
    try {
      await uploadAsset(file)
    } catch (e: any) {
      error.value = `Error subiendo ${file.name}: ${e.message}`
    }
  }

  // Reset input so the same file can be re-uploaded if needed
  input.value = ''
  uploading.value = false
  await load()
}

function openRename(asset: Asset) {
  renamingAsset.value = asset
  renameValue.value   = asset.originalName
  renameDialog.value  = true
}

async function handleRename() {
  if (!renamingAsset.value || !renameValue.value.trim()) return
  renaming.value = true
  try {
    await renameAsset(renamingAsset.value.id, renameValue.value.trim())
    await load()
    renameDialog.value = false
  } catch (e: any) {
    error.value = e.message
  } finally {
    renaming.value = false
  }
}

function openDelete(asset: Asset) {
  deletingAsset.value = asset
  deleteDialog.value  = true
}

async function handleDelete() {
  if (!deletingAsset.value) return
  deleting.value = true
  try {
    await deleteAsset(deletingAsset.value.id)
    await load()
    deleteDialog.value = false
  } catch (e: any) {
    error.value = e.message
  } finally {
    deleting.value = false
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(load)
</script>

<template>
  <v-container>

    <!-- Header row -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Recursos</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Modelos 3D e imágenes de tu biblioteca
        </p>
      </div>
      <v-spacer />

      <!-- Upload button triggers a hidden file input -->
      <v-btn
        color="primary"
        prepend-icon="mdi-upload"
        :loading="uploading"
        @click="($refs.fileInput as HTMLInputElement).click()"
      >
        Subir recurso
      </v-btn>
      <input
        ref="fileInput"
        type="file"
        accept=".glb,image/*"
        multiple
        class="d-none"
        @change="handleUpload"
      />
    </div>

    <!-- Error banner -->
    <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- Upload progress -->
    <v-alert v-if="uploading" type="info" class="mb-4">
      Procesando archivos... esto puede tomar unos segundos.
    </v-alert>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="assets.length === 0"
      class="d-flex flex-column align-center justify-center py-16 text-medium-emphasis"
    >
      <v-icon size="64" class="mb-4">mdi-folder-open-outline</v-icon>
      <p class="text-h6">Sin recursos todavía</p>
      <p class="text-body-2 mt-1">Sube tu primer modelo GLB o imagen</p>
    </div>

    <!-- Grid -->
    <v-row v-else>
      <v-col
        v-for="asset in assets"
        :key="asset.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card rounded="lg" elevation="2">

          <!-- Preview: image renders inline, models show an icon -->
          <v-img
            v-if="asset.type === 'image'"
            :src="asset.url"
            height="160"
            cover
            class="rounded-t-lg"
          />
          <v-sheet
            v-else
            height="160"
            color="surface-variant"
            class="d-flex align-center justify-center rounded-t-lg"
          >
            <v-icon size="48" color="medium-emphasis">mdi-cube-outline</v-icon>
          </v-sheet>

          <v-card-item>
            <v-card-title class="text-body-1 font-weight-medium text-truncate">
              {{ asset.originalName }}
            </v-card-title>
            <v-card-subtitle class="text-caption">
              {{ asset.type === 'model' ? 'Modelo 3D' : 'Imagen' }} ·
              {{ formatSize(asset.size) }}
            </v-card-subtitle>

            <!-- 3-dot menu -->
            <template #append>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" />
                </template>
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-rename-outline"
                    title="Renombrar"
                    @click="openRename(asset)"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-delete-outline"
                    title="Eliminar"
                    class="text-error"
                    @click="openDelete(asset)"
                  />
                </v-list>
              </v-menu>
            </template>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Rename dialog ─────────────────────────────────────────────────── -->
    <v-dialog v-model="renameDialog" max-width="440">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">Renombrar recurso</v-card-title>
        <v-card-text class="px-6">
          <v-text-field
            v-model="renameValue"
            label="Nuevo nombre"
            variant="outlined"
            autofocus
            @keyup.enter="handleRename"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="renameDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="renaming"
            :disabled="!renameValue.trim()"
            @click="handleRename"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete dialog ─────────────────────────────────────────────────── -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">¿Eliminar recurso?</v-card-title>
        <v-card-text class="px-6">
          Se eliminará <strong>{{ deletingAsset?.originalName }}</strong> permanentemente.
          Los modelos ya utilizados en escenas dejarán de funcionar.
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="deleting"
            @click="handleDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>