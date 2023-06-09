import { useEffect }       from 'react'
import { useLogin }        from './useLogin.js'
import { useProfile }      from './useProfile.js'
import { useClient }       from './useClient.js'
import { useRoom }         from './useRoom.js'
import { Hooks, useStore } from './useStore.js'
import { NostrStore }      from '../schema/types.js'

export function useNostrStore (
  defaults : NostrStore,
  hooks    : Hooks<NostrStore> = {}
) {
  const nostrStore = useStore(defaults, hooks)
  const { store, update } = nostrStore
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

  return {
    ...nostrStore,
    ...useClient(nostrStore),
    ...useLogin(nostrStore),
    ...useProfile(nostrStore),
    ...useRoom(nostrStore)
    // signer : useSigner(nostrStore)
  }
}
