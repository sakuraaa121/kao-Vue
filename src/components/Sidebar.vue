<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">📅 僕らのCalendar</span>
      <div class="sync-dot" title="リアルタイム同期中"></div>
    </div>

    <!-- ユーザー情報 -->
    <div class="user-pill">
      <div class="user-avatar">{{ userInitials }}</div>
      <div class="user-email">{{ user?.displayName || user?.email }}</div>
    </div>

    <!-- ミニカレンダー -->
    <div class="mini-cal">
      <div class="mc-header">
        <button class="mc-nav" @click="$emit('prev')">‹</button>
        <span class="mc-label">{{ mcLabel }}</span>
        <button class="mc-nav" @click="$emit('next')">›</button>
      </div>
      <div class="mc-grid">
        <div v-for="d in DAYS" :key="d" class="mc-dow">{{ d }}</div>
        <div
          v-for="(day, i) in miniDays"
          :key="i"
          :class="['mc-day', { today: day.isToday, other: day.otherMonth, 'has-ev': day.hasEvent }]"
          @click="$emit('goto', day.date)"
        >{{ day.date.getDate() }}</div>
      </div>
    </div>

    <!-- グループ -->
<!-- グループ -->
<div>
  <div class="section-label">グループ</div>
  <div class="group-list">
    <div :class="['group-row', { active: selectedGroupId === null }]" @click="selectedGroupId = null">
      <div class="group-dot" style="background:#aaa"></div>
      <span class="group-name">すべて</span>
      <span class="group-badge">{{ events.length }}</span>
    </div>
    <div
      v-for="g in groups"
      :key="g.id"
      :class="['group-row', { active: selectedGroupId === g.id }]"
      @click="selectedGroupId = g.id"
    >
      <div class="group-dot" :style="{ background: COLORS[g.colorIdx||0].dot }"></div>
      <span class="group-name">{{ g.name }}</span>
      <div class="group-menu">
        <button class="btn-sm" @click.stop="toggleMenu(g.id)">⋯</button>
        <div v-if="openMenuId === g.id" class="dropdown" @click.stop>
          <div class="dropdown-item" @click="$emit('share', g.id); openMenuId = null">⇪ 共有</div>
          <div v-if="g.ownerId === user?.uid" class="dropdown-item danger" @click="$emit('delete-group', g.id, g.name); openMenuId = null">✕ 削除</div>
        </div>
      </div>
    </div>
  </div>
  <button class="btn-new-group" @click="$emit('new-group')">+ グループを作成</button>
</div>

    <!-- Googleカレンダー連携 -->
    <button class="btn-gcal" @click="$emit('gcal')">
      📅 {{ gcalSignedIn ? 'Google連携中' : 'Googleカレンダー連携' }}
    </button>

    <div class="bottom-bar">
      <button class="btn-signout" @click="$emit('signout')">サインアウト</button>
      <button class="btn-settings" @click="$emit('settings')">⚙️</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { events, groups, selectedGroupId, COLORS, dateStr } from '../stores/calendar'

import { ref as vRef } from 'vue'
const openMenuId = vRef(null)
function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}
// ドロップダウン外クリックで閉じる
import { onMounted, onUnmounted } from 'vue'
onMounted(() => document.addEventListener('click', () => openMenuId.value = null))
onUnmounted(() => document.removeEventListener('click', () => openMenuId.value = null))

const DAYS = ['日', '月', '火', '水', '木', '金', '土']
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

const props = defineProps({
  currentDate: Date,
  user: Object,
  gcalSignedIn: Boolean
})
defineEmits(['prev', 'next', 'goto', 'new-group', 'share', 'delete-group', 'gcal', 'signout', 'settings'])

const userInitials = computed(() =>
  (props.user?.displayName || props.user?.email || '?').slice(0, 2).toUpperCase()
)
const mcLabel = computed(() =>
  `${props.currentDate.getFullYear()}年 ${MONTHS[props.currentDate.getMonth()]}`
)

const today = new Date()
const miniDays = computed(() => {
  const first = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth(), 1)
  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay())
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return {
      date: d,
      isToday: dateStr(d) === dateStr(today),
      otherMonth: d.getMonth() !== props.currentDate.getMonth(),
      hasEvent: events.value.some(e => e.date === dateStr(d))
    }
  })
})
</script>

<style scoped>
.sidebar { background: #fff; border-right: 1px solid #e5e5e3; display: flex; flex-direction: column; padding: 16px; gap: 16px; overflow-y: auto; width: 220px; flex-shrink: 0; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; }
.sidebar-title { font-size: 17px; font-weight: 600; }
.sync-dot { width: 7px; height: 7px; border-radius: 50%; background: #1D9E75; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
.user-pill { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #f3f2ef; border-radius: 10px; }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; background: #E6F1FB; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #185FA5; flex-shrink: 0; }
.user-email { font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.mc-label { font-size: 13px; font-weight: 500; }
.mc-nav { background: none; border: none; cursor: pointer; color: #666; padding: 2px 7px; border-radius: 5px; font-size: 15px; }
.mc-nav:hover { background: #f3f2ef; }
.mc-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 1px; }
.mc-dow { font-size: 10px; color: #aaa; padding: 2px 0; }
.mc-day { font-size: 11px; padding: 3px 0; border-radius: 4px; cursor: pointer; color: #666; position: relative; }
.mc-day:hover { background: #f3f2ef; }
.mc-day.today { background: #378ADD; color: #fff; font-weight: 600; }
.mc-day.other { opacity: .3; }
.mc-day.has-ev::after { content: ''; display: block; width: 3px; height: 3px; border-radius: 50%; background: #378ADD; margin: 1px auto 0; }
.mc-day.today.has-ev::after { background: #fff; }
.section-label { font-size: 11px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.group-list { display: flex; flex-direction: column; gap: 2px; }
.group-row { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 8px; cursor: pointer; }
.group-row:hover, .group-row.active { background: #f3f2ef; }
.group-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.group-name { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group-badge { font-size: 10px; color: #aaa; padding: 1px 6px; background: #f3f2ef; border-radius: 10px; }
.btn-sm { background: none; border: none; cursor: pointer; color: #aaa; padding: 3px 5px; border-radius: 5px; font-size: 13px; }
.btn-sm:hover { color: #666; background: #e5e5e3; }
.btn-sm.danger { color: #D85A30; }
.btn-new-group { display: flex; align-items: center; gap: 6px; padding: 7px 8px; border-radius: 8px; border: 1px dashed #ccc; background: none; cursor: pointer; font-size: 12px; color: #666; width: 100%; margin-top: 4px; }
.btn-new-group:hover { background: #f3f2ef; }
.btn-gcal { display: flex; align-items: center; gap: 6px; padding: 7px 8px; border-radius: 8px; border: none; background: none; cursor: pointer; font-size: 12px; color: #1D9E75; width: 100%; }
.btn-gcal:hover { background: #f3f2ef; }
.btn-signout { display: flex; align-items: center; gap: 6px; padding: 7px 8px; border-radius: 8px; border: none; background: none; cursor: pointer; font-size: 12px; color: #aaa; width: 100%; margin-top: auto; }
.btn-signout:hover { color: #D85A30; background: #FAECE7; }
.group-menu { position: relative; }
.dropdown { position: absolute; right: 0; top: 100%; background: #fff; border: 1px solid #e5e5e3; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.1); z-index: 50; min-width: 120px; overflow: hidden; }
.dropdown-item { padding: 9px 14px; font-size: 13px; cursor: pointer; color: #1a1a18; }
.dropdown-item:hover { background: #f3f2ef; }
.dropdown-item.danger { color: #D85A30; }
.bottom-bar { display: flex; align-items: center; gap: 6px; margin-top: auto; }
.btn-settings { padding: 7px 10px; border-radius: 8px; border: none; background: none; cursor: pointer; font-size: 16px; color: #aaa; }
.btn-settings:hover { background: #f3f2ef; }
</style>