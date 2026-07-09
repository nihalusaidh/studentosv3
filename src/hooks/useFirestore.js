import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useFirestore(collectionName, customQuery = null) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid && !customQuery) return
    const constraints = customQuery || [where('uid', '==', user.uid)]
    const q = query(collection(db, collectionName), ...constraints)
    const unsub = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error(`Firestore error on ${collectionName}:`, err)
      setLoading(false)
    })
    return unsub
  }, [user?.uid, collectionName])

  const add = async (item) => {
    if (!user?.uid) throw new Error('Not authenticated')
    return addDoc(collection(db, collectionName), { ...item, uid: user.uid, createdAt: new Date().toISOString() })
  }

  const remove = async (id) => {
    return deleteDoc(doc(db, collectionName, id))
  }

  const update = async (id, updates) => {
    return updateDoc(doc(db, collectionName, id), updates)
  }

  return { data, loading, add, remove, update }
}
