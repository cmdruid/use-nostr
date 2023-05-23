import {
  Event,
  EventTemplate,
  getEventHash,
  getPublicKey,
  signEvent,
  validateEvent,
  verifySignature
} from 'nostr-tools'

import { Client, Signer } from '../schema/types.js'

export function verifyEvent (event : Event) {
  return validateEvent(event) && verifySignature(event)
}

export function getSecSigner (seckey : string) {
  return async (event : EventTemplate) => {
    const unsigned = { ...event,  pubkey: getPublicKey(seckey) }
    return {
      ...unsigned,
      id  : getEventHash(unsigned),
      sig : signEvent(unsigned, seckey)
    }
  }
}

export function getExtSigner () {
  if (typeof window.nostr.signEvent !== 'function') {
    throw new Error('Extension does not have sign method!')
  }
  return async (event : EventTemplate) => window.nostr.signEvent(event)
}

export async function publishEvent (
  client : Client,
  event  : EventTemplate,
  signer : Signer
) : Promise<Event> {
  const signed = await signer(event)
  const pub    = await client.pub(signed)

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
