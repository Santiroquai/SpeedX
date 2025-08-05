<template>
  <!-- Contenedor principal del velocímetro -->
  <div class="flex flex-col items-center">
    
    <!-- SVG del velocímetro (zona visual del dial, arco, aguja, números) -->
    <div class="relative w-80 h-80 overflow-visible">
      <svg width="100%" height="100%" viewBox="-20 -20 360 360">
        
        <!-- Arco base gris oscuro: el fondo del dial -->
        <!-- "filter"  sombra sutil -->
        <path
          :d="arcPath"
          fill="none"
          stroke="#1a1a1a"
          stroke-width="10"
          filter="drop-shadow(0 0 3px #0f0f0f)"  
        />

        <!-- Arco dinámico (azul o púrpura): representa la velocidad actual -->
        <!-- " stroke=isUpload " color según subida/descarga --> 
        <!-- " filter " brillo suave --> 
        <path
          :d="arcPath"
          fill="none"
          :stroke="isUpload ? '#9333ea' : '#3b82f6'"  
          stroke-width="12"
          stroke-linecap="round"
          :stroke-dasharray="dashArray"
          :stroke-dashoffset="dashOffset"
          filter="drop-shadow(0 0 6px rgba(59,130,246,0.5))" 
        />

        <!-- Aguja: línea que apunta a la velocidad -->
        <!-- " x1 " punto central del dial --> 
        <!-- " x2 " punta de la aguja --> 
        <line
          :x1="center" :y1="center"     
          :x2="needleX" :y2="needleY"   
          stroke="url(#needleGradient)"
          stroke-width="6"
        />

        <!-- Marcas pequeñas alrededor del arco -->
        <g stroke="#111" stroke-width="1.2">
          <line
            v-for="i in markCount"
            :key="i"
            :x1="calcMarkX(i)"
            :y1="calcMarkY(i)"
            :x2="calcMarkX(i, true)"
            :y2="calcMarkY(i, true)"
          />
        </g>

        <!-- Números del arco: valores de la escala -->
        <g
          fill="#e5e5e5"
          font-family="'Inter', sans-serif"
          font-size="11"
          font-weight="600"
          text-anchor="middle"
        >
          <text
            v-for="(value, i) in tickValues"
            :key="value"
            :x="numberX(i)"
            :y="numberY(i)"
            dominant-baseline="middle"
          >
            {{ value }}
          </text>
        </g>

        <!-- Gradiente usado en la aguja (de transparente a azul intenso) -->
        <defs>
          <linearGradient
            id="needleGradient"
            :x1="center"
            :y1="center"
            :x2="needleX"
            :y2="needleY"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="transparent" />
            <stop offset="30%" stop-color="rgba(59,130,246,0.3)" />
            <stop offset="92%" stop-color="rgba(59,130,246,1)" />
            <stop offset="0%" stop-color="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Texto central bajo el dial: número + unidad + tipo de prueba -->
    <div class="text-center -mt-27">
      <div class="text-5xl font-bold text-white font-inter tracking-wide">
        {{ displaySpeed || 0 }}
        <span class="text-blue-300 text-sm font-semibold">Mbps</span>
      </div>

      <!-- Subtítulo del resultado, si se proporciona (ej: "Descarga", "Subida") -->
      <div v-if="label" class="text-sm text-blue-400 uppercase tracking-wider font-medium mt-8">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSpeedtest } from '../composables/useSpeedtest.js'

// Props recibidas desde el padre del componente
const props = defineProps({
  speed: { type: Number, default: 0 },       // Velocidad actual
  maxSpeed: { type: Number, default: 500 },  // Máximo en la escala
  label: { type: String, default: '' },      // Texto bajo el número (ej: "Descarga")
  isUpload: { type: Boolean, default: false } // Define si el arco es de subida o descarga
})

// Tamaño total del SVG y su centro
const size = 320
const center = size / 2

// Radio del arco circular
const radius = 140

// Ángulo inicial (135°) y total del arco (270°)
const angleOffset = Math.PI * 0.75       // 135 grados
const totalAngle = Math.PI * 1.5         // 270 grados

// Cantidad de marcas visuales en el arco
const markCount = 14

// Calcula el ángulo real dentro del arco, en base a un ratio (0 → inicio, 1 → fin)
const calcAngle = (ratio) => angleOffset + totalAngle * ratio

// Convierte coordenadas polares (ángulo, radio) a cartesianas (x, y)
const polar = (angle, r = radius) => ({
  x: center + r * Math.cos(angle),
  y: center + r * Math.sin(angle)
})

// Muestra la velocidad actual, redondeada
const displaySpeed = computed(() => Math.floor(props.speed))

// Ángulo y posición de la aguja, según velocidad
const needleAngle = computed(() => {
  const ratio = getInterpolatedRatio(props.speed)
  return calcAngle(ratio)
})
const needleX = computed(() => polar(needleAngle.value).x)
const needleY = computed(() => polar(needleAngle.value).y)

// Coordenadas de las marcas pequeñas del arco
const calcMarkX = (i, outer = false) => {
  const angle = calcAngle(i / markCount)
  const r = outer ? radius + 5 : radius - 5    // Marca externa o interna
  return polar(angle, r).x
}

const calcMarkY = (i, outer = false) => {
  const angle = calcAngle(i / markCount)
  const r = outer ? radius + 5 : radius - 5
  return polar(angle, r).y
}

// Valores de texto en la escala del arco
const tickValues = [0, 5, 10, 50, 100, 150, 300, 500]

function getInterpolatedRatio(speed) {
  const ticks = tickValues
  for (let i = 0; i < ticks.length - 1; i++) {
    const start = ticks[i]
    const end = ticks[i + 1]
    if (speed >= start && speed <= end) {
      const localRatio = (speed - start) / (end - start)
      const globalRatio = (i + localRatio) / (ticks.length - 1)
      return globalRatio
    }
  }
  return 1 // Si está por fuera del rango
}

// Coordenadas de cada número (usa su índice para que estén equidistantes)
const numberX = (i) => {
  const angle = angleOffset + (totalAngle * (i / (tickValues.length - 1)))
  return polar(angle, radius - 20).x
}

const numberY = (i) => {
  const angle = angleOffset + (totalAngle * (i / (tickValues.length - 1)))
  return polar(angle, radius - 20).y + 2
}

// Trayectoria SVG del arco base y dinámico (usa un arco SVG circular)
const arcStart = polar(angleOffset)
const arcEnd = polar(angleOffset + totalAngle)
const arcPath = `M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 1 1 ${arcEnd.x} ${arcEnd.y}`

// Longitud del arco, usada para animar el trazo dinámico
const semicircleLength = 2 * Math.PI * radius * (totalAngle / (2 * Math.PI))
const dashArray = semicircleLength

// Offset del trazo dinámico según velocidad actual
const dashOffset = computed(() => {
  const ratio = getInterpolatedRatio(props.speed)
  return semicircleLength * (1 - ratio)
})
</script>


<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
