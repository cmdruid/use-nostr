# useNostr

This project is designed to be a turn-key library for using Nostr with React.

- Login with pubkey, npub, seckey, nsec, extension, or generate a new key.
- Nostr client API with `get`, `list`, `sub`, and `publish`.
- Configure a list of relays for your client to use.
- Uses a simple reducer `store` with `update` method.
- Helper boolean, status and error messages for reactive components.

Coming soon:
  - Sign / verify custom messages and challenges using the Signer API.
  - Receive a Taproot HD wallet derived from your nostr signing device.

This project is fully typed and designed to work with intellisense.

More documentation coming soon!

## Import

To make `useNostr` available across your entire react app, wrap your root component with the included `NostrProvider` component:

```tsx
// Example entrypoint for react / nextjs.
// Your project may look slightly different.
import { NostrProvider } from '@cmdcode/use-nostr'

export default function App ({ Component, pageProps }) {
  return (
    <NostrProvider>
      <Component {...pageProps} />
    </NostrProvider>
  )
}
```

## Basic Usage

With the `NostrProvider` configured, importing the library and store is relatively simple.

Here is a basic example of reading and updating your relay list:

```tsx
import { useState } from 'react'
import { useNostr } from '@cmdcode/use-nostr'

export default function Relays () {
  const { store, update }   = useNostr()
  const [ input, setInput ] = useState('')

  function handleSubmit() {
    update({ relays: [ ...store.relays, input ] })
  }

  return (
    <div>
      <p>Relays</p>
      { store.relays && <pre>{JSON.stringify(store.relays, null, 2)}</pre> }
      <input onChange={(e) => { setInput(e.target.value) }} value={input} />
      <button onClick={handleSubmit}>Add Relay</button>
    </div>
  )
}
```

Here is an example login flow that covers all methods of signing in:

```tsx
import { useState } from 'react'
import { useNostr } from '@cmdcode/use-nostr'

export default function Login () {
  const [ pubkey, setPubKey ] = useState('')
  const [ seckey, setSecKey ] = useState('')

  const { hasExtension, login, store } = useNostr()

  return (
    <div className='container'>
      <div className='card'>
        <label>Login Via Extention:</label>
        <button disabled={!hasExtension} onClick={login.withExt}>Login</button>
      </div>
      <div className='card'>
        <label>Login with your Public Key or npub:</label>
        <input value={pubkey} onChange={(e) => setPubKey(e.target.value)}></input>
        <button onClick={() => login.withPubKey(pubkey)}>Login</button>
      </div>
      <div className='card'>
        <label>Login with your Secret Key or nsec:</label>
        <input value={seckey} onChange={(e) => setSecKey(e.target.value)}></input>
        <div className='field'>
          <button onClick={() => login.withSecKey(seckey)}>Login</button>
          <button onClick={login.generateKey}>Generate</button>
        </div>
      </div>
    </div>
  )
}
```

## Library API

The library is split into several modules that plug into the main store.

### Store API

```ts
const { store, update, reset, setError } = useNostr()

// The main data store.
store : NostrStore
// Update the data store using a JSON object.
update   = (store : Partial<NostrStore>) => void
// Resets the data store. Provide an 
// optional JSON object for defaults.
reset    = (store : Partial<NostrStore>) => void
// Sets an error message in the store, 
// plus print to console.
setError = (err : Error) => void

interface NostrStore {
  // Schema for the data store.
  client      ?: Client
  connection   : 'none' | 'conn' | 'ok' | 'error'
  hasExtension : boolean
  isConnected  : boolean
  isLoading    : boolean
  error       ?: string
  pubkey      ?: string
  profile     ?: Profile
  relays       : string[]
  signer      ?: Signer
}
```

### Login API

```ts
const { login, logout } = useNostr()

login = {
  // Login with NIP-07 extension (if available).
  withExt     : () => void,
  // Login with npub or pubkey hex (read only).
  withPub     : (string) => void,
  // Login with nsec or seckey hex.
  withSec     : (string) => void,
  // Generate a new (ephemeral) keypair.
  generateKey : () => void
}

// Removes all user data from the store.
logout = () => void
```

### Client API

```ts
const { client } = useNostr()

client = {
  // Checks pool connection and returns a boolean result.
  connected : () => Promise<boolean>,
  // Publish an event from a partial JSON template.
  publish   : (event : Partial<Event>) => Promise<Event>,
  // Fetch the top event using the provided filter.
  get  : async (filter  : Filter)      => Promise<Event>,
  // Fetch a list of events using the provided filters.
  list : async (filters : Filter[])    => Promise<Event[]>,
  // Publish a signed event and receive a Pub emitter.
  pub  : async (event   : Event)       => Promise<Pub>,
  // Subscribe to a list of filters and receive a Sub emitter.
  sub  : async (filters : Filter[])    => Promise<Sub>
}
```

### Profile API

```ts
const { getProfile, setProfile } = useNostr()

// Fetch your profile from the relays.
getProfile = () => Promise<Profile | undefined>
// Update your profile using a partial JSON template.
setprofile = (updates : Partial<Profile>) => Promise<void>
```

### Signer API

Coming soon!

## Development / Testing

This library uses `yarn` for package management and `vite` for a development / demo server.

```bash
## Start the vite development server:
yarn dev
## Build a new release of the package:
yarn release
```

## Bugs / Issues

If you run into any bugs or have any questions, please submit an issue ticket.

## Contribution

Feel free to fork and make contributions. Suggestions are welcome!

## Dependencies

This library contains minimal dependencies.  

**React**  
React library for hooks and JSX.  
https://github.com/facebook/react

**nostr-tools**  
Nostr utility library for all nostr stuff.  
https://github.com/nbd-wtf/nostr-tools

## Resources  

**Nostr Implementation Possibilities**  
This site is an index of current and draft NIPs.
https://nips.be

## License

Use this library however you want!

## Contact

You can find me on nostr at: `npub1gg5uy8cpqx4u8wj9yvlpwm5ht757vudmrzn8y27lwunt5f2ytlusklulq3`
