import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wasLoggedIn, setWasLoggedIn] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (docSnap.exists()) {
          const data = docSnap.data()
          setProfile(data)
          if (!wasLoggedIn) {
            setWasLoggedIn(true)
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              loginCount: increment(1),
              lastActiveAt: serverTimestamp()
            }, { merge: true })
            setProfile(prev => prev ? { ...prev, loginCount: (prev.loginCount || 0) + 1 } : prev)
          }
        } else {
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
        setWasLoggedIn(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  }

  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', result.user.uid))
    if (snap.exists()) {
      setProfile(snap.data())
      await setDoc(doc(db, 'users', result.user.uid), {
        loginCount: increment(1),
        lastActiveAt: serverTimestamp()
      }, { merge: true })
    }
    return result.user
  }

  const signUpWithEmail = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const newProfile = {
      email: result.user.email,
      displayName: email.split('@')[0],
      tokens: 0,
      loginCount: 1,
      plan: 'free',
      role: 'user',
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    }
    await setDoc(doc(db, 'users', result.user.uid), newProfile)
    setProfile(newProfile)
    return result.user
  }

  const logout = async () => {
    await signOut(auth)
    setProfile(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, loginWithEmail, signUpWithEmail, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
