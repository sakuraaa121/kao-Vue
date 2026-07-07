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

      <div class="field">
        <label>テーマ</label>
        <div class="theme-options">
          <div
            v-for="t in themes"
            :key="t.value"
            :class="['theme-option', { active: selectedTheme === t.value }]"
            @click="selectedTheme = t.value"
          >
            <div class="theme-preview" :class="t.value"></div>
            <span>{{ t.label }}</span>
          </div>
        </div>
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
  currentName: String,
  currentTheme: String
})
const emit = defineEmits(['close', 'save'])

const displayName = ref(props.currentName || '')
const selectedTheme = ref(props.currentTheme || 'system')

const themes = [
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
  { value: 'system', label: 'システム' },
]

function submit() {
  if (!displayName.value.trim()) return
  emit('save', { displayName: displayName.value.trim(), theme: selectedTheme.value })
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
.theme-options { display: flex; gap: 10px; margin-top: 4px; }
.theme-option { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; padding: 8px 12px; border-radius: 10px; border: 1px solid #ddd; flex: 1; }
.theme-option.active { border-color: #378ADD; background: #E6F1FB; }
.theme-option span { font-size: 12px; color: #666; }
.theme-option.active span { color: #378ADD; font-weight: 500; }
.theme-preview { width: 40px; height: 28px; border-radius: 6px; border: 1px solid #ddd; }
.theme-preview.light { background: #fff; }
.theme-preview.dark { background: #1a1a18; }
.theme-preview.system { background: linear-gradient(135deg, #fff 50%, #1a1a18 50%); }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.btn-cancel { padding: 9px 16px; font-size: 14px; border: 1px solid #ddd; border-radius: 10px; background: none; cursor: pointer; color: #666; }
.btn-save { padding: 9px 18px; font-size: 14px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 10px; cursor: pointer; }
</style>