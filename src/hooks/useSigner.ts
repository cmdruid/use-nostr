import { StoreAPI }   from './useStore.js'
import { NostrStore } from '../schema/types.js'

export function useSigner ({ store, setError, update } : StoreAPI<NostrStore>) {
  console.log(store, setError, update)
  // const { pubkey, signer } = store
  return {}
}
