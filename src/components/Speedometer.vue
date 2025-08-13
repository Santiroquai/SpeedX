<template>
  <div class="flex flex-col items-center">
    <!-- Dial SVG -->
    <div class="relative w-80 h-80 overflow-visible">
      <svg width="100%" height="100%" viewBox="-20 -20 360 360">
        <!-- Background Arc -->
        <path
          :d="arcPath"
          fill="none"
          stroke="#0f172b"
          stroke-width="10"
          filter="drop-shadow(0 0 3px #0f0f0f)"
        />
        
        <!-- Progress Arc -->
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
        
        <!-- Needle -->
        <line
          :x1="center"
          :y1="center"
          :x2="needleX"
          :y2="needleY"
          stroke="url(#needleGradient)"
          stroke-width="6"
        />
        
        <!-- Marks -->
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
        
        <!-- Labels -->
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

    <!-- Speed Display -->
    <div class="text-center -mt-29">
      <div class="text-4xl text-white font-digital font-extralight tracking-wide">
        {{ displaySpeed || 0 }}
      </div>
      <span class="text-blue-300 text-sm font-semibold font-inter">Mbps</span>
      <div v-if="showLabel" class="text-sm text-blue-400 uppercase tracking-wider font-medium mt-8 font-inter">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  speed: { type: Number, default: 0 },
  maxSpeed: { type: Number, default: 500 },
  label: { type: String, default: '' },
  isUpload: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false }
})

// Configuración geométrica
const size = 320
const center = size / 2
const radius = 140
const angleOffset = Math.PI * 0.75
const totalAngle = Math.PI * 1.5
const markCount = 14
const tickValues = [0, 5, 10, 50, 100, 150, 300, 500]

// Cálculos reactivos
const displaySpeed = computed(() => Math.floor(props.speed))

const polar = (angle, r = radius) => ({
  x: center + r * Math.cos(angle),
  y: center + r * Math.sin(angle)
})

const needleAngle = computed(() => {
  const ratio = getInterpolatedRatio(props.speed)
  return angleOffset + totalAngle * ratio
})

const needleX = computed(() => polar(needleAngle.value).x)
const needleY = computed(() => polar(needleAngle.value).y)

const arcPath = computed(() => {
  const start = polar(angleOffset)
  const end = polar(angleOffset + totalAngle)
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`
})

const semicircleLength = computed(() => 2 * Math.PI * radius * (totalAngle / (2 * Math.PI)))
const dashArray = semicircleLength
const dashOffset = computed(() => semicircleLength.value * (1 - getInterpolatedRatio(props.speed)))

// Funciones de utilidad
function getInterpolatedRatio(speed) {
  for (let i = 0; i < tickValues.length - 1; i++) {
    if (speed >= tickValues[i] && speed <= tickValues[i + 1]) {
      const localRatio = (speed - tickValues[i]) / (tickValues[i + 1] - tickValues[i])
      return (i + localRatio) / (tickValues.length - 1)
    }
  }
  return 1
}

function calcAngle(ratio) {
  return angleOffset + totalAngle * ratio
}

function calcMarkX(i, outer = false) {
  return polar(calcAngle(i / markCount), outer ? radius + 5 : radius - 5).x
}

function calcMarkY(i, outer = false) {
  return polar(calcAngle(i / markCount), outer ? radius + 5 : radius - 5).y
}

function numberX(i) {
  return polar(angleOffset + (totalAngle * (i / (tickValues.length - 1))), radius - 20).x
}

function numberY(i) {
  return polar(angleOffset + (totalAngle * (i / (tickValues.length - 1))), radius - 20).y + 2
}
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}

.font-digital {
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 1px;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

/* Para el efecto digital más marcado (opcional) */
.digital-effect {
  position: relative;
}
.digital-effect::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(59, 130, 246, 0.1) 50%,
    transparent 100%
  );
  opacity: 0.6;
}
</style>