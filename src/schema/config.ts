export const DEFAULT = {
  profile : { name: 'Anonymous' },
  store   : {
    connection   : 'none' as 'none',
    hasExtension : false,
    isConnected  : false,
    isLoading    : false,
    relays       : [ 'wss://relay.damus.io' ],
    rooms        : []
  }
}
