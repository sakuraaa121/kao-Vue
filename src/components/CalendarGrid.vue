<template>
  <div class="cal-grid">
    <!-- フィルターバー -->
    <div class="filter-bar">
      <button
        :class="['chip', selectedGroupId === null ? 'active' : '']"
        @click="selectedGroupId = null"
      >すべて</button>
      <button
        v-for="g in groups"
        :key="g.id"
        :class="['chip', selectedGroupId === g.id ? 'active' : '']"
        :style="selectedGroupId === g.id ? { background: COLORS[g.colorIdx||0].dot, color: '#fff', borderColor: 'transparent' } : { borderColor: COLORS[g.colorIdx||0].dot, color: COLORS[g.colorIdx||0].text }"
        @click="selectedGroupId = g.id"
      >{{ g.name }}</button>
    </div>

    <!-- 曜日ヘッダー -->
    <div class="dow-header">
      <span v-for="d in DAYS" :key="d">{{ d }}</span>
    </div>

    <!-- 月ビュー -->
    <div class="month-body" :style="{ gridTemplateRows: `repeat(${weeks}, 1fr)` }">
      <div
        v-for="(day, i) in calDays"
        :key="i"
        :class="['cal-cell', { 'other-month': day.otherMonth, 'today-cell': day.isToday }]"
        @click="$emit('add-event', day.date)"
      >
        <div class="cell-day-num">{{ day.date.getDate() }}</div>
        <div
          v-for="ev in dayEvents(day.date)"
          :key="ev.id"
          class="ev-chip"
          :style="{ background: groupColor(ev).bg, color: groupColor(ev).text }"
          @click.stop="$emit('edit-event', ev)"
        >{{ ev.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { filteredEvents, groups, selectedGroupId, COLORS, dateStr } from '../stores/calendar'

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

const props = defineProps({ currentDate: Date })
defineEmits(['add-event', 'edit-event'])

const calDays = computed(() => {
  const today = new Date()
  const first = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth(), 1)
  const last = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth() + 1, 0)
  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay())
  const cellCount = (first.getDay() + last.getDate()) > 35 ? 42 : 35
  return Array.from({ length: cellCount }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return {
      date: d,
      otherMonth: d.getMonth() !== props.currentDate.getMonth(),
      isToday: dateStr(d) === dateStr(today)
    }
  })
})

const weeks = computed(() => calDays.value.length / 7)

function dayEvents(date) {
  return filteredEvents.value.filter(e => e.date === dateStr(date))
}

function groupColor(ev) {
  return COLORS[ev.colorIdx ?? ev.colorIdx ?? 0] || COLORS[0]
}
</script>

<style scoped>
.cal-grid { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.filter-bar { display: flex; gap: 6px; padding: 8px 14px; border-bottom: 1px solid #e5e5e3; overflow-x: auto; background: #fff; }
.chip { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid #ccc; background: none; color: #666; white-space: nowrap; }
.chip.active { background: #888; color: #fff; border-color: transparent; }
.dow-header { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid #e5e5e3; }
.dow-header span { font-size: 11px; color: #aaa; text-align: center; padding: 5px 0; }
.month-body { flex: 1; display: grid; grid-template-columns: repeat(7, 1fr); overflow-y: auto; }
.cal-cell { border-right: 1px solid #e5e5e3; border-bottom: 1px solid #e5e5e3; padding: 5px 6px; min-height: 80px; cursor: pointer; }
.cal-cell:nth-child(7n) { border-right: none; }
.cal-cell:hover { background: #f8f8f7; }
.cal-cell.today-cell { background: #E6F1FB; }
.cal-cell.other-month .cell-day-num { opacity: 0.35; }
.cell-day-num { font-size: 12px; font-weight: 500; color: #666; margin-bottom: 3px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.today-cell .cell-day-num { background: #378ADD; color: #fff; font-weight: 700; }
.ev-chip { font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; font-weight: 500; }
</style>