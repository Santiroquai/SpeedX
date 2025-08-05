<template>
  <div class="min-h-screen bg-[#0e0e0e] font-inter flex flex-col items-center py-16 px-4 text-white">
    <!-- Título -->
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold tracking-wide mb-2">Prueba de Velocidad</h1>
      <p class="text-gray-400 text-md">Medí tu conexión a Internet al instante</p>
    </div>

    <!-- Medidor -->
    <div class="w-full max-w-md bg-[#1c1c1e] rounded-xl ring-1 ring-gray-700/50 shadow-lg p-8 mb-8">
      <Speedometer
        :speed="currentTest === 'download' ? downloadSpeed : uploadSpeed"
        :max-speed="500"
        :label="currentLabel"
        :is-upload="currentTest === 'upload'"
      />

      <button
        @click="startTest"
        :disabled="testing"
        class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-7 tracking-wide"
      >
        <span v-if="testing" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ currentAction }}
        </span>
        <span v-else>INICIAR PRUEBA</span>
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="showResults" class="w-full max-w-md bg-[#1c1c1e] rounded-xl ring-1 ring-gray-700/50 shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <!-- Descarga -->
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mr-4 shadow-inner">
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div>
            <div class="text-sm text-gray-400">Descarga</div>
            <div class="text-2xl font-bold text-white">{{ downloadSpeed }} Mbps</div>
          </div>
        </div>

        <!-- Subida -->
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mr-4 shadow-inner">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div>
            <div class="text-sm text-gray-400">Subida</div>
            <div class="text-2xl font-bold text-white">{{ uploadSpeed }} Mbps</div>
          </div>
        </div>
      </div>

      <!-- Detalles técnicos -->
      <div class="pt-4 border-t border-gray-700 text-center text-sm text-gray-500 space-y-1">
        <p>Ping: {{ ping }} ms</p>
        <p>Proveedor: {{ provider }}</p>
        <p>IP: {{ ipAddress }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue'
import Speedometer from './Speedometer.vue'

const provider = 'Iplan'
const ipAddress = '152.169.135.120'
const ping = ref(0)

const downloadSpeed = ref(0)
const uploadSpeed = ref(0)
const testing = ref(false)
const currentTest = ref(null)
const currentLabel = ref('Presioná INICIAR PRUEBA')
let animationFrame = null

const showResults = computed(() => !testing.value && downloadSpeed.value > 0 && uploadSpeed.value > 0)

const currentAction = computed(() => {
  if (currentTest.value === 'download') return 'Midiendo descarga...'
  if (currentTest.value === 'upload') return 'Midiendo subida...'
  return 'Probando...'
})

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})

function animateSpeed(targetRef, targetValue, duration = 3000) {
  return new Promise((resolve) => {
    const startValue = targetRef.value
    const startTime = performance.now()
    function updateSpeed(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      targetRef.value = +(startValue + (targetValue - startValue) * progress).toFixed(2)
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateSpeed)
      } else {
        targetRef.value = targetValue
        resolve()
      }
    }
    animationFrame = requestAnimationFrame(updateSpeed)
  })
}

async function startTest() {
  try {
    testing.value = true
    currentLabel.value = 'Conectando...'
    ping.value = Math.floor(Math.random() * 30) + 5
    await new Promise(resolve => setTimeout(resolve, 800))

    currentTest.value = 'download'
    currentLabel.value = 'Midiendo descarga...'
    downloadSpeed.value = 0
    const downloadTarget = 50 + Math.floor(Math.random() * 150)
    await animateSpeed(downloadSpeed, downloadTarget)

    await new Promise(resolve => setTimeout(resolve, 1000))

    currentTest.value = 'upload'
    currentLabel.value = 'Midiendo subida...'
    uploadSpeed.value = 0
    const uploadTarget = 5 + Math.floor(Math.random() * 45)
    await animateSpeed(uploadSpeed, uploadTarget)

    currentLabel.value = 'Prueba completada'
  } catch (error) {
    console.error('Error:', error)
    currentLabel.value = 'Error en la prueba'
  } finally {
    testing.value = false
    currentTest.value = null
  }
}
</script>

<style scoped>
@import url('https://rsms.me/inter/inter.css');
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
