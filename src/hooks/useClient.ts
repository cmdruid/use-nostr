import { useEffect }    from 'react'
import { NostrAPI }     from '../schema/types.js'
import { publishEvent } from '../lib/publish.js'

import { Event, EventTemplate, Filter, SimplePool } from 'nostr-tools'

export function useClient ({ store, setError, update } : NostrAPI) {
  const { isConnected, pubkey, relays, signer } = store
  const pool = new SimplePool()

  useEffect(() => {
    if (relays.length > 0) {
      update({ connection: 'conn' })
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
  }, [ isConnected, pubkey, signer ])

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
    ok   : isConnected,
    get  : async (filter  : Filter)   => pool.get(relays, filter),
    list : async (filters : Filter[]) => pool.list(relays, filters),
    pub  : async (event   : Event)    => pool.publish(relays, event),
    sub  : async (filters : Filter[]) => pool.sub(relays, filters)
  }

  async function publish (
    event : Partial<EventTemplate>
  ) : Promise<Event | undefined> {
    if (signer === undefined) {
      setError('Signer is undefined!')
      return
    }
    return publishEvent(client, event, signer)
      .catch(err => { setError(err); return undefined })
  }

  return { client }
}
