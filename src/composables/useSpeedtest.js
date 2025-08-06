import { ref } from 'vue'

export function useSpeedtest() {
  const downloadSpeed = ref(0)
  const isRunning = ref(false)
  const error = ref(null)

  function iniciarTest() {
    // Chequeo de disponibilidad
    if (!window.Speedtest) {
      error.value = 'Speedtest no está disponible. Verificá que el script esté bien cargado.'
      console.error(error.value)
      return
    }

    isRunning.value = true
    error.value = null
    downloadSpeed.value = 0

    const s = new window.Speedtest()
    s.setParameter("workerFile", "/speedtest-worker-proxy.js")


    s.onupdate = data => {
      downloadSpeed.value = parseFloat(data.dl.toFixed(2)) // Mbps con 2 decimales
    }

    s.onend = () => {
      isRunning.value = false
      console.log('Test finalizado')
    }

    s.onerror = e => {
      error.value = `Error durante el test: ${e?.message || e}`
      isRunning.value = false
      console.error(error.value)
    }

    s.start()
  }

  return {
    downloadSpeed,
    isRunning,
    error,
    iniciarTest
  }
}
