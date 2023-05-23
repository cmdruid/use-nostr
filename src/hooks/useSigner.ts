import { StoreAPI }   from './useStore.js'
import { NostrStore } from '../schema/types.js'

export function useSigner ({ store, setError, update } : StoreAPI<NostrStore>) {
  const { pubkey, signer } = store

  return {}
}
