<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="sheet">
      <div class="sheet-handle"></div>
      <h3>{{ event ? 'イベントを編集' : 'イベントを追加' }}</h3>

      <div class="field">
        <label>タイトル</label>
        <input v-model="form.title" placeholder="例：ゼミ発表" />
      </div>
      <div class="field">
        <label>日付</label>
        <input v-model="form.date" type="date" />
      </div>
      <div class="field">
        <label>開始時刻（任意）</label>
        <input v-model="form.startTime" type="time" />
      </div>
      <div class="field">
        <label>終了時刻（任意）</label>
        <input v-model="form.endTime" type="time" />
      </div>
      <div class="field">
        <label>グループ</label>
        <select v-model="form.groupId">
          <option value="">なし</option>
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
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
import { ref, watch } from 'vue'
import { groups } from '../stores/calendar'

const props = defineProps({
  event: Object,
  defaultDate: String,
  user: Object
})
const emit = defineEmits(['close', 'save', 'delete'])

const isOwner = props.event?.ownerId === props.user?.uid

const form = ref({
  title: '',
  date: props.defaultDate || '',
  startTime: '',
  endTime: '',
  groupId: '',
  memo: ''
})

watch(() => props.event, ev => {
  if (ev) {
    form.value = {
      title: ev.title || '',
      date: ev.date || '',
      startTime: ev.startTime || '',
      endTime: ev.endTime || '',
      groupId: ev.groupId || '',
      memo: ev.memo || ''
    }
  }
}, { immediate: true })

function submit() {
  if (!form.value.title || !form.value.date) return
  emit('save', { ...form.value, id: props.event?.id, gcalEventId: props.event?.gcalEventId })
}
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
</style>