import { ReactElement }    from 'react'
import { useNostrProfile } from '../../src/index.js'

import Error     from './components/Error/index.js'
import Login     from './components/Login/index.js'
import Profile   from './components/Profile/index.js'
import RelayList from './components/RelayList/index.js'

export default function App () : ReactElement {
  const { store } = useNostrProfile()

  return (
    <div className='App'>
      <Error />
      {!store.profile 
        && <Login /> 
        || <Profile />
      }
      <RelayList />
    </div>
  )
}
