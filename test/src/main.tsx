import React    from 'react'
import ReactDOM from 'react-dom/client'
import App      from './App.js'

import { NostrProvider } from '../../src/index.js'

import './styles/dark.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NostrProvider defaults={{ relays: [ 'relay.taxi'] }}>
      <App />
    </NostrProvider>
  </React.StrictMode>
)
