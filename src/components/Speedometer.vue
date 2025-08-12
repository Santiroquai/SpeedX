<template>
  <div class="flex flex-col items-center">
    <!-- Dial SVG -->
    <div class="relative w-80 h-80 overflow-visible">
      <svg width="100%" height="100%" viewBox="-20 -20 360 360">
        <path
          :d="arcPath"
          fill="none"
          stroke="#0f172b"
          stroke-width="10"
          filter="drop-shadow(0 0 3px #0f0f0f)"
        />
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
        <line
          :x1="center"
          :y1="center"
          :x2="needleX"
          :y2="needleY"
          stroke="url(#needleGradient)"
          stroke-width="6"
        />
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

    <!-- Texto debajo del dial -->
    <div class="text-center -mt-29">
      <div class="text-4xl font-bold text-white font-inter tracking-wide">
        {{ displaySpeed || 0 }}
        <span class="text-blue-300 text-sm font-semibold">Mbps</span>
      </div>
      <div v-if="showLabel" class="text-sm text-blue-400 uppercase tracking-wider font-medium mt-8">
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
  showLabel: { type: Boolean, default: false } // Nueva prop
})

const displaySpeed = computed(() => Math.floor(props.speed))

const size = 320
const center = size / 2
const radius = 140
const angleOffset = Math.PI * 0.75
const totalAngle = Math.PI * 1.5
const markCount = 14

const polar = (angle, r = radius) => ({
  x: center + r * Math.cos(angle),
  y: center + r * Math.sin(angle)
})

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
  return 1
}

const needleAngle = computed(() => {
  const ratio = getInterpolatedRatio(props.speed)
  return angleOffset + totalAngle * ratio
})
const needleX = computed(() => polar(needleAngle.value).x)
const needleY = computed(() => polar(needleAngle.value).y)

const calcAngle = (ratio) => angleOffset + totalAngle * ratio

const calcMarkX = (i, outer = false) => {
  const angle = calcAngle(i / markCount)
  const r = outer ? radius + 5 : radius - 5
  return polar(angle, r).x
}

const calcMarkY = (i, outer = false) => {
  const angle = calcAngle(i / markCount)
  const r = outer ? radius + 5 : radius - 5
  return polar(angle, r).y
}

const numberX = (i) => {
  const angle = angleOffset + (totalAngle * (i / (tickValues.length - 1)))
  return polar(angle, radius - 20).x
}
const numberY = (i) => {
  const angle = angleOffset + (totalAngle * (i / (tickValues.length - 1)))
  return polar(angle, radius - 20).y + 2
}

const arcStart = polar(angleOffset)
const arcEnd = polar(angleOffset + totalAngle)
const arcPath = `M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 1 1 ${arcEnd.x} ${arcEnd.y}`

const semicircleLength = 2 * Math.PI * radius * (totalAngle / (2 * Math.PI))
const dashArray = semicircleLength
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