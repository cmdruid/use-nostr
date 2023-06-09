import { Buff, Bytes, Json } from '@cmdcode/buff-utils'
import { Event, EventTemplate, Filter, Sub, verifySignature } from 'nostr-tools'

import { Client }    from '../schema/types.js'
import { isExpired, now } from '../lib/util.js'

export interface RoomConfig {
  cacheSize      : number
  echo           : boolean
  encrypt        : boolean
  expiration     : number
  filter         : Filter
  inactiveLimit ?: number
  kind           : number
  tags           : string[][]
}

const DEFAULTS = {
  cacheSize     : 100,
  echo          : false,
  encrypt       : true,
  expiration    : 1000 * 60 * 60 * 24,
  filter        : { since: now() },
  inactiveLimit : 1000 * 60 * 60,
  kind          : 21111,
  tags          : []
}

export class NostrRoom {
  readonly cache   : Array<[ eventName: string, payload: any, envelope : Event ]>
  readonly client  : Client
  readonly config  : RoomConfig
  readonly events  : Record<string, Set<Function>>
  readonly _secret : Buff

  connected : boolean
  _sub      ?: Sub

  constructor (
    client : Client,
    secret : string,
    config : Partial<RoomConfig> = {}
  ) {
    this.cache     = []
    this.client    = client
    this.config    = { ...DEFAULTS, ...config }
    this.connected = false
    this.events    = {}
    this._secret   = Buff.str(secret)

    void this._subscribe()
  }

  get members () : string[] {
    const limit = this.config.inactiveLimit
    const cache = (limit !== undefined)
      ? this.cache.filter(e => isExpired(e[2].created_at, limit))
      : this.cache
    return cache.map(e => e[2].pubkey)
  }

  get roomId () : Buff {
    return this.shareKey.digest
  }

  get shareKey () : Buff {
    return this._secret.digest
  }

  async _subscribe () {
    const { filter, kind } = this.config
    const { kinds = [] }   = filter

    const client    = this.client
    const subFilter = {
      ...filter,
      kinds : [ ...kinds, kind  ],
      '#h'  : [ this.roomId.hex ]
    }

    this._sub = await client.sub([ subFilter ])

    this._sub.on('event', (event : Event) => {
      void this._eventHandler(event)
    })

    this._sub.on('eose', () => {
      this.connected = true
    })
  }

  async _eventHandler (event : Event) {
    const { echo } = this.config
    const pubkey   = this.client.pubkey
    const { tags } = event
    const expires  = tags.find(e => e[0] === 'expiration')

    if (
      Array.isArray(expires) &&
      parseInt(expires[1]) < now()
    ) {
      console.log('event is expired!')
      return
    }

    if (
      echo &&
      pubkey !== undefined &&
      event.pubkey === pubkey
    ) {
      return
    }

    if (!verifySignature(event)) {
       // Verify that the signature is valid.
      console.log('Bad signature!')
      this.emit('_err', { msg: 'Bad signature!' })
      return
    }

    let content = event.content

    try {
      if (typeof content === 'string' && content.includes('?iv=')) {
        checkCryptoLib()
        content = await decrypt(content, this.shareKey)
      }

      // Zod validation should go here.

      const { eventName, payload } = JSON.parse(content)

      // this.emit('debug: ' + JSON.stringify(decryptedContent, null, 2))
      // this.debug('metaData: ' + JSON.stringify(metaData, null, 2))

      // Emit the event to our subscribed functions.
      this.cache.push([ eventName, payload, event ])

      if (this.cache.length > this.config.cacheSize) {
        this.cache.shift()
      }

      this.emit(eventName, payload, event)
    } catch (err) {
      this.emit('err', err)
    }
  }

  _getFn (eventName : string) {
    /** If key undefined, create a new set for the event,
     *  else return the stored subscriber list.
     * */
    if (typeof this.events[eventName] === 'undefined') {
      this.events[eventName] = new Set()
    }
    return this.events[eventName]
  }

  emit (eventName : string, ...args : any[]) {
    const fns = [ ...this._getFn(eventName) ]
    for (const fn of fns) {
      fn.apply(this, args)
    }
    const all = [ ...this._getFn('*') ]
    for (const fn of all) {
      args = [ eventName, ...args ]
      fn.apply(this, args)
    }
  }

  async pub (
    eventName : string,
    payload   : Json,
    template  : Partial<EventTemplate> = {}
  ) : Promise<Event | undefined> {
    /** Emit a series of arguments for the event, and
     *  present them to each subscriber in the list.
     * */

    if (!this.connected) {
      throw new Error('Not connected to room!')
    }

    const { expiration, kind } = this.config
    const { tags: conf_tags }  = this.config
    const { tags: temp_tags = [], ...rest } = template

    try {
      let content = JSON.stringify({ eventName, payload })

      if (this.config.encrypt) {
        checkCryptoLib()
        content = await encrypt(content, this.shareKey)
      }

      const tags = [
        ...conf_tags,
        ...temp_tags,
        [ 'h', this.roomId.hex ],
        [ 'expiration', String(now() + expiration) ]
      ]

      const envelope = { kind, ...rest, tags  }
      const draft    = { ...envelope, content }

      console.log('draft:', draft)

      return await this.client.publish(draft)
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  on (eventName : string, fn : Function) : void {
    /** Subscribe function to run on a given event. */
    this._getFn(eventName).add(fn)
  }

  once (eventName : string, fn : Function) {
    /** Subscribe function to run once, using
     *  a callback to cancel the subscription.
     * */

    const onceFn = (...args : any[]) => {
      this.remove(eventName, onceFn)
      fn.apply(this, args)
    }
    this.on(eventName, onceFn)
  }

  within (eventName : string, fn : Function, timeout : number) {
    /** Subscribe function to run within a given,
     *  amount of time, then cancel the subscription.
     * */
    const withinFn = (...args : any[]) => fn.apply(this, args)
    setTimeout(() => { this.remove(eventName, withinFn) }, timeout)

    this.on(eventName, withinFn)
  }

  remove (eventName : string, fn : Function) {
    /** Remove function from an event's subscribtion list. */
    this._getFn(eventName).delete(fn)
  }

  prune (eventName : string) {
    this.events[eventName] = new Set()
  }

  leave () {
    this._sub?.unsub()
    this.connected = false
  }
}

function checkCryptoLib () {
  if (crypto.subtle === undefined) {
    throw new Error('WebCrypto library is undefined!')
  }
}

async function getCryptoKey (secret : Bytes) {
  /** Derive a CryptoKey object (for Webcrypto library). */
  const seed    = Buff.bytes(secret)
  const options = { name: 'AES-CBC' }
  const usage   = [ 'encrypt', 'decrypt' ] as KeyUsage[]
  return crypto.subtle.importKey('raw', seed, options, true, usage)
}

async function encrypt (
  message : string,
  secret  : Bytes,
  vector ?: Bytes
) {
  /** Encrypt a message using a CryptoKey object. */
  const key = await getCryptoKey(secret)
  const msg = Buff.str(message)
  const iv  = (vector !== undefined)
    ? Buff.bytes(vector)
    : Buff.random(16)
  const opt = { name: 'AES-CBC', iv }
  return crypto.subtle.encrypt(opt, key, msg)
    .then((bytes) => new Buff(bytes).b64url + '?iv=' + iv.b64url)
}

async function decrypt (
  encoded : string,
  secret  : Bytes
) {
  /** Decrypt an encrypted message using a CryptoKey object. */
  if (!encoded.includes('?iv=')) {
    throw new Error('Missing vector on encrypted message!')
  }
  const [ message, vector ] = encoded.split('?iv=')
  const key = await getCryptoKey(secret)
  const msg = Buff.b64url(message)
  const iv  = Buff.b64url(vector)
  const opt = { name: 'AES-CBC', iv }
  return crypto.subtle.decrypt(opt, key, msg)
    .then(decoded => Buff.raw(decoded).str)
}
