import { StoreAPI }   from './useStore.js'
import { NostrStore } from '../schema/types.js'

export function useWallet ({ store, setError, update } : StoreAPI<NostrStore>) {
  console.log(store, setError, update)
  // const { pubkey, signer } = store

  // We need to scan addresses in order to determine our balance and utxo set.
  // We also need to know what derivation path to use for signing.
  // Other wallets accomplish this via brute-force lookup of addresses.
  // There is a "gap limit" where past a certain amount of unused addresses,
  // the wallet assumes you are at the tip.
  // If we include a 'topic' hash in our derivation path, we can reduce the
  // lookup space or eliminate it completely.
  // In order to sign a transaction, you need to know the commitment hash (which is not the txid)
  // You can use this commitment hash as a derivation path before signing the key!
  // That way, if you know the txid of your utxo, you can derive the path for that utxo from the blockchain.

  /**
   * Nostr Wallet
   * - Sign event with top-domain in content (and maybe other commitments).
   * - Hash signed event, use as deterministic seed.
   * - Create a 
   */

  return {
    scan,    // Scan the block-chain for UTXOs
    balance, // Return our on-chain balance.
    send,
    recv,
    sign,
    verify,
    import: {
      fromWords : null,
      fromSeed  : null
    },
    export: {
      toWords : null,
      toSeed  : null
    }
  }
}
