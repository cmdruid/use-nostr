import { ReactElement, useState } from 'react'
import { useNostr }  from '../../../../src/index.js'
import { NostrRoom } from '../../../../src/lib/room.js'

export default function DemoRoom () : ReactElement {
  const [ secret, setSecret   ] = useState('usenostr-demo')
  const [ msg, setMsg ]     = useState('')
  const [ room, setRoom ]   = useState<NostrRoom | undefined>()
  const [ chat, setChat ]   = useState('')
 
  const { store, joinRoom } = useNostr()

  function join () {
    const rm = joinRoom(secret)
    rm.on('msg', (message : string) => {
      setChat(message)
    })
    setRoom(rm)
  }

  function leave () {
    room?.leave()
    setRoom(undefined)
  }

  function send () {
    if (room === undefined) {
      throw new Error('Room is undefined!')
    }
    setMsg('')
    room.pub('msg', msg)
  }

  return (
    <div className='container'>
      <div className='card'>
        <p>Current Room:</p>
        <div className='field'>
          <input
            type="text"
            placeholder='enter a room secret...'
            value={secret}
            onChange={ (e) => { setSecret(e.target.value) } }
          />
          {room !== undefined 
            && <button style={{ marginLeft: '0.5rem' }} onClick={leave}>[ leave ]</button>
            || <button style={{ marginLeft: '0.5rem' }} onClick={join}>[ join ]</button>
          }
        </div>
        <div>
          <pre>{room !== undefined && chat}</pre>
          <input
            type="text"
            placeholder='enter a message...'
            value={msg}
            onChange={ (e) => { setMsg(e.target.value) } }
          />
          <button style={{ marginLeft: '0.5rem' }} onClick={send}>[ send ]</button>
        </div>
      </div>
    </div>
  )
}
