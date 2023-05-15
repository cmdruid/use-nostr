import {
  createContext,
  ReactElement,
  useContext
} from 'react'

import { useProfile } from './hooks/useProfile.js'

type ProfileContext = ReturnType<typeof useProfile>

// Create our provider context.
const context = createContext<ProfileContext | null>(null)

export function ProfileProvider (
  { children } : { children : ReactElement | ReactElement[] }
) : ReactElement {
  // Returns the Provider that wraps our app and
  // passes down the context object.
  const ctx = useProfile()
  return (
    <context.Provider value={ctx}>
      {children}
    </context.Provider>
  )
}

export function useNostrProfile () {
  const ctx = useContext(context)
  if (ctx === null) {
    throw new Error('Context is null!')
  }
  return ctx
}
