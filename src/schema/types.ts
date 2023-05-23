import { Event, EventTemplate, Filter, Pub, Sub } from 'nostr-tools'

export type Signer = (event : EventTemplate) => Promise<Event>

declare global {
  interface Window {
    nostr : {
      getPublicKey : () => Promise<string>
      signEvent    : Signer
    }
  }
}

export interface Client {
  connected : () => Promise<boolean>
  get  : (filter  : Filter)   => Promise<Event | null>
  list : (filters : Filter[]) => Promise<Event[]>
  pub  : (event   : Event)    => Promise<Pub>
  sub  : (filters : Filter[]) => Promise<Sub>
}

export interface NostrStore {
  client      ?: Client
  connection   : 'none' | 'conn' | 'ok' | 'error'
  hasExtension : boolean
  isConnected  : boolean
  isLoading    : boolean
  error       ?: string
  pubkey      ?: string
  profile     ?: Profile
  relays       : string[]
  signer      ?: Signer
}

export interface Profile {
  name         ?: string | undefined
  username     ?: string | undefined
  display_name ?: string | undefined
  picture      ?: string | undefined
  banner       ?: string | undefined
  about        ?: string | undefined
  website      ?: string | undefined
  lud06        ?: string | undefined
  lud16        ?: string | undefined
  nip05        ?: string | undefined
}
