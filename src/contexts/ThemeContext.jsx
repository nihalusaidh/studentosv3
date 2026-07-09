import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { themes, defaultTheme } from '../themes/themeConfig'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { user, profile } = useAuth()
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('student-os-theme')
    return saved || defaultTheme
  })

  const applyTheme = useCallback((themeId) => {
    const theme = themes[themeId]
    if (!theme) return
    const root = document.documentElement
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    root.setAttribute('data-theme', themeId)
    localStorage.setItem('student-os-theme', themeId)
    setCurrentTheme(themeId)
  }, [])

  useEffect(() => {
    applyTheme(currentTheme)
  }, [currentTheme, applyTheme])

  useEffect(() => {
    if (profile?.theme && profile.theme !== currentTheme) {
      applyTheme(profile.theme)
    }
  }, [profile?.theme])

  const changeTheme = async (themeId) => {
    applyTheme(themeId)
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { theme: themeId })
      } catch (e) {
        console.error('Failed to save theme')
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ currentTheme: themes[currentTheme], currentThemeId: currentTheme, changeTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
