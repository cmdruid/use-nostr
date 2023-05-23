export const DEFAULT = {
  hooks   : { pubkey: () => null },
  profile : { name: 'Anonymous' },
  store   : {
    connection   : 'none' as 'none',
    hasExtension : false,
    isConnected  : false,
    isLoading    : false,
    relays       : [ 'wss://relay.taxi' ]
  }
}
