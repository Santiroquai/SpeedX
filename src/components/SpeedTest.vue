<template>
  <div class="min-h-screen w-full font-inter flex flex-col items-center py-16 px-4 text-white bg-gradient-to-br from-[#1f1f43] via-[#21213c] to-[#1a458a]">
    <!-- Fondo animado -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="w-[120vw] h-[120vw] bg-gradient-radial from-blue-700/30 via-purple-700/20 to-transparent rounded-full blur-3xl opacity-60 animate-[pulse-slow_6s_ease-in-out_infinite] absolute -top-1/3 -left-1/4"></div>
      <div class="w-[80vw] h-[80vw] bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-2xl opacity-40 animate-[pulse-slower_12s_ease-in-out_infinite] absolute -bottom-1/4 -right-1/4"></div>
    </div>
    
    <!-- Contenido principal -->
    <div class="relative z-10 w-full max-w-2xl flex flex-col items-center">
      <!-- Título -->
      <div class="text-center mb-5">
        <div class="relative inline-block animate-title">
          <img 
            src="../assets/img/SX.svg" 
            alt="SpeedX Logo"
            class="w-55 h-auto"
            style="display: block;"
          />
          <span class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-full origin-left scale-x-0 animate-line-expand"></span>
        </div>
        <p class="text-white text-xs animate-fade-in">Mide tu conexión al instante</p>
      </div>

      <!-- Contenedor del velocímetro -->
      <div class="mb-10 w-full flex justify-center">
        <Speedometer 
          :speed="displayedSpeed" 
          :label="speedometerLabel" 
          :is-upload="isUploadPhase"
          :show-label="isTesting" 
        />
      </div>
      
      <!-- Botón de acción -->
      <button 
        class="px-6 py-3 mb-14 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-full font-bold text-white text-md shadow-lg transition-all duration-200 transform hover:scale-102 animate-[custom-bounce_1.4s_infinite]" 
        style="--bounce-height: -8%;"
        @click="startTest" 
        :disabled="isTesting"
      >
        <span class="inline-flex items-center gap-3">
          {{ isTesting ? 'Midiendo...' : 'Iniciar prueba' }}
        </span>
      </button>
      
      <!-- Resultados -->
      <div class="w-full max-w-md space-y-4">
        <!-- Mensaje de error -->
        <div v-if="error" class="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-300 text-center">
          {{ error }}
        </div>
        
        <!-- Resultado Descarga -->
        <div v-if="downloadSpeed !== null" class="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 transition-all duration-500">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span class="text-gray-300 font-medium">DESCARGA</span>
            </div>
            <span class="text-2xl font-bold text-green-400">
              {{ downloadSpeed.toFixed(2) }} <span class="text-sm text-green-300/80">Mbps</span>
            </span>
          </div>
          <div class="w-full bg-gray-700/30 h-1.5 rounded-full overflow-hidden">
            <div 
              class="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-1000 ease-out" 
              :style="{ width: downloadProgress + '%' }"
            ></div>
          </div>
        </div>
        
        <!-- Resultado Subida -->
        <div v-if="uploadSpeed !== null" class="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 transition-all duration-500">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
              <span class="text-gray-300 font-medium">SUBIDA</span>
              <span class="text-xs text-gray-400/80 bg-gray-800/50 px-2 py-0.5 rounded-full">simulada</span>
            </div>
            <span class="text-2xl font-bold text-purple-400">
              {{ uploadSpeed.toFixed(2) }} <span class="text-sm text-purple-300/80">Mbps</span>
            </span>
          </div>
          <div class="w-full bg-gray-700/30 h-1.5 rounded-full overflow-hidden">
            <div 
              class="bg-gradient-to-r from-purple-400 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out" 
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>
        
        <!-- Nota -->
        <div v-if="uploadSpeed !== null" class="text-xs text-center text-gray-400/60 mt-2">
          Nota: La velocidad de subida es simulada.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Speedometer from './Speedometer.vue'

// Variables reactivas
const displayedSpeed = ref(0)
const isUploadPhase = ref(false)
const isTesting = ref(false)
const downloadSpeed = ref(null)
const uploadSpeed = ref(null)
const error = ref('')
const downloadProgress = ref(0)
const uploadProgress = ref(0)

// Constantes para mejor proporción visual
const VISUAL_SCALE_FACTOR = 150 
const BASE_DOWNLOAD_SCALE = 300
const BASE_UPLOAD_SCALE = 190


const speedometerLabel = computed(() => {
  if (!isTesting.value) return ''
  return isUploadPhase.value ? 'Subida' : 'Descarga'
})

// Animación de barras
function animateProgress(targetValue, progressRef, duration = 1000) {
  const start = 0
  const startTime = performance.now()
  
  function step(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    progressRef.value = start + (targetValue - start) * progress
    
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  
  requestAnimationFrame(step)
}

// Watchers para animar las barras 
watch(downloadSpeed, (newVal) => {
  if (newVal) {
    const scaledValue = Math.min(newVal, BASE_DOWNLOAD_SCALE) * VISUAL_SCALE_FACTOR
    const maxVisualRange = BASE_DOWNLOAD_SCALE * VISUAL_SCALE_FACTOR
    const targetWidth = Math.min(100, (scaledValue / maxVisualRange) * 100)
    animateProgress(targetWidth, downloadProgress)
  }
})

watch(uploadSpeed, (newVal) => {
  if (newVal) {
    const scaledValue = Math.min(newVal, BASE_UPLOAD_SCALE) * VISUAL_SCALE_FACTOR
    const maxVisualRange = BASE_UPLOAD_SCALE * VISUAL_SCALE_FACTOR
    const targetWidth = Math.min(100, (scaledValue / maxVisualRange) * 100)
    animateProgress(targetWidth, uploadProgress)
  }
})

// Animación del velocímetro
function animateSpeed(target) {
  const duration = 800
  const start = displayedSpeed.value
  const diff = target - start
  const startTime = performance.now()
  
  function step(now) {
    const elapsed = now - startTime
    if (elapsed < duration) {
      displayedSpeed.value = start + diff * (elapsed / duration)
      requestAnimationFrame(step)
    } else {
      displayedSpeed.value = target
    }
  }
  requestAnimationFrame(step)
}

// Lógica principal
async function startTest() {
  error.value = ''
  downloadSpeed.value = null
  uploadSpeed.value = null
  downloadProgress.value = 0
  uploadProgress.value = 0
  isTesting.value = true
  isUploadPhase.value = false
  displayedSpeed.value = 0

  try {
    // Fase de descarga
    const testFileUrl = 'https://speed.cloudflare.com/__down?bytes=10000000'
    const start = performance.now()
    const response = await fetch(testFileUrl, { cache: 'no-store' })
    const reader = response.body.getReader()
    let received = 0
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.length
    }
    
    const end = performance.now()
    const speedMbps = ((received * 8) / 1_000_000) / ((end - start) / 1000)
    downloadSpeed.value = speedMbps
    animateSpeed(speedMbps)
    
    await new Promise(r => setTimeout(r, 2000))
    
    // Fase de subida (simulada)
    isUploadPhase.value = true
    displayedSpeed.value = 0
    await new Promise(r => setTimeout(r, 1000))
    
    const simulatedUpload = Math.random() * (90 - 8) + 8
    uploadSpeed.value = simulatedUpload
    animateSpeed(simulatedUpload)
    
    await new Promise(r => setTimeout(r, 2000))
    
  } catch (e) {
    console.error('Error:', e)
    error.value = 'Error al medir la velocidad'
  } finally {
    isTesting.value = false
    isUploadPhase.value = false
  }
}
</script>

<style>
/* Animaciones */
.animate-title {
  animation: titleEntrance 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes titleEntrance {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-line-expand {
  animation: lineExpand 1s cubic-bezier(0.65, 0, 0.35, 1) 0.3s forwards;
}

@keyframes lineExpand {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out 0.6s forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>