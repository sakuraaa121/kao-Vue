<template>
  <div id="app">
    <!-- ローディング -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>読み込み中...</span>
    </div>

    <!-- 認証画面 -->
    <div v-else-if="!user" class="auth-screen">
      <div class="auth-logo">📅</div>
      <div class="auth-title">Calendar</div>
      <div class="auth-sub">Googleアカウントでサインイン。Mac・iOSどちらでも同じカレンダーが使えます。</div>
      <div class="auth-card">
        <button class="btn-google" @click="signIn">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.2 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
          Googleでサインイン
        </button>
        <div v-if="authError" class="auth-err">{{ authError }}</div>
      </div>
    </div>

    <!-- メイン画面 -->
    <div v-else class="main-screen">
      <Sidebar
        :currentDate="currentDate"
        :user="user"
        :gcalSignedIn="gcalSignedIn"
        @prev="prevMonth"
        @next="nextMonth"
        @goto="gotoDate"
        @new-group="showGroupModal = true"
        @share="openShare"
        @delete-group="confirmDeleteGroup"
        @gcal="gcalSignIn"
        @signout="signOutUser"
        @settings="showSettingsModal = true"
      />
      <div class="cal-main">
        <!-- ツールバー -->
        <div class="toolbar">
          <div class="toolbar-left">
            <button class="btn-nav" @click="prevMonth">‹</button>
            <button class="btn-today" @click="goToday">今日</button>
            <button class="btn-nav" @click="nextMonth">›</button>
            <span class="cal-title">{{ calTitle }}</span>
          </div>
          <button
            v-if="selectedGroupId"
            class="btn-members"
            @click="showMemberModal = true"
          >👥 メンバー</button>
          <button class="btn-add" @click="openAddEvent(null)">＋ 追加</button>
        </div>

        <!-- カレンダー -->
        <CalendarGrid
          :currentDate="currentDate"
          @add-event="date => { selectedDay = date; showDayView = true }"
          @edit-event="openEditEvent"
        />
      </div>
    </div>

    <!-- イベントモーダル -->
    <EventModal
      v-if="showEventModal"
      :event="editingEvent"
      :defaultDate="defaultDate"
      :defaultGroupId="defaultGroupId"
      :user="user"
      @close="showEventModal = false"
      @save="saveEvent"
      @delete="deleteEventHandler"
    />

    <!-- グループモーダル -->
    <GroupModal
      v-if="showGroupModal"
      @close="showGroupModal = false"
      @save="saveGroup"
    />

    <!-- 日ビュー -->
    <DayView
      v-if="showDayView"
      :date="selectedDay"
      @close="showDayView = false"
      @add="openAddEvent"
      @edit="ev => { showDayView = false; openEditEvent(ev) }"
    />

    <!-- メンバーモーダル -->
    <MemberModal
      v-if="showMemberModal"
      :groupId="selectedGroupId"
      @close="showMemberModal = false"
      @share="openShare"
    />

    <!-- 設定モーダル -->
    <SettingsModal
      v-if="showSettingsModal"
      :currentName="user?.displayName || user?.email"
      :currentTheme="theme"
      @close="showSettingsModal = false"
      @save="saveDisplayName"
    />

    <!-- トースト -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth, provider } from './firebase'
import { signInWithPopup, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'
import { getDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from './firebase'
import {
  subscribeData, unsubscribeData,
  addEvent, updateEvent, deleteEvent, addGroup, deleteGroup,
  dateStr, COLORS, groups, events, selectedGroupId
} from './stores/calendar'
import Sidebar from './components/Sidebar.vue'
import CalendarGrid from './components/CalendarGrid.vue'
import EventModal from './components/EventModal.vue'
import GroupModal from './components/GroupModal.vue'
import DayView from './components/DayView.vue'
import MemberModal from './components/MemberModal.vue'
import SettingsModal from './components/SettingsModal.vue'

const MONTHS_JP = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

// ── State ──
const theme = ref(localStorage.getItem('cal_theme') || 'system')
const loading = ref(true)
const user = ref(null)
const authError = ref('')
const currentDate = ref(new Date())
const showEventModal = ref(false)
const showGroupModal = ref(false)
const editingEvent = ref(null)
const defaultDate = ref('')
const defaultGroupId = ref('')
const toastMsg = ref('')
const toastVisible = ref(false)
const gcalSignedIn = ref(false)
const showDayView = ref(false)
const selectedDay = ref(null)
const showMemberModal = ref(false)
const showSettingsModal = ref(false)

// ── Computed ──
const calTitle = computed(() =>
  `${currentDate.value.getFullYear()}年 ${MONTHS_JP[currentDate.value.getMonth()]}`
)

import { saveUserProfile } from './firebase'

onAuthStateChanged(auth, u => {
  loading.value = false
  user.value = u
  if (u) {
    saveUserProfile(u.uid, u.displayName || u.email, u.email)
    subscribeData(u.uid)
    setTimeout(handleJoinLink, 1000)
  } else {
    unsubscribeData()
  }
})

async function signIn() {
  authError.value = ''
  try {
    await signInWithPopup(auth, provider)
  } catch (e) {
    authError.value = e.code === 'auth/popup-blocked'
      ? 'ポップアップがブロックされました。許可してから再度お試しください。'
      : e.message
  }
}

async function signOutUser() {
  await signOut(auth)
}

// ── Navigation ──
function prevMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}
function nextMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}
function goToday() {
  currentDate.value = new Date()
}
function gotoDate(date) {
  currentDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
  selectedDay.value = date
  showDayView.value = true
}

async function saveDisplayName({ displayName: name, theme: newTheme }) {
  try {
    await updateProfile(auth.currentUser, { displayName: name })
    await saveUserProfile(auth.currentUser.uid, name, auth.currentUser.email)
    applyTheme(newTheme)
    showSettingsModal.value = false
    showToast('設定を保存しました')
  } catch (e) {
    showToast('変更に失敗しました: ' + e.message)
  }
}

async function handleJoinLink() {
  const params = new URLSearchParams(location.search)
  const gid = params.get('join')
  console.log('join gid:', gid)
  console.log('user:', user.value?.uid)
  if (!gid || !user.value) return
  try {
    const gref = doc(db, 'groups', gid)
    const gsnap = await getDoc(gref)
    console.log('gsnap exists:', gsnap.exists())
    if (!gsnap.exists()) {
      showToast('グループが見つかりません')
      return
    }
    const gdata = gsnap.data()
    console.log('gdata:', gdata)
    if (!gdata.members.includes(user.value.uid)) {
      await updateDoc(gref, { members: [...gdata.members, user.value.uid] })
      showToast(`「${gdata.name}」に参加しました！`)
    } else {
      showToast('すでにグループのメンバーです')
    }
    window.history.replaceState({}, '', location.pathname)
  } catch (e) {
    console.error('join error:', e)
    showToast('参加に失敗しました: ' + e.message)
  }
}

// ── Event handlers ──
function openAddEvent(date) {
  editingEvent.value = null
  defaultDate.value = date ? dateStr(date) : dateStr(new Date())
  defaultGroupId.value = selectedGroupId.value || ''
  showDayView.value = false
  showEventModal.value = true
}

function openEditEvent(ev) {
  editingEvent.value = ev
  showEventModal.value = true
}

async function saveEvent(form) {
  console.log('saveEvent called:', form)
  try {
    if (form.id) {
      await updateEvent(form.id, form, user.value.uid)
    } else {
      await addEvent(form, user.value.uid)
    }
    showEventModal.value = false
    showToast(form.id ? '更新しました' : 'イベントを追加しました')
  } catch (e) {
    console.error('saveEvent error:', e)
    showToast('保存に失敗しました: ' + e.message)
  }
}

async function deleteEventHandler(id) {
  if (!confirm('このイベントを削除しますか？')) return
  try {
    await deleteEvent(id)
    showEventModal.value = false
    showToast('削除しました')
  } catch (e) {
    showToast('削除に失敗しました')
  }
}

// ── Group handlers ──
async function saveGroup(data) {
  try {
    await addGroup(data, user.value.uid)
    showGroupModal.value = false
    showToast('グループを作成しました')
  } catch (e) {
    showToast('作成に失敗しました: ' + e.message)
  }
}

async function confirmDeleteGroup(id, name) {
  if (!confirm(`「${name}」を削除しますか？`)) return
  try {
    await deleteGroup(id)
    showToast('グループを削除しました')
  } catch (e) {
    showToast('削除に失敗しました')
  }
}

function openShare(gid) {
  const g = groups.value.find(g => g.id === gid)
  if (!g) return
  const link = `${location.origin}${location.pathname}?join=${gid}`
  prompt(`「${g.name}」の招待リンク（コピーして共有してください）`, link)
}

// ── Google Calendar ──
function gcalSignIn() {
  showToast('Google Calendar連携は準備中です')
}

// ── Toast ──
function showToast(msg) {
  toastMsg.value = msg
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 2200)
}

function applyTheme(t) {
  const root = document.documentElement
  root.removeAttribute('data-theme')
  if (t === 'true-dark') {
    root.setAttribute('data-theme', 'true-dark')
  } else if (t === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else if (t === 'light') {
    root.setAttribute('data-theme', 'light')
  }
  localStorage.setItem('cal_theme', t)
  theme.value = t
}

// 起動時に適用
applyTheme(theme.value)
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; background: #f8f8f7; color: #1a1a18; }
.loading { height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; color: #aaa; }
.spinner { width: 28px; height: 28px; border: 2px solid #ddd; border-top-color: #378ADD; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.auth-screen { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 32px; }
.auth-logo { font-size: 48px; }
.auth-title { font-size: 24px; font-weight: 600; }
.auth-sub { font-size: 14px; color: #666; text-align: center; max-width: 280px; line-height: 1.6; }
.auth-card { background: #fff; border: 1px solid #e5e5e3; border-radius: 16px; padding: 24px; width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 14px; }
.btn-google { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px; font-size: 15px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 10px; cursor: pointer; }
.btn-google:hover { opacity: .88; }
.auth-err { font-size: 13px; color: #D85A30; text-align: center; }
.main-screen { height: 100%; display: flex; overflow: hidden; }
.cal-main { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.toolbar { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #e5e5e3; background: #fff; flex-shrink: 0; }
.toolbar-left { display: flex; align-items: center; gap: 6px; flex: 1; }
.cal-title { font-size: 15px; font-weight: 600; }
.btn-today { padding: 5px 11px; font-size: 12px; border: 1px solid #ccc; border-radius: 7px; background: none; cursor: pointer; color: #666; }
.btn-today:hover { background: #f3f2ef; }
.btn-nav { background: none; border: none; cursor: pointer; color: #666; padding: 4px 8px; border-radius: 6px; font-size: 16px; }
.btn-nav:hover { background: #f3f2ef; }
.btn-add { display: flex; align-items: center; gap: 4px; padding: 7px 13px; font-size: 13px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.btn-add:hover { opacity: .88; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1a1a18; color: #f8f8f7; padding: 10px 18px; border-radius: 20px; font-size: 13px; z-index: 200; pointer-events: none; opacity: 0; transition: opacity .2s; }
.toast.show { opacity: 1; }
.btn-members { display: flex; align-items: center; gap: 4px; padding: 7px 13px; font-size: 13px; font-weight: 500; background: #f3f2ef; color: #1a1a18; border: 1px solid #e5e5e3; border-radius: 8px; cursor: pointer; }
.btn-members:hover { background: #e5e5e3; }
[data-theme="dark"] {
  --bg: #0F0F0E;
  --surface: #1C1C1A;
  --surface2: #252522;
  --text: #F0EFE8;
  --text2: #9B9B95;
  --border: rgba(255,255,255,0.08);
  --border2: rgba(255,255,255,0.14);
}

[data-theme="dark"] body,
[data-theme="dark"] #app {
  background: #0F0F0E;
  color: #F0EFE8;
}

[data-theme="dark"] .sidebar,
[data-theme="dark"] .cal-main,
[data-theme="dark"] .toolbar {
  background: #1C1C1A;
  border-color: rgba(255,255,255,0.08);
}

[data-theme="dark"] .cal-cell {
  border-color: rgba(255,255,255,0.08);
}

[data-theme="dark"] .cal-cell:hover {
  background: #252522;
}

[data-theme="dark"] .today-cell {
  background: #0D2845;
}

[data-theme="dark"] .sheet {
  background: #1C1C1A;
  color: #F0EFE8;
}

[data-theme="dark"] .field input,
[data-theme="dark"] .field select,
[data-theme="dark"] .field textarea {
  background: #252522;
  color: #F0EFE8;
  border-color: rgba(255,255,255,0.14);
}

[data-theme="dark"] .group-row:hover,
[data-theme="dark"] .group-row.active {
  background: #252522;
}

[data-theme="dark"] .user-pill {
  background: #252522;
}

[data-theme="dark"] .btn-today,
[data-theme="dark"] .btn-nav {
  color: #9B9B95;
}

[data-theme="dark"] .btn-today:hover,
[data-theme="dark"] .btn-nav:hover {
  background: #252522;
}

[data-theme="true-dark"] * {
  color: #000 !important;
  background: #000 !important;
  border-color: #000 !important;
  box-shadow: none !important;
  text-shadow: none !important;
}
</style>