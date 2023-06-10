import { useEffect } from 'react'
import { NostrAPI }  from '../schema/types.js'
import { sleep }     from '../lib/util.js'
import { DEFAULT }   from '../schema/config.js'

import { getSecSigner, getExtSigner } from '../lib/signer.js'

import {
  getPublicKey,
  nip19,
  generatePrivateKey
} from 'nostr-tools'

const LOGOUT = {
  profile : undefined,
  pubkey  : undefined,
  signer  : undefined
}

export function useLogin ({ store, setError, update } : NostrAPI) {
  useEffect(() => {
    // Update the 'hasExtension' value if an extension
    // is detected in the window object.
    void (async () => {
      await sleep(100)
      if (window?.nostr?.getPublicKey !== undefined) {
        update({ hasExtension: true })
      }
    })()
  }, [ store.hasExtension ])

  async function withExt () {
    try {
      const pubkey = await window.nostr.getPublicKey()
      const signer = getExtSigner()
      update({ pubkey, signer })
    } catch (err) { setError(err as Error) }
  }

  function withSecKey (seckey : string) {
    try {
      const sec = (seckey.startsWith('nsec'))
        ? nip19.decode(seckey).data.toString()
        : seckey
      update({
        pubkey : getPublicKey(sec),
        signer : getSecSigner(sec)
      })
    } catch (err) { setError(err as Error) }
  }

  function withPubKey (pubkey : string) {
    try {
      const pub = (pubkey.startsWith('npub'))
        ? nip19.decode(pubkey).data.toString()
        : pubkey
      update({ pubkey: pub })
    } catch (err) { setError(err as Error) }
  }

  function generateKey () {
    const sec = generatePrivateKey()
    update({
      profile : DEFAULT.profile,
      pubkey  : getPublicKey(sec),
      signer  : getSecSigner(sec)
    })
  }

  return {
    login  : { withExt, withPubKey, withSecKey, generateKey },
    logout : () => { update(LOGOUT) }
  }
}
