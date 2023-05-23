import { ReactElement, useState } from 'react'
import { useNostr } from '../../../../src/index.js'

export default function Login () : ReactElement {
  const [ pubkey, setPubKey ] = useState('')
  const [ seckey, setSecKey ] = useState('')

  const { login, store } = useNostr()

  return (
    <div className='container'>
      <div className='card'>
        <label>Login Via Extention:</label>
        <button disabled={!store.hasExtension} onClick={login.withExt}>Login</button>
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