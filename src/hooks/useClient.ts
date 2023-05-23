import { useEffect } from 'react'
import { StoreAPI }  from './useStore.js'
import { NostrStore } from '../schema/types.js'
import { Event as SignedEvent, Filter, SimplePool } from 'nostr-tools'

export function useClient ({ store, setError, update } : StoreAPI<NostrStore>) {
  const { pubkey, relays } = store
  const pool = new SimplePool()

  useEffect(() => {
    if (relays.length > 0) {
      update({ connection: 'conn' })
      void connected().then(connected => {
        if (connected) {
          update({
            client,
            connection: 'ok'
          })
        } else {
          update({
            connection : 'error',
            error      : 'client failed to connect'
          })
        }
      })
    } else {
      update({ client: undefined, connection: 'none' })
    }
  }, [ pubkey, relays ])

  async function connected () : Promise<boolean> {
    if (relays.length === 0) {
      setError('Relay list is empty!')
      return false
    }
    return new Promise(resolve => {
      void pool.get(relays, { kinds: [ 1 ], limit: 1 })
        .then(e => { resolve(e !== null) })
    })
  }

  const client = {
    connected,
    get  : async (filter  : Filter)      => pool.get(relays, filter),
    list : async (filters : Filter[])    => pool.list(relays, filters),
    pub  : async (event   : SignedEvent) => pool.publish(relays, event),
    sub  : async (filters : Filter[])    => pool.sub(relays, filters)
  }

  return { client }
}
