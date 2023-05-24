import { publishEvent } from './publish.js'
import { Client, Profile, Signer } from '../schema/types.js'

export async function getProfileEvent (
  client : Client,
  pubkey : string
) : Promise<Profile | undefined> {
  const filter = {
    authors : [ pubkey ],
    kinds   : [ 0 ]
  }

  let timer : NodeJS.Timeout

  return new Promise((resolve, reject) => {
    // Set a timeout that rejects with an error.
    timer = setTimeout(() => {
      reject(new Error('Profile request timed out!'))
    }, 5000)
    // Fetch the profile using client and filter.
    void client.get(filter).then(event => {
      clearTimeout(timer)
      resolve(
        (event?.content !== undefined)
          ? JSON.parse(event.content)
          : undefined
      )
    })
  })
}

export async function setProfileEvent (
  client  : Client,
  profile : Profile,
  signer  : Signer
) : Promise<Profile | undefined> {
  const template = {
    tags       : [],
    content    : JSON.stringify(profile),
    kind       : 0,
    created_at : Math.floor(Date.now() / 1000)
  }

  return publishEvent(client, template, signer)
    .then(res => JSON.parse(res.content) as Profile)
}
