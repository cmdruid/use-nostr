import { StoreAPI }   from './useStore.js'
import { NostrStore } from '../schema/types.js'
import { NostrRoom, RoomConfig } from '../lib/room.js'

export function useRoom ({ store } : StoreAPI<NostrStore>) {
  const joinRoom = (secret : string, config ?: Partial<RoomConfig>) => {
    const { client, isConnected } = store

    if (!isConnected || client === undefined) {
      throw new Error('Unable to connect!')
    }

    return new NostrRoom(client, secret, config)
  }

  return { joinRoom }
}
