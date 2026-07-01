<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <div class="sheet" @click.stop>
      <div class="sheet-handle"></div>
      <div class="modal-header">
        <h3>{{ group?.name }} のメンバー</h3>
        <span class="member-count">{{ members.length }}人</span>
      </div>

      <div v-if="members.length === 0" class="empty">
        <div class="empty-text">メンバーがいません</div>
      </div>

      <div v-else class="member-list">
        <div v-for="m in members" :key="m" class="member-row">
          <div class="member-avatar" :style="{ background: group ? COLORS[group.colorIdx||0].bg : '#E6F1FB', color: group ? COLORS[group.colorIdx||0].text : '#185FA5' }">
            {{ m.slice(0, 2).toUpperCase() }}
          </div>
          <div class="member-info">
            <div class="member-name">{{ memberNames[m] || m }}</div>
            <div v-if="m === group?.ownerId" class="member-badge">オーナー</div>
          </div>
        </div>
      </div>

      <button class="btn-invite" @click="$emit('share', group?.id)">
        ＋ メンバーを招待
      </button>
      <button class="btn-close" @click="$emit('close')">閉じる</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { groups, COLORS } from '../stores/calendar'
import { fetchUserName } from '../stores/calendar'

const props = defineProps({
  groupId: String
})
defineEmits(['close', 'share'])

const group = computed(() => groups.value.find(g => g.id === props.groupId))
const members = computed(() => group.value?.members || [])

const memberNames = ref({})

watch(members, async (uids) => {
  for (const uid of uids) {
    if (!memberNames.value[uid]) {
      memberNames.value[uid] = await fetchUserName(uid)
    }
  }
}, { immediate: true })
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: flex-end; justify-content: center; z-index: 100; }
@media(min-width:500px){ .overlay { align-items: center; } }
.sheet { background: #fff; border-radius: 20px 20px 0 0; padding: 20px; width: 100%; max-width: 420px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
@media(min-width:500px){ .sheet { border-radius: 16px; } }
.sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: #ddd; margin: 0 auto -4px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; }
h3 { font-size: 16px; font-weight: 600; }
.member-count { font-size: 12px; color: #aaa; background: #f3f2ef; padding: 2px 10px; border-radius: 10px; }
.empty { padding: 24px 0; text-align: center; }
.empty-text { font-size: 14px; color: #aaa; }
.member-list { display: flex; flex-direction: column; gap: 8px; }
.member-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; background: #f8f8f7; }
.member-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.member-info { display: flex; flex-direction: column; gap: 2px; }
.member-name { font-size: 13px; font-weight: 500; color: #1a1a18; }
.member-badge { font-size: 10px; color: #aaa; }
.btn-invite { padding: 10px; font-size: 13px; font-weight: 500; background: #378ADD; color: #fff; border: none; border-radius: 10px; cursor: pointer; width: 100%; }
.btn-invite:hover { opacity: .88; }
.btn-close { padding: 10px; font-size: 14px; border: 1px solid #ddd; border-radius: 10px; background: none; cursor: pointer; color: #666; width: 100%; }
.btn-close:hover { background: #f3f2ef; }
</style>