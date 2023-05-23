import { useEffect } from 'react'
import { useNostr } from '../../../../src/index.js'

export default function Toast () {
  const { store, update } = useNostr()

  useEffect(() => {
    if (typeof store.error === 'string') {
      setTimeout(() => update({ error : undefined }), 5000)
    }
  }, [ store.error ])

  return (
    <div className='toast'>
      { store.error && <p>{store.error}</p> }
    </div>
  )
}
