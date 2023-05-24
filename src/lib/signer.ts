import {
  Event,
  EventTemplate,
  getEventHash,
  getPublicKey,
  signEvent,
  validateEvent,
  verifySignature
} from 'nostr-tools'

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
