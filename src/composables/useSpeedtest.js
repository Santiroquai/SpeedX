import { ref } from 'vue'

export function useSpeedtest() {
  const downloadSpeed = ref(0)

  function iniciarTest() {
    const s = new Speedtest()
    
    s.setParameter("workerFile", "/librespeed/speedtest_worker.js")

    s.onupdate = data => {
      downloadSpeed.value = data.dl // Mbps
    }
    
    s.onend = () => {
      console.log('Test finalizado')
    }

    s.start()
  }

  return {
    downloadSpeed,
    iniciarTest
  }
}
