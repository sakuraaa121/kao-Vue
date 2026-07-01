import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyD7j0oYtrki-wTTQRlT8MD3NwhMC3YdwB0",
  authDomain:        "kao-vue-d2663.firebaseapp.com",
  projectId:         "kao-vue-d2663",
  storageBucket:     "kao-vue-d2663.firebasestorage.app",
  messagingSenderId: "293938883185",
  appId:             "1:293938883185:web:752c0fe6ea7242cfff49d0"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)

export async function saveUserProfile(uid, displayName, email) {
  await setDoc(doc(db, 'users', uid), { displayName, email }, { merge: true })
}