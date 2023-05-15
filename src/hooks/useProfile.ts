import {
  getPublicKey,
  nip19,
  generatePrivateKey,
  signEvent,
  UnsignedEvent
} from 'nostr-tools'

import { useEffect }              from 'react'
import useStore                   from './useStore.js'
import { Profile, Signer }        from '../schema/types.js'
import { getProfile, setProfile } from '../lib/profile.js'

export interface ProfileStore {
  hasExtension : boolean
  isLoading    : boolean
  error       ?: string
  seckey      ?: string
  pubkey      ?: string
  profile     ?: Profile
  relays       : string[]
}

const sleep = async (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

const defaults : ProfileStore = {
  hasExtension : false,
  isLoading    : false,
  relays       : [ 'wss://relay.taxi' ]
}

const hooks = {
  pubkey: () => undefined
}

export function useProfile () {
  const { store, reset, update } = useStore(defaults, hooks)

  useEffect(() => {
    // Update the 'hasExtension' value if an extension
    // is detected in the window object.
    void (async () => {
      await sleep(100)
      if (window?.nostr?.getPublicKey !== undefined) {
        update('hasExtension', true)
      }
    })()
  }, [ store.hasExtension ])

  useEffect(() => {
    // Convert / validate pubkey,
    // then fetch profile.
    const pubkey = store.pubkey

    if (
      pubkey !== undefined &&
      store.relays.length > 0
    ) {
      update('isLoading', true)
      update('error', undefined)
      void (async () => {
        try {
          const profile = await getProfile(pubkey, store.relays)
          if (profile !== undefined) {
            update('isLoading', false)
            update('profile', profile)
          } else {
            throw new Error('Profile not found!')
          }
        } catch (err) { errHandler(err as Error) }
      })()
    }
  }, [ store.pubkey, store.relays ])

  useEffect(() => {
    console.log('ProfileStore:', store)
  }, [ store ])

  const login = {
    withExtension: async () => {
      try {
        checkRelays()
        const pub = await window.nostr.getPublicKey()
        update('pubkey', pub)
      } catch (err) { errHandler(err as Error) }
    },
    withSecretKey: (seckey : string) => {
      try {
        checkRelays()
        const sec = (seckey.startsWith('nsec'))
          ? nip19.decode(seckey).data.toString()
          : seckey
        update('seckey', sec)
        update('pubkey', getPublicKey(sec))
      } catch (err) { errHandler(err as Error) }
    },
    withPublicKey: (pubkey : string) => {
      checkRelays()
      try {
        const pub = (pubkey.startsWith('npub'))
          ? nip19.decode(pubkey).data.toString()
          : pubkey
        update('pubkey', pub)
      } catch (err) { errHandler(err as Error) }
    },
    withNewKey: async () => {
      const sec = generatePrivateKey()
      update('profile', {})
      update('seckey', sec)
      update('pubkey', getPublicKey(sec))
      await sleep(500)
      void updateProfile({})
    }
  }

  function checkRelays () {
    if (store.relays.length < 1) {
      throw new Error('Relay list is empty!')
    }
  }

  function errHandler (err : Error) : void {
    console.error(err)
    update('error', err.message)
  }

  async function updateProfile (profile : Profile) {
    const { hasExtension, pubkey, seckey } = store
    let signer : Signer | undefined

    if (hasExtension) {
      signer = window.nostr.signEvent
    }

    if (seckey !== undefined) {
      signer = async (event : UnsignedEvent) => signEvent(event, seckey)
    }

    if (signer === undefined) {
      throw new Error('Signer not defined!')
    }

    if (pubkey === undefined) {
      throw new Error('Pubkey not defined!')
    }

    return setProfile(profile, pubkey, signer)
  }

  return { login, reset, store, update, updateProfile }
}
