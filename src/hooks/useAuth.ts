import { StoreAPI }   from './useStore.js'
import { NostrStore } from '../schema/types.js'
import { useEffect } from 'react'

export function useAuth ({ store, setError, update } : StoreAPI<NostrStore>) {
  console.log(store, setError, update)
  const { pubkey, signer } = store

  // usePubSession

  /**
   * Establish a cryptographic session with server, using ECDH and AES-CBC encryption.
   *
   * Steps:
   * - Wrap fetch and nostr signer together (like crypto-sessions).
   * - Sign a challenge from the server (then store as session cookie).
   * - Session cookie authenticates pubkey for GET requests.
   * - Use nostr event envelope for signing POST requests.
   * - Auth library needs to include middleware for express / next.
   */

  useEffect(() => {

  })

  const event = {
    kind    : 0xFFFFFFFF,
    content : window.location
  }

  return {
    signer: {
      event: {
        sign   : signer,
        verify : null
      }
    }

  }
}
