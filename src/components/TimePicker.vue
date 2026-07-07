<template>
  <div class="time-field" :data-timepicker="pickerId">
    <div class="time-display" @click="toggle">
      <span class="time-text">{{ modelValue || 'hh:mm' }}</span>
      <span class="time-icon">🕐</span>
    </div>
    <div v-if="open" class="time-popup" @click.stop>
      <div class="time-columns">
        <!-- 時間 -->
        <div class="time-col">
          <button class="arrow-btn" @click="changeHour(1)">▲</button>
          <input
            class="time-input"
            :value="hourStr"
            @click="selectAll"
            @compositionstart="composingHour = true"
            @compositionend="onHourCompositionEnd"
            @input="onHourInput"
            @blur="onHourBlur"
            @keydown.enter="onHourBlur({ target: $event.target }); $event.target.blur()"
            maxlength="2"
          />
          <button class="arrow-btn" @click="changeHour(-1)">▼</button>
        </div>
        <div class="time-sep">:</div>
        <!-- 分 -->
        <div class="time-col">
          <button class="arrow-btn" @click="changeMinute(1)">▲</button>
          <input
            class="time-input"
            :value="minuteStr"
            @click="selectAll"
            @compositionstart="composingMinute = true"
            @compositionend="onMinuteCompositionEnd"
            @input="onMinuteInput"
            @blur="onMinuteBlur"
            @keydown.enter="onMinuteBlur({ target: $event.target }); $event.target.blur()"
            maxlength="2"
          />
          <button class="arrow-btn" @click="changeMinute(-1)">▼</button>
        </div>
      </div>
      <button
        class="btn-ok"
        :class="{ disabled: isInvalid }"
        :disabled="isInvalid"
        @click="confirm"
      >OK</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: String,
  minTime: String
})
const emit = defineEmits(['update:modelValue'])

const pickerId = Math.random().toString(36).slice(2)
const open = ref(false)
const hour = ref(0)
const minute = ref(0)
const composingHour = ref(false)
const composingMinute = ref(false)

watch(() => props.modelValue, val => {
  if (val) {
    const [h, m] = val.split(':').map(Number)
    hour.value = isNaN(h) ? 0 : h
    minute.value = isNaN(m) ? 0 : m
  }
}, { immediate: true })

const hourStr = computed(() => String(hour.value).padStart(2, '0'))
const minuteStr = computed(() => String(minute.value).padStart(2, '0'))

const isInvalid = computed(() => {
  if (!props.minTime) return false
  return `${hourStr.value}:${minuteStr.value}` <= props.minTime
})

function toggle() {
  open.value = !open.value
}

function changeHour(delta) {
  hour.value = (hour.value + delta + 24) % 24
}

function changeMinute(delta) {
  const current = minute.value
  if (delta > 0) {
    const next = Math.ceil((current + 1) / 10) * 10
    minute.value = next >= 60 ? 0 : next
  } else {
    const prev = Math.floor((current - 1) / 10) * 10
    minute.value = prev < 0 ? 50 : prev
  }
}

function toHalf(str) {
  return str.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
}

function onHourInput(e) {
  if (composingHour.value) return
  e.target.value = toHalf(e.target.value)
}

function onMinuteInput(e) {
  if (composingMinute.value) return
  e.target.value = toHalf(e.target.value)
}

function onHourBlur(e) {
  const val = parseInt(toHalf(e.target.value))
  hour.value = isNaN(val) ? 0 : Math.min(23, Math.max(0, val))
}

function onMinuteBlur(e) {
  const val = parseInt(toHalf(e.target.value))
  minute.value = isNaN(val) ? 0 : Math.min(59, Math.max(0, val))
}

function onHourCompositionEnd(e) {
  composingHour.value = false
  const half = toHalf(e.target.value).replace(/\D/g, '').slice(0, 2)
  e.target.value = half
}

function onMinuteCompositionEnd(e) {
  composingMinute.value = false
  const half = toHalf(e.target.value).replace(/\D/g, '').slice(0, 2)
  e.target.value = half
}

function selectAll(e) { e.target.select() }

function confirm() {
  if (isInvalid.value) return
  emit('update:modelValue', `${hourStr.value}:${minuteStr.value}`)
  open.value = false
}

function onClickOutside(e) {
  if (open.value && !e.target.closest(`[data-timepicker="${pickerId}"]`)) {
    if (!isInvalid.value) {
      emit('update:modelValue', `${hourStr.value}:${minuteStr.value}`)
    }
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.time-field { position: relative; }
.time-display { display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding: 11px 13px; border: 1px solid #ddd; border-radius: 10px; background: #f8f8f7; color: #1a1a18; cursor: pointer; }
.time-display:hover { border-color: #378ADD; }
.time-text { font-size: 14px; }
.time-icon { font-size: 14px; color: #aaa; }
.time-popup { position: absolute; bottom: calc(100% + 8px); left: 0; background: #fff; border: 1px solid #e5e5e3; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.12); padding: 16px; z-index: 200; display: flex; flex-direction: column; gap: 12px; min-width: 160px; }
.time-columns { display: flex; align-items: center; gap: 4px; justify-content: center; }
.time-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.arrow-btn { background: none; border: none; cursor: pointer; font-size: 14px; color: #666; padding: 4px 8px; border-radius: 6px; line-height: 1; }
.arrow-btn:hover { background: #f3f2ef; color: #378ADD; }
.time-input { width: 48px; height: 44px; text-align: center; font-size: 22px; font-weight: 600; border: 1px solid #ddd; border-radius: 8px; background: #f8f8f7; color: #1a1a18; outline: none; }
.time-input:focus { border-color: #378ADD; box-shadow: 0 0 0 3px rgba(55,138,221,.15); }
.time-sep { font-size: 24px; font-weight: 600; color: #1a1a18; padding-bottom: 4px; }
.btn-ok { padding: 8px; font-size: 13px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 8px; cursor: pointer; width: 100%; }
.btn-ok:hover { opacity: .88; }
.btn-ok.disabled { background: #ccc; cursor: not-allowed; opacity: .6; }
</style>