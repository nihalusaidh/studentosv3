import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'

const PremiumContext = createContext(null)

export function PremiumProvider({ children }) {
  const { profile } = useAuth()

  const isPremium = profile?.plan === 'premium'

  return (
    <PremiumContext.Provider value={{ isPremium }}>
      {children}
    </PremiumContext.Provider>
  )
}

export const usePremium = () => useContext(PremiumContext)
