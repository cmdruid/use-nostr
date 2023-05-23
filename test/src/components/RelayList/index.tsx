import { ReactElement, useState } from 'react'
import { useNostr } from '../../../../src/index.js'

export default function RelayList () : ReactElement {
  const [ relay, setRelay ] = useState('')
  const { store, update } = useNostr()

  function addRelay () {
    if (
      relay.startsWith('wss://') &&
      !store.relays.includes(relay)
    ) {
      const relays = [ ...store.relays, relay ]
      update({ relays })
    }
    setRelay('')
  }

  function remRelay (url : string) {
    const relays = store.relays.filter(e => e !== url)
    update({ relays })
  }

  return (
    <div className='container'>
      <div className='card'>
        <p>Current Relays:</p>
        {store.relays.length !== 0 
          && store.relays.map((url) => (
            <p className='row' key = {url} >
              {url}
              <button
                style   = {{ marginLeft: '0.5rem' }}
                onClick = {() => { remRelay(url) }}
              >x</button>
            </p>
          ))
          || <i style={{ marginBottom: '0.5rem' }}>No relays configured</i>
        }
      </div>
      <div className='field'>
        <input
          type="text"
          placeholder='wss://relay.address ...'
          value={relay}
          onChange={ (e) => { setRelay(e.target.value) } }
        />
        <button style={{ marginLeft: '0.5rem' }} onClick={addRelay}>[ add ]</button>
      </div>
    </div>
  )
}