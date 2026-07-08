<template>
  <div class="mdp-field">
    <button
      class="mdp-trigger"
      :disabled="disabled"
      :title="disabled ? '開始日と終了日が同じ場合のみ使用できます' : ''"
      @click="open = !open"
    >
      📅 複数日を選択
      <span v-if="modelValue.length > 0" class="mdp-count">{{ modelValue.length }}日選択中</span>
    </button>
    <div v-if="open" class="mdp-popup" @click.stop>
      <div class="mdp-header">
        <button class="mdp-nav" @click="prevMonth">‹</button>
        <span class="mdp-label">{{ label }}</span>
        <button class="mdp-nav" @click="nextMonth">›</button>
      </div>
      <div class="mdp-grid">
        <div v-for="d in DAYS" :key="d" class="mdp-dow">{{ d }}</div>
        <div
          v-for="(day, i) in calDays"
          :key="i"
          :class="['mdp-day', {
            'other-month': day.otherMonth,
            'selected': isSelected(day.date),
            'today': day.isToday
          }]"
          @click="toggleDate(day.date)"
        >{{ day.date.getDate() }}</div>
      </div>
      <div v-if="modelValue.length > 0" class="mdp-selected-list">
        <div class="mdp-selected-label">選択中 ({{ modelValue.length }}日)</div>
        <div class="mdp-tags">
          <div v-for="d in modelValue" :key="d" class="mdp-tag">
            {{ d }}
            <button @click.stop="removeDate(d)">×</button>
          </div>
        </div>
      </div>
      <div class="mdp-actions">
        <button class="mdp-clear" @click="$emit('update:modelValue', []); open = false">クリア</button>
        <button class="mdp-ok" @click="open = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Array,
  disabled: Boolean
})
const emit = defineEmits(['update:modelValue'])

const DAYS = ['日', '月', '火', '水', '木', '金', '土']
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

const open = ref(false)
const cur = ref(new Date())
const today = new Date()

const label = computed(() =>
  `${cur.value.getFullYear()}年 ${MONTHS[cur.value.getMonth()]}`
)

function prevMonth() {
  const d = new Date(cur.value)
  d.setMonth(d.getMonth() - 1)
  cur.value = d
}
function nextMonth() {
  const d = new Date(cur.value)
  d.setMonth(d.getMonth() + 1)
  cur.value = d
}

function dateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const calDays = computed(() => {
  const first = new Date(cur.value.getFullYear(), cur.value.getMonth(), 1)
  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay())
  const cellCount = (first.getDay() + new Date(cur.value.getFullYear(), cur.value.getMonth()+1, 0).getDate()) > 35 ? 42 : 35
  return Array.from({ length: cellCount }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return {
      date: d,
      otherMonth: d.getMonth() !== cur.value.getMonth(),
      isToday: dateStr(d) === dateStr(today)
    }
  })
})

function isSelected(date) {
  return props.modelValue.includes(dateStr(date))
}

function toggleDate(date) {
  const ds = dateStr(date)
  const current = [...props.modelValue]
  const idx = current.indexOf(ds)
  if (idx === -1) {
    current.push(ds)
    current.sort()
  } else {
    current.splice(idx, 1)
  }
  emit('update:modelValue', current)
}

function removeDate(ds) {
  emit('update:modelValue', props.modelValue.filter(d => d !== ds))
}

function onClickOutside(e) {
  if (!e.target.closest('.mdp-field')) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.mdp-field { position: relative; }
.mdp-trigger { display: flex; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; font-size: 14px; border: 1px solid #ddd; border-radius: 10px; background: #f8f8f7; color: #1a1a18; cursor: pointer; text-align: left; }
.mdp-trigger:disabled { opacity: .4; cursor: not-allowed; }
.mdp-trigger:not(:disabled):hover { border-color: #378ADD; }
.mdp-count { font-size: 12px; background: #378ADD; color: #fff; padding: 1px 8px; border-radius: 10px; margin-left: auto; }
.mdp-popup { position: absolute; bottom: calc(100% + 8px); left: 0; right: 0; background: #fff; border: 1px solid #e5e5e3; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.12); padding: 14px; z-index: 200; }
.mdp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.mdp-label { font-size: 13px; font-weight: 500; }
.mdp-nav { background: none; border: none; cursor: pointer; color: #666; padding: 2px 8px; border-radius: 5px; font-size: 15px; }
.mdp-nav:hover { background: #f3f2ef; }
.mdp-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 2px; margin-bottom: 8px; }
.mdp-dow { font-size: 10px; color: #aaa; padding: 2px 0; }
.mdp-day { font-size: 12px; padding: 5px 2px; border-radius: 5px; cursor: pointer; color: #666; }
.mdp-day:hover { background: #f3f2ef; }
.mdp-day.other-month { opacity: .3; }
.mdp-day.today { font-weight: 700; color: #378ADD; }
.mdp-day.selected { background: #378ADD; color: #fff; font-weight: 600; }
.mdp-day.selected:hover { background: #2a6fbb; }
.mdp-selected-list { margin-bottom: 10px; }
.mdp-selected-label { font-size: 11px; color: #aaa; margin-bottom: 4px; }
.mdp-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.mdp-tag { display: flex; align-items: center; gap: 4px; font-size: 11px; background: #378ADD; color: #fff; padding: 2px 8px; border-radius: 10px; }
.mdp-tag button { background: none; border: none; color: #fff; cursor: pointer; font-size: 12px; padding: 0; line-height: 1; }
.mdp-actions { display: flex; gap: 8px; justify-content: flex-end; }
.mdp-clear { padding: 7px 14px; font-size: 13px; border: 1px solid #ddd; border-radius: 8px; background: none; cursor: pointer; color: #666; }
.mdp-clear:hover { background: #f3f2ef; }
.mdp-ok { padding: 7px 14px; font-size: 13px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.mdp-ok:hover { opacity: .88; }
</style>