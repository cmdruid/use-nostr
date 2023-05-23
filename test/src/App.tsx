import { ReactElement } from 'react'
import { useNostr }     from '../../src/index.js'

import Error       from './components/Error/index.js'
import Events      from './components/Events/index.js'
import Login       from './components/Login/index.js'
import UserProfile from './components/Profile/index.js'
import RelayList   from './components/RelayList/index.js'

export default function App () : ReactElement {
  const { store } = useNostr()

  return (
    <div className='App'>
      <Error />
      <RelayList />
      {store.isConnected && 
        <>
          {!store.profile && <Login /> || <UserProfile />}
          <Events />
        </>
      }
    </div>
  )
}
