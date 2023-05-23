import { useEffect } from 'react'
import { StoreAPI }  from './useStore.js'
import { DEFAULT }   from '../schema/config.js'
import { NostrStore, Profile } from '../schema/types.js'

import {
  getProfileEvent,
  setProfileEvent
} from '../lib/profile.js'

export function useProfile (
  { store, setError, update } : StoreAPI<NostrStore>
) {
  const { client, isConnected, pubkey, profile, signer } = store

  useEffect(() => {
    // Validate pubkey, then fetch profile.
    if (profile === undefined && pubkey !== undefined && isConnected) {
      update({ isLoading: true })
      void getProfile()
    }
  }, [ pubkey, profile, isConnected ])

  async function getProfile () : Promise<Profile | undefined> {
    let profile : Profile | undefined
    if (typeof pubkey !== 'string') {
      setError('Pubkey is not defined!')
      return
    }
    if (!isConnected || client === undefined) {
      setError('Client is not connected!')
      return
    }
    try {
      const profile = await getProfileEvent(client, pubkey)
      if (profile !== undefined) {
        update({ profile })
      } else {
        update({ profile: DEFAULT.profile })
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      update({ isLoading: false })
    }
    return profile
  }

  async function setProfile (updates : Partial<Profile>) : Promise<void> {
    const updated = { ...profile, ...updates }
    if (typeof pubkey !== 'string') {
      setError('Pubkey not defined!')
    } else if (typeof signer !== 'function') {
      setError('Signer not defined!')
    } else if (!isConnected || client === undefined) {
      setError('Client is not connected!')
    } else {
      setProfileEvent(client, updated, signer)
        .then(profile => { update({ profile }) })
        .catch(err => { setError(err) })
    }
  }

  return { getProfile, setProfile }
}
