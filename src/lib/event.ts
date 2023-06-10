import { Event, verifySignature, getEventHash } from 'nostr-tools'
import { now } from './util.js'

export class SignedEvent {
  readonly _event : Event

  constructor (event : Event) {
    this._event = event
  }

  get data () : Event {
    return this._event
  }

  get isValid () : boolean {
    const hash = getEventHash(this.data)
    return hash === this.data.id && verifySignature(this.data)
  }

  get isExpired () : boolean {
    const { tags } = this.data
    const tag = tags.find(e => e[0] === 'expiration')

    if (!Array.isArray(tag)) return false

    try {
      return parseInt(tag[1]) < now()
    } catch (err) {
      return true
    }
  }

  isAuthor (pubkey : string) : boolean {
    return this.data.pubkey === pubkey
  }
}
