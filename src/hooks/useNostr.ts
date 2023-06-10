import { useEffect }  from 'react'
import { useLogin }   from './useLogin.js'
import { useProfile } from './useProfile.js'
import { useClient }  from './useClient.js'
import { useRoom }    from './useRoom.js'
import { useStore }   from './useStore.js'
import { NostrStore } from '../schema/types.js'

export function useNostrStore (
  defaults : NostrStore
) {
  const defaultStore = useStore(defaults)
  const { store, update } = defaultStore
  const { client, connection } = store

  useEffect(() => {
    if (client !== undefined && connection === 'ok') {
      update({ isConnected: true })
    } else {
      update({ isConnected: false })
    }
  }, [ client, connection ])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('NostrStore:', store)
    }
  }, [ store ])

  function setError (err : Error | string) {
    if (err instanceof Error) {
      const { message } = err
      console.error(err)
      update({ error: message })
    } else {
      console.error('Error:', err)
      update({ error: err })
    }
  }

  const nostrStore = { ...defaultStore, setError }

  return {
    ...nostrStore,
    ...useClient(nostrStore),
    ...useLogin(nostrStore),
    ...useProfile(nostrStore),
    ...useRoom(nostrStore)
    // signer : useSigner(nostrStore)
  }
}
