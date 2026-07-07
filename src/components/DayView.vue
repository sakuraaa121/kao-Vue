<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <div class="sheet" @click.stop>
      <div class="sheet-handle"></div>
      <div class="day-header">
        <div class="day-title">{{ title }}</div>
        <button class="btn-add-day" @click="$emit('add', date)">＋ 追加</button>
      </div>

      <!-- イベントなし -->
      <div v-if="dayEvents.length === 0" class="empty">
        <div class="empty-icon">📭</div>
        <div class="empty-text">この日のイベントはありません</div>
        <button class="btn-add-empty" @click="$emit('add', date)">イベントを追加</button>
      </div>

      <!-- イベント一覧 -->
      <div v-else class="event-list">
        <div
          v-for="ev in dayEvents"
          :key="ev.id"
          class="event-row"
          :style="{ borderLeftColor: groupColor(ev).dot }"
          @click="$emit('edit', ev)"
        >
          <div class="event-time">
            <span v-if="ev.startTime">{{ ev.startTime }}</span>
            <span v-else class="all-day">終日</span>
            <span v-if="ev.endTime" class="event-time-end">〜{{ ev.endTime }}</span>
          </div>
          <div class="event-info">
            <div class="event-title">{{ ev.title }}</div>
            <div v-if="ev.memo" class="event-memo">{{ ev.memo }}</div>
            <div v-if="groupName(ev)" class="event-group" :style="{ color: groupColor(ev).text, background: groupColor(ev).bg }">{{ groupName(ev) }}</div>
          </div>
        </div>
      </div>

      <button class="btn-close" @click="$emit('close')">閉じる</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { events, groups, COLORS, dateStr, filteredEvents } from '../stores/calendar'

const props = defineProps({
  date: Date
})
defineEmits(['close', 'add', 'edit'])

const DAYS = ['日', '月', '火', '水', '木', '金', '土']
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

const title = computed(() => {
  const d = props.date
  return `${d.getFullYear()}年${MONTHS[d.getMonth()]}${d.getDate()}日（${DAYS[d.getDay()]}）`
})

const dayEvents = computed(() => {
  const ds = dateStr(props.date)
  return filteredEvents.value
    .filter(e => {
      const start = e.date
      const end = e.endDate || e.date
      return start <= ds && ds <= end
    })
    .sort((a, b) => {
      if (!a.startTime) return 1
      if (!b.startTime) return -1
      return a.startTime.localeCompare(b.startTime)
    })
})

function groupColor(ev) {
  const g = groups.value.find(g => g.id === ev.groupId)
  return COLORS[g?.colorIdx || 0]
}

function groupName(ev) {
  const g = groups.value.find(g => g.id === ev.groupId)
  return g?.name || ''
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: flex-end; justify-content: center; z-index: 100; }
@media(min-width:500px){ .overlay { align-items: center; } }
.sheet { background: #fff; border-radius: 20px 20px 0 0; padding: 20px; width: 100%; max-width: 420px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
@media(min-width:500px){ .sheet { border-radius: 16px; } }
.sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: #ddd; margin: 0 auto -4px; }
.day-header { display: flex; align-items: center; justify-content: space-between; }
.day-title { font-size: 16px; font-weight: 600; }
.btn-add-day { padding: 6px 12px; font-size: 13px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.btn-add-day:hover { opacity: .88; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px 0; }
.empty-icon { font-size: 36px; }
.empty-text { font-size: 14px; color: #aaa; }
.btn-add-empty { padding: 8px 16px; font-size: 13px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.event-list { display: flex; flex-direction: column; gap: 8px; }
.event-row { display: flex; gap: 12px; padding: 10px 12px; border-left: 3px solid #378ADD; border-radius: 0 8px 8px 0; background: #f8f8f7; cursor: pointer; transition: background .1s; }
.event-row:hover { background: #f0f0ee; }
.event-time { width: 60px; flex-shrink: 0; display: flex; flex-direction: column; gap: 2px; }
.event-time span { font-size: 12px; font-weight: 500; color: #666; }
.event-time-end { color: #aaa !important; font-weight: 400 !important; }
.all-day { font-size: 11px !important; color: #aaa !important; }
.event-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.event-title { font-size: 14px; font-weight: 500; color: #1a1a18; }
.event-memo { font-size: 12px; color: #888; }
.event-group { font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 10px; display: inline-block; width: fit-content; }
.btn-close { padding: 10px; font-size: 14px; border: 1px solid #ddd; border-radius: 10px; background: none; cursor: pointer; color: #666; width: 100%; }
.btn-close:hover { background: #f3f2ef; }
</style>