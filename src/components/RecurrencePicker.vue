<template>
  <div class="rec-field">
    <button class="rec-trigger" @click="open = !open">
      🔁 繰り返し
      <span v-if="summary" class="rec-summary">{{ summary }}</span>
    </button>

    <div v-if="open" class="rec-popup" @click.stop>
      <div class="rec-section">
        <label class="rec-label">繰り返し頻度</label>
        <select v-model="freq" class="rec-select">
          <option value="none">繰り返さない</option>
          <option value="daily">1日ごと</option>
          <option value="weekly">1週ごと</option>
          <option value="monthly">1ヶ月ごと</option>
          <option value="yearly">1年ごと</option>
        </select>
      </div>

      <template v-if="freq !== 'none'">
        <div class="rec-section">
          <label class="rec-label">期間</label>
          <select v-model="endType" class="rec-select">
            <option value="forever">制限なし</option>
            <option value="count">特定の回数</option>
            <option value="until">終了日</option>
          </select>
        </div>

        <div v-if="endType === 'count'" class="rec-section">
          <label class="rec-label">回数</label>
          <div class="rec-count-row">
            <button class="rec-count-btn" @click="count = Math.max(1, count - 1)">−</button>
            <input
              class="rec-count-input"
              type="number"
              v-model.number="count"
              min="1"
              max="999"
            />
            <button class="rec-count-btn" @click="count = Math.min(999, count + 1)">＋</button>
            <span class="rec-count-unit">回</span>
          </div>
        </div>

        <div v-if="endType === 'until'" class="rec-section">
          <label class="rec-label">終了日</label>
          <div class="rec-mini-cal">
            <div class="mdp-header">
              <button class="mdp-nav" @click="prevMonth">‹</button>
              <span class="mdp-label">{{ calLabel }}</span>
              <button class="mdp-nav" @click="nextMonth">›</button>
            </div>
            <div class="mdp-grid">
              <div v-for="d in DAYS" :key="d" class="mdp-dow">{{ d }}</div>
              <div
                v-for="(day, i) in calDays"
                :key="i"
                :class="['mdp-day', {
                  'other-month': day.otherMonth,
                  'selected': untilDate === dateStr(day.date),
                  'today': day.isToday
                }]"
                @click="untilDate = dateStr(day.date)"
              >{{ day.date.getDate() }}</div>
            </div>
            <div v-if="untilDate" class="rec-until-selected">終了日: {{ untilDate }}</div>
          </div>
        </div>
      </template>

      <div class="rec-actions">
        <button class="rec-clear" @click="reset">リセット</button>
        <button class="rec-ok" @click="confirm">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Object // { freq, endType, count, untilDate }
})
const emit = defineEmits(['update:modelValue'])

const DAYS = ['日', '月', '火', '水', '木', '金', '土']
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

const open = ref(false)
const freq = ref(props.modelValue?.freq || 'none')
const endType = ref(props.modelValue?.endType || 'forever')
const count = ref(props.modelValue?.count || 1)
const untilDate = ref(props.modelValue?.untilDate || '')
const cur = ref(new Date())
const today = new Date()

const summary = computed(() => {
  if (freq.value === 'none') return ''
  const freqMap = { daily: '毎日', weekly: '毎週', monthly: '毎月', yearly: '毎年' }
  let s = freqMap[freq.value]
  if (endType.value === 'count') s += ` ${count.value}回`
  if (endType.value === 'until' && untilDate.value) s += ` ${untilDate.value}まで`
  return s
})

const calLabel = computed(() =>
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

function reset() {
  freq.value = 'none'
  endType.value = 'forever'
  count.value = 1
  untilDate.value = ''
  emit('update:modelValue', { freq: 'none', endType: 'forever', count: 1, untilDate: '' })
  open.value = false
}

function confirm() {
  emit('update:modelValue', {
    freq: freq.value,
    endType: endType.value,
    count: count.value,
    untilDate: untilDate.value
  })
  open.value = false
}

function onClickOutside(e) {
  if (!e.target.closest('.rec-field')) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.rec-field { position: relative; }
.rec-trigger { display: flex; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; font-size: 14px; border: 1px solid #ddd; border-radius: 10px; background: #f8f8f7; color: #1a1a18; cursor: pointer; text-align: left; }
.rec-trigger:hover { border-color: #378ADD; }
.rec-summary { font-size: 12px; background: #1D9E75; color: #fff; padding: 1px 8px; border-radius: 10px; margin-left: auto; }
.rec-popup { position: absolute; bottom: calc(100% + 8px); left: 0; right: 0; background: #fff; border: 1px solid #e5e5e3; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.12); padding: 14px; z-index: 200; display: flex; flex-direction: column; gap: 12px; }
.rec-section { display: flex; flex-direction: column; gap: 5px; }
.rec-label { font-size: 12px; color: #666; font-weight: 500; }
.rec-select { font-size: 14px; padding: 9px 11px; border: 1px solid #ddd; border-radius: 8px; background: #f8f8f7; color: #1a1a18; width: 100%; outline: none; }
.rec-select:focus { border-color: #378ADD; }
.rec-count-row { display: flex; align-items: center; gap: 8px; }
.rec-count-btn { width: 32px; height: 32px; border: 1px solid #ddd; border-radius: 8px; background: #f8f8f7; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rec-count-btn:hover { background: #e5e5e3; }
.rec-count-input { width: 64px; text-align: center; font-size: 15px; font-weight: 600; padding: 6px; border: 1px solid #ddd; border-radius: 8px; background: #f8f8f7; color: #1a1a18; outline: none; }
.rec-count-input:focus { border-color: #378ADD; }
.rec-count-unit { font-size: 13px; color: #666; }
.rec-mini-cal { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
.mdp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.mdp-label { font-size: 13px; font-weight: 500; }
.mdp-nav { background: none; border: none; cursor: pointer; color: #666; padding: 2px 8px; border-radius: 5px; font-size: 15px; }
.mdp-nav:hover { background: #f3f2ef; }
.mdp-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 2px; }
.mdp-dow { font-size: 10px; color: #aaa; padding: 2px 0; }
.mdp-day { font-size: 12px; padding: 5px 2px; border-radius: 5px; cursor: pointer; color: #666; }
.mdp-day:hover { background: #f3f2ef; }
.mdp-day.other-month { opacity: .3; }
.mdp-day.today { font-weight: 700; color: #378ADD; }
.mdp-day.selected { background: #1D9E75; color: #fff; font-weight: 600; }
.rec-until-selected { font-size: 12px; color: #1D9E75; font-weight: 500; margin-top: 6px; text-align: center; }
.rec-actions { display: flex; gap: 8px; justify-content: flex-end; }
.rec-clear { padding: 7px 14px; font-size: 13px; border: 1px solid #ddd; border-radius: 8px; background: none; cursor: pointer; color: #666; }
.rec-clear:hover { background: #f3f2ef; }
.rec-ok { padding: 7px 14px; font-size: 13px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.rec-ok:hover { opacity: .88; }
</style>