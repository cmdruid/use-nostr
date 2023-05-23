import { Event, Sub } from 'nostr-tools'
import { useEffect, useState }   from 'react'
import { useNostr }   from '../../../../src/index.js'

const DEFAULT_FILTER = '{\n  "kinds": [ 1 ],\n  "limit": 10\n}'

export default function Events () {
  const { store, setError } = useNostr()
  const [ sub, setSub ]   = useState<Sub | null>(null)
  const [ events, setEvents ] = useState<Event[]>([])
  const [ subFilter, setFilter ] = useState(DEFAULT_FILTER)
  const [ isValid, setValid ] = useState(false)

  const valid   = '#00800040'
  const invalid = '#ff000040'

  useEffect(() => {
    setValid(isValidFilter(subFilter))
  }, [ subFilter])

  async function submit () {
    const { client, connection } = store
    if (
      client !== undefined &&
      connection === 'ok'  &&
      isValid
    ) {
      if (sub !== null) {
        sub.unsub()
      }
      const filter = JSON.parse(subFilter)
      const newsub = await store.client?.sub([ filter ])

      if (newsub === undefined) {
        setError('Failed to subscribe!')
        return
      }

      newsub.on('event', (event) => {
        setEvents([ ...events, event ])
      })

      setSub(sub)
    }   
  }

  return (
    <div className='events container'>
      <p>Apply a filter to see Events:</p>
      <textarea
        value={subFilter}
        onChange={(e) => setFilter(e.target.value)}
        style={{backgroundColor : (isValid) ? valid : invalid }}
      ></textarea>
      <button onClick={submit}>Subscribe</button>
      <div className='eventlist'>
        {events.map(e => {
          return <pre key={e.id}>{JSON.stringify(e, null, 2)}</pre>
        })}
      </div>
    </div>
  )
}

function isValidFilter(filter : string) : boolean {
  try {
    return typeof JSON.parse(filter) === 'object'
  } catch {
    return false
  }
}
