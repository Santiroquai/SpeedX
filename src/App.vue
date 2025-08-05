<script setup>
import { ref } from 'vue'
import { useSpeedtest } from './composables/useSpeedtest.js'
import Speedometer from './components/Speedometer.vue'

const { downloadSpeed, iniciarTest } = useSpeedtest()
</script>

<template>
  <section class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <Speedometer
      :speed="downloadSpeed"
      label="Descarga"
      :isUpload="false"
    />
    <button
      @click="iniciarTest"
      class="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Iniciar Test
    </button>
  </section>
</template>
