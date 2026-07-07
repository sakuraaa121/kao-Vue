<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <div class="sheet" @click.stop>
      <div class="sheet-handle"></div>
      <h3>{{ event ? 'イベントを編集' : 'イベントを追加' }}</h3>

      <div class="field">
        <label>タイトル</label>
        <input ref="titleInput" v-model="form.title" placeholder="例：ゼミ発表" @input="titleError = ''" />
        <div v-if="titleError" class="field-error">{{ titleError }}</div>
      </div>

      <div class="field-row">
        <label class="toggle-label">
          <span>終日</span>
          <div :class="['toggle', { on: form.allDay }]" @click="form.allDay = !form.allDay">
            <div class="toggle-knob"></div>
          </div>
        </label>
      </div>
      <div class="field">
        <label>開始日</label>
        <input v-model="form.date" type="date" @change="onStartDateChange" />
      </div>
      <template v-if="!form.allDay">
      <div class="field">
      　 <label>開始時刻</label>
        <TimePicker :modelValue="form.startTime" @update:modelValue="onStartTimeChange" />
      </div>
      </template>
      <div class="field">
        <label>終了日</label>
        <input v-model="form.endDate" type="date" :min="form.date" />
      </div>
      <template v-if="!form.allDay">
        <div class="field">
          <label>終了時刻</label>
          <TimePicker
            :modelValue="form.endTime"
            :minTime="form.date === form.endDate ? form.startTime : undefined"
            @update:modelValue="onEndTimeChange"
          />
          <div v-if="endTimeError" class="field-error">{{ endTimeError }}</div>
        </div>
      </template>
      <div class="field">
        <label>グループ</label>
        <select v-model="form.groupId">
          <option value="">なし</option>
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </div>
      <div class="field">
        <label>カラー</label>
        <div class="swatches">
          <div
            v-for="(c, i) in COLORS"
            :key="i"
            :class="['swatch', { sel: form.colorIdx === i }]"
            :style="{ background: c.dot }"
            @click="form.colorIdx = i"
          ></div>
        </div>
      </div>
      <div class="field">
        <label>メモ</label>
        <textarea v-model="form.memo" rows="2" placeholder="任意"></textarea>
      </div>

      <div class="actions">
        <button v-if="event && isOwner" class="btn-del" @click="$emit('delete', event.id)">削除</button>
        <button class="btn-cancel" @click="$emit('close')">キャンセル</button>
        <button class="btn-save" @click="submit">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { groups, COLORS } from '../stores/calendar'
import TimePicker from './TimePicker.vue'

import { ref, reactive, watch, onMounted, nextTick } from 'vue'

const titleInput = ref(null)

onMounted(async () => {
  if (!props.event) {
    await nextTick()
    titleInput.value?.focus()
  }
})

const props = defineProps({
  event: Object,
  defaultDate: String,
  defaultGroupId: String,
  user: Object
})
const emit = defineEmits(['close', 'save', 'delete'])

const isOwner = props.event?.ownerId === props.user?.uid

const form = reactive({
  title: '',
  date: props.defaultDate || '',
  endDate: props.defaultDate || '',
  allDay: false,
  startTime: '08:00',
  endTime: '09:00',
  groupId: props.defaultGroupId || '',
  colorIdx: 0,
  memo: ''
})

watch(() => props.event, ev => {
  if (ev) {
    form.title = ev.title || ''
    form.date = ev.date || ''
    form.endDate = ev.endDate || ev.date || ''
    form.allDay = ev.allDay ?? true
    form.startTime = ev.startTime || ''
    form.endTime = ev.endTime || ''
    form.groupId = ev.groupId || ''
    form.colorIdx = ev.colorIdx ?? 0
    form.memo = ev.memo || ''
  }
}, { immediate: true })

function submit() {
  titleError.value = ''
  if (!form.title) {
    titleError.value = 'タイトルを入力してください'
    return
  }
  if (!form.date) return
  const endDate = form.endDate || form.date
  if (!form.allDay && form.date === endDate && form.endTime && form.startTime && form.endTime <= form.startTime) {
    endTimeError.value = '終了時刻は開始時刻より後にしてください'
    return
  }
  endTimeError.value = ''
  emit('save', { ...form, id: props.event?.id, gcalEventId: props.event?.gcalEventId })
}

function onStartDateChange() {
  if (!form.endDate || form.endDate < form.date) {
    form.endDate = form.date
  }
}

function onStartTimeChange(newTime) {
  form.startTime = newTime
  if (!form.endTime) {
    form.endTime = addHour(newTime)
    return
  }
  if (newTime >= form.endTime) {
    form.endTime = addHour(newTime)
  }
}

function addHour(time) {
  const [h, m] = time.split(':').map(Number)
  if (h >= 23) return '23:59'
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const endTimeError = ref('')

function onEndTimeChange(newTime) {
  if (form.date === form.endDate && newTime <= form.startTime) {
    endTimeError.value = '終了時刻は開始時刻より後にしてください'
    return
  }
  endTimeError.value = ''
  form.endTime = newTime
}

const titleError = ref('')
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: flex-end; justify-content: center; z-index: 100; }
@media(min-width:500px){ .overlay { align-items: center; } }
.sheet { background: #fff; border-radius: 20px 20px 0 0; padding: 20px; width: 100%; max-width: 420px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
@media(min-width:500px){ .sheet { border-radius: 16px; } }
.sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: #ddd; margin: 0 auto -4px; }
h3 { font-size: 17px; font-weight: 600; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 12px; color: #666; font-weight: 500; }
.field input, .field select, .field textarea { font-size: 14px; padding: 11px 13px; border: 1px solid #ddd; border-radius: 10px; background: #f8f8f7; color: #1a1a18; width: 100%; outline: none; }
.field input:focus, .field select:focus { border-color: #378ADD; box-shadow: 0 0 0 3px rgba(55,138,221,.15); }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.btn-cancel { padding: 9px 16px; font-size: 14px; border: 1px solid #ddd; border-radius: 10px; background: none; cursor: pointer; color: #666; }
.btn-save { padding: 9px 18px; font-size: 14px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 10px; cursor: pointer; }
.btn-del { padding: 9px 14px; font-size: 14px; border: 1px solid #fcc; border-radius: 10px; background: none; cursor: pointer; color: #D85A30; margin-right: auto; }
.swatches { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.swatch { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: transform .1s; }
.swatch.sel { border-color: #333; transform: scale(1.1); }
.field-row { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; }
.toggle-label { display: flex; align-items: center; justify-content: space-between; width: 100%; cursor: pointer; font-size: 14px; color: #1a1a18; }
.toggle { width: 40px; height: 22px; border-radius: 11px; background: #ddd; position: relative; transition: background .2s; cursor: pointer; flex-shrink: 0; }
.toggle.on { background: #378ADD; }
.toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px; transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.toggle.on .toggle-knob { left: 20px; }
.field-error { font-size: 11px; color: #D85A30; margin-top: 2px; }
</style>