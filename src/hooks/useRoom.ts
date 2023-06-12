import { NostrAPI } from '../schema/types.js'
import { NostrRoom, RoomConfig } from '../lib/room.js'

export function useRoom (
  { store, update } : NostrAPI
) {
  const { client, isConnected, rooms } = store

  function join (
    secret : string,
    config ?: Partial<RoomConfig>
  ) {
    if (!isConnected || client === undefined) {
      throw new Error('Unable to connect to room!')
    }
    // Create a new room instance.
    const rm = new NostrRoom(client, secret, config)
    // Setup a callback to delist the room on leave.
    rm.on('_leave', () => {
      // On leave, delist the room from the store.
      update({ rooms: rooms.filter(e => e.id.hex !== rm.id.hex) })
    })
    // Add the room to the store.
    update({ rooms: [ ...rooms, rm ] })
    // Return the room.
    return rm
  }

  function leave (roomId : string) {
    const rm = rooms.find(e => e.id.hex === roomId)
    if (rm instanceof NostrRoom) rm.leave()
  }

  return { rooms: { list: rooms, join, leave } }
}
