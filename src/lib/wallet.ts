/**
 * Wallet Library
 */

/** TODO
 * Need configurable API endpoints for:
 * - Fee estimation (get fee)
 * - Current block height / header (getblockchaininfo)
 * - Check a transaction (gettransaction)
 * - Broadcast a transaction (sendrawtransaction)
 * - Get UTXOs related to an address.
 *
 * Need to store the following:
 * - Secret key (HD node for address)
 * - UTXOs (data needed to spend them)
 * - Current index (and gap limits)
 *
 * > It would be nice to have hash-based path derivation converted to Uint31 (to support older wallets).
 *
 * Need the following methods:
 * - getBalance()
 * - getNewAddress()
 * - sendPayment(address)
 * - recvPayment(amount, memo)
 */
export {}
