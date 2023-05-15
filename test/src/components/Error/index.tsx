import { useEffect } from 'react'
import { useNostrProfile } from '../../../../src/index.js'

export default function Toast () {
  const { store, update } = useNostrProfile()

  useEffect(() => {
    if (typeof store.error === 'string') {
      setTimeout(() => update('error', undefined), 5000)
    }
  }, [ store.error ])

  return (
    <div className='toast'>
      { store.error && <p>{store.error}</p> }
    </div>
  )
}