import { SimplePool } from 'nostr-tools'
import { Event, Profile, Signer } from '../schema/types.js'

export async function getProfile (
  pubkey : string,
  relays : string[]
) : Promise<Profile | undefined> {
  const events : Event[] = []
  const filters = [ {
    authors : [ pubkey ],
    kinds   : [ 0 ],
    limit   : 10
  } ]

  const pool = new SimplePool()
  const sub  = pool.sub(relays, filters)

  sub.on('event', (event) => { events.push(event) })

  let timer : NodeJS.Timeout

  function resolver () : Profile | undefined {
    clearTimeout(timer)
    sub.unsub()
    events.sort((a, b) => a.created_at - b.created_at)
    return (events[0]?.content !== undefined)
      ? JSON.parse(events[0].content)
      : undefined
  }

  return new Promise(resolve => {
    timer = setTimeout(() => { resolve(resolver()) }, 5000)
    sub.on('eose', () => { resolve(resolver()) })
  })
}

export async function setProfile (
  profile : Profile,
  pubkey  : string,
  signer  : Signer
) {
  const event = {
    pubkey,
    content    : JSON.stringify(profile),
    tags       : [],
    kind       : 0,
    created_at : Math.floor(Date.now() / 1000)
  }

  return signer(event)
}
