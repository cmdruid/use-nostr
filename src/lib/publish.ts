import { Event, EventTemplate, Kind } from 'nostr-tools'
import { Client, Signer } from '../schema/types.js'
import { now } from './util.js'

export async function publishEvent (
  client : Client,
  event  : Partial<EventTemplate>,
  signer : Signer
) : Promise<Event> {
  const signed = await signer({
    kind       : 20000 as Kind,
    tags       : [],
    content    : '',
    ...event,
    created_at : now()
  })

  const pub = await client.pub(signed)

  let timer : NodeJS.Timeout

  function resolver () {
    clearTimeout(timer)
    return signed
  }

  return new Promise((resolve, reject) => {
    pub.on('ok',       () => { resolve(resolver())  })
    pub.on('failed',   () => { reject(new Error('Failed to publish event.')) })
    timer = setTimeout(() => { reject(new Error('Event publishing timed out!')) }, 5000)
  })
}
