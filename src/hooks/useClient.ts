import { useEffect }    from 'react'
import { StoreAPI }     from './useStore.js'
import { NostrStore }   from '../schema/types.js'
import { publishEvent } from '../lib/publish.js'

import { Event, EventTemplate, Filter, SimplePool } from 'nostr-tools'

export function useClient ({ store, setError, update } : StoreAPI<NostrStore>) {
  const { pubkey, relays, signer } = store
  const pool = new SimplePool()

  useEffect(() => {
    if (relays.length > 0) {
      update({ client, connection: 'conn' })
      void connected().then(connected => {
        if (connected) {
          update({ connection: 'ok' })
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
  }, [ relays ])

  useEffect(() => {
    update({ client })
  }, [ pubkey, signer ])

  async function connected () : Promise<boolean> {
    if (relays.length === 0) {
      setError('Your relay list is empty!')
      return false
    }
    return new Promise(resolve => {
      void pool.get(relays, { kinds: [ 1 ], limit: 1 })
        .then(e => { resolve(e !== null) })
    })
  }

  const client = {
    connected,
    publish,
    pubkey,
    get  : async (filter  : Filter)   => pool.get(relays, filter),
    list : async (filters : Filter[]) => pool.list(relays, filters),
    pub  : async (event   : Event)    => pool.publish(relays, event),
    sub  : async (filters : Filter[]) => pool.sub(relays, filters)
  }

  async function publish (
    event : Partial<EventTemplate>
  ) : Promise<Event | undefined> {
    if (signer === undefined) {
      throw new Error('Signer is undefined!')
    }
    return publishEvent(client, event, signer)
      .catch(err => {
        setError(err as Error)
        return undefined
      })
  }

  return { client }
}
