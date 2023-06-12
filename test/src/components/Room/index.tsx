import { ReactElement, useState } from 'react'
import { useNostr }  from '../../../../src/index.js'
import { NostrRoom } from '../../../../src/lib/room.js'

export default function DemoRoom () : ReactElement {
  const [ secret, setSecret ]   = useState('usenostr-demo')
  const [ message, setMessage ] = useState('')
  const [ room, setRoom ] = useState<NostrRoom>()
  const [ chat, setChat ] = useState<string[]>([])
 
  const { rooms } = useNostr()

  function join () {
    const rm = rooms.join(secret, { allowEcho: true })
    rm.on('msg', (message : string) => {
      setChat((prev) => [ ...prev, message ])
    })
    setRoom(rm)
  }

  function leave () {
    if (room !== undefined) {
      room.leave()
      setRoom(undefined)
      setChat([])
    }
  }

  function send () {
    if (room !== undefined) {
      room.pub('msg', message)
    }
    setMessage('')
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
          <div>
            {chat.map(e => <pre key={e}>{e}</pre>)}
          </div>
          <input
            type="text"
            placeholder='enter a message...'
            value={message}
            onChange={ (e) => { setMessage(e.target.value) } }
          />
          <button style={{ marginLeft: '0.5rem' }} onClick={send}>[ send ]</button>
        </div>
      </div>
    </div>
  )
}
