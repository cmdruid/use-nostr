import { UnsignedEvent } from 'nostr-tools'

export type Signer = (event : UnsignedEvent) => Promise<string>

declare global {
  interface Window {
    nostr : {
      getPublicKey : () => Promise<string>
      signEvent    : Signer
    }
  }
}

export interface Event<T = string> {
  kind       : number
  created_at : number
  pubkey     : string
  id         : string
  sig        : string
  content    : T
  tags       : string[][]
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

export type ProfileEvent = Event<Profile>
