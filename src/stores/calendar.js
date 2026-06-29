import { ref, computed } from 'vue'
import { db, auth } from '../firebase'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, orderBy, serverTimestamp
} from 'firebase/firestore'

// ── State ──
export const events = ref([])
export const groups = ref([])
export const selectedGroupId = ref(null)
export const currentView = ref('month')
export const currentDate = ref(new Date())

// ── Filtered Events ──
export const filteredEvents = computed(() => {
  if (!selectedGroupId.value) return events.value
  return events.value.filter(e => e.groupId === selectedGroupId.value)
})

// ── Colors ──
export const COLORS = [
  { bg: '#E6F1FB', text: '#185FA5', dot: '#378ADD' },
  { bg: '#E1F5EE', text: '#0F6E56', dot: '#1D9E75' },
  { bg: '#FAEEDA', text: '#854F0B', dot: '#BA7517' },
  { bg: '#FAECE7', text: '#993C1D', dot: '#D85A30' },
  { bg: '#EEEDFE', text: '#3C3489', dot: '#534AB7' },
]

// ── Firestore subscriptions ──
let unsubEvents = null
let unsubGroups = null

export function subscribeData(uid) {
  if (unsubEvents) unsubEvents()
  if (unsubGroups) unsubGroups()

  const evQ = query(
    collection(db, 'events'),
    where('members', 'array-contains', uid),
    orderBy('date')
  )
  unsubEvents = onSnapshot(evQ, snap => {
    events.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })

  const grQ = query(
    collection(db, 'groups'),
    where('members', 'array-contains', uid)
  )
  unsubGroups = onSnapshot(grQ, snap => {
    groups.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
}

export function unsubscribeData() {
  if (unsubEvents) { unsubEvents(); unsubEvents = null }
  if (unsubGroups) { unsubGroups(); unsubGroups = null }
}

// ── Event CRUD ──
export async function addEvent(data, uid) {
  let members = [uid]
  if (data.groupId) {
    const g = groups.value.find(g => g.id === data.groupId)
    if (g?.members) members = [...new Set([...members, ...g.members])]
  }
  const docRef = await addDoc(collection(db, 'events'), {
    ...data, members, ownerId: uid, createdAt: serverTimestamp()
  })
  return docRef.id
}

export async function updateEvent(id, data, uid) {
  let members = [uid]
  if (data.groupId) {
    const g = groups.value.find(g => g.id === data.groupId)
    if (g?.members) members = [...new Set([...members, ...g.members])]
  }
  await updateDoc(doc(db, 'events', id), { ...data, members })
}

export async function deleteEvent(id) {
  await deleteDoc(doc(db, 'events', id))
}

// ── Group CRUD ──
export async function addGroup(data, uid) {
  await addDoc(collection(db, 'groups'), {
    ...data, ownerId: uid, members: [uid], createdAt: serverTimestamp()
  })
}

export async function deleteGroup(id) {
  await deleteDoc(doc(db, 'groups', id))
}

// ── Helpers ──
export function dateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}