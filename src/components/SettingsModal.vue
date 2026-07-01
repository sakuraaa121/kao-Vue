<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <div class="sheet" @click.stop>
      <div class="sheet-handle"></div>
      <h3>設定</h3>

      <div class="field">
        <label>表示名</label>
        <input v-model="displayName" placeholder="例：Yuya" />
        <div class="field-note">グループのメンバー一覧に表示される名前です</div>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="$emit('close')">キャンセル</button>
        <button class="btn-save" @click="submit">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentName: String
})
const emit = defineEmits(['close', 'save'])

const displayName = ref(props.currentName || '')

function submit() {
  if (!displayName.value.trim()) return
  emit('save', displayName.value.trim())
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: flex-end; justify-content: center; z-index: 100; }
@media(min-width:500px){ .overlay { align-items: center; } }
.sheet { background: #fff; border-radius: 20px 20px 0 0; padding: 20px; width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 14px; }
@media(min-width:500px){ .sheet { border-radius: 16px; } }
.sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: #ddd; margin: 0 auto -4px; }
h3 { font-size: 17px; font-weight: 600; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 12px; color: #666; font-weight: 500; }
.field input { font-size: 14px; padding: 11px 13px; border: 1px solid #ddd; border-radius: 10px; background: #f8f8f7; color: #1a1a18; width: 100%; outline: none; }
.field input:focus { border-color: #378ADD; box-shadow: 0 0 0 3px rgba(55,138,221,.15); }
.field-note { font-size: 11px; color: #aaa; }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.btn-cancel { padding: 9px 16px; font-size: 14px; border: 1px solid #ddd; border-radius: 10px; background: none; cursor: pointer; color: #666; }
.btn-save { padding: 9px 18px; font-size: 14px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 10px; cursor: pointer; }
</style>