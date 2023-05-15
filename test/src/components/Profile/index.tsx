import { useNostrProfile } from '../../../../src/index.js'

export default function Profile () {
  const { store, reset } = useNostrProfile()
  return (
    <div className='container'>
      { store.profile && <pre className='profile'>{JSON.stringify(store.profile, null, 2)}</pre> }
      <button onClick={reset}>Logout</button>
    </div>
  )
}
