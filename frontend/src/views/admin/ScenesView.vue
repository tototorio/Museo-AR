<!-- src/views/admin/ScenesView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { getScenes, createScene, renameScene, deleteScene, openEditor } from '@/api/clients'
import type { Scene } from '@/api/clients'

const scenes  = ref<Scene[]>([])
const loading = ref(true)
const error   = ref('')

// Create dialog
const createDialog = ref(false)
const newSceneName = ref('')
const creating     = ref(false)

// Rename dialog
const renameDialog  = ref(false)
const renamingScene = ref<Scene | null>(null)
const renameValue   = ref('')
const renaming      = ref(false)

// Delete dialog
const deleteDialog  = ref(false)
const deletingScene = ref<Scene | null>(null)
const deleting      = ref(false)

// QR dialog
const qrDialog      = ref(false)
const qrScene       = ref<Scene | null>(null)
const qrDataUrl     = ref('')
const qrGenerating  = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    scenes.value = await getScenes()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!newSceneName.value.trim()) return
  creating.value = true
  try {
    const { id } = await createScene(newSceneName.value.trim())
    createDialog.value = false
    newSceneName.value = ''
    openEditor(id)
  } catch (e: any) {
    error.value = e.message
  } finally {
    creating.value = false
  }
}

function openRename(scene: Scene) {
  renamingScene.value = scene
  renameValue.value   = scene.name
  renameDialog.value  = true
}

async function handleRename() {
  if (!renamingScene.value || !renameValue.value.trim()) return
  renaming.value = true
  try {
    await renameScene(renamingScene.value.id, renameValue.value.trim())
    await load()
    renameDialog.value = false
  } catch (e: any) {
    error.value = e.message
  } finally {
    renaming.value = false
  }
}

function openDelete(scene: Scene) {
  deletingScene.value = scene
  deleteDialog.value  = true
}

async function handleDelete() {
  if (!deletingScene.value) return
  deleting.value = true
  try {
    await deleteScene(deletingScene.value.id)
    await load()
    deleteDialog.value = false
  } catch (e: any) {
    error.value = e.message
  } finally {
    deleting.value = false
  }
}

// Builds the viewer URL using the real origin so it works in any environment
function viewerUrl(sceneId: string): string {
  return `${window.location.origin}/viewer/${sceneId}`
}

async function openQr(scene: Scene) {
  qrScene.value     = scene
  qrDataUrl.value   = ''
  qrDialog.value    = true
  qrGenerating.value = true
  try {
    qrDataUrl.value = await QRCode.toDataURL(viewerUrl(scene.id), {
      errorCorrectionLevel: 'H', // highest: survives damage, good for physical prints
      margin: 2,
      width: 800,                // large enough for clean printing and 3D printing
    })
  } catch (e: any) {
    error.value = e.message
    qrDialog.value = false
  } finally {
    qrGenerating.value = false
  }
}

function downloadQr() {
  if (!qrDataUrl.value || !qrScene.value) return
  const a = document.createElement('a')
  a.href     = qrDataUrl.value
  a.download = `qr-${qrScene.value.name}.png`
  a.click()
}

function printQr() {
  if (!qrDataUrl.value || !qrScene.value) return
  const win = window.open('', '_blank')!
  win.document.write(`
    <html>
      <head>
        <title>QR - ${qrScene.value.name}</title>
        <style>
          body {
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: sans-serif;
          }
          img { width: 400px; height: 400px; }
          p { margin-top: 16px; font-size: 14px; color: #555; }
        </style>
      </head>
      <body>
        <img src="${qrDataUrl.value}" />
        <p>${qrScene.value.name}</p>
        <p style="font-size:11px">${viewerUrl(qrScene.value.id)}</p>
        <script>window.onload = () => { window.print(); window.close() }<\/script>
      </body>
    </html>
  `)
  win.document.close()
}

onMounted(load)
</script>

<template>
  <v-container>

    <!-- Header row -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Escenas</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Administra tus escenas de realidad aumentada
        </p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createDialog = true">
        Nueva escena
      </v-btn>
    </div>

    <!-- Error banner -->
    <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="scenes.length === 0"
      class="d-flex flex-column align-center justify-center py-16 text-medium-emphasis"
    >
      <v-icon size="64" class="mb-4">mdi-image-multiple-outline</v-icon>
      <p class="text-h6">Sin escenas todavía</p>
      <p class="text-body-2 mt-1">Crea tu primera escena para comenzar</p>
    </div>

    <!-- Grid -->
    <v-row v-else>
      <v-col
        v-for="scene in scenes"
        :key="scene.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card rounded="lg" elevation="2">

          <v-sheet
            height="160"
            color="surface-variant"
            class="d-flex align-center justify-center"
            rounded="t-lg"
          >
            <v-icon size="48" color="medium-emphasis">mdi-cube-scan</v-icon>
          </v-sheet>

          <v-card-item>
            <v-card-title class="text-body-1 font-weight-medium">
              {{ scene.name }}
            </v-card-title>
            <v-card-subtitle class="text-caption">
              {{ scene.assets?.length ?? 0 }} recurso(s) ·
              {{ new Date(scene.createdAt).toLocaleDateString('es-CL') }}
            </v-card-subtitle>

            <template #append>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" />
                </template>
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-pencil-outline"
                    title="Editar"
                    @click="openEditor(scene.id)"
                  />
                  <v-list-item
                    prepend-icon="mdi-rename-outline"
                    title="Renombrar"
                    @click="openRename(scene)"
                  />
                  <v-list-item
                    prepend-icon="mdi-qrcode"
                    title="Ver QR"
                    @click="openQr(scene)"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-delete-outline"
                    title="Eliminar"
                    class="text-error"
                    @click="openDelete(scene)"
                  />
                </v-list>
              </v-menu>
            </template>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── QR dialog ─────────────────────────────────────────────────────── -->
    <v-dialog v-model="qrDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">
          Código QR — {{ qrScene?.name }}
        </v-card-title>
        <v-card-text class="px-6 d-flex flex-column align-center">

          <v-progress-circular v-if="qrGenerating" indeterminate color="primary" class="my-8" />

          <template v-else>
            <img :src="qrDataUrl" width="280" height="280" />
            <p class="text-caption text-medium-emphasis mt-3 text-center">
              {{ viewerUrl(qrScene!.id) }}
            </p>
          </template>

        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-btn
            prepend-icon="mdi-printer"
            variant="tonal"
            :disabled="qrGenerating"
            @click="printQr"
          >
            Imprimir
          </v-btn>
          <v-btn
            prepend-icon="mdi-download"
            variant="tonal"
            :disabled="qrGenerating"
            @click="downloadQr"
          >
            Descargar
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="qrDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Create dialog ─────────────────────────────────────────────────── -->
    <v-dialog v-model="createDialog" max-width="440">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">Nueva escena</v-card-title>
        <v-card-text class="px-6">
          <v-text-field
            v-model="newSceneName"
            label="Nombre de la escena"
            variant="outlined"
            autofocus
            @keyup.enter="handleCreate"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="creating"
            :disabled="!newSceneName.trim()"
            @click="handleCreate"
          >
            Crear e ir al editor
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Rename dialog ─────────────────────────────────────────────────── -->
    <v-dialog v-model="renameDialog" max-width="440">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">Renombrar escena</v-card-title>
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
        <v-card-title class="pt-5 px-6">¿Eliminar escena?</v-card-title>
        <v-card-text class="px-6">
          Se eliminará <strong>{{ deletingScene?.name }}</strong> permanentemente.
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="handleDelete">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>