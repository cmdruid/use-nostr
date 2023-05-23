import { FormEvent, useState } from 'react'
import { useNostr } from '../../../../src/index.js'
import { Profile }      from '../../../../src/schema/types.js'

const ALLOWED_FIELDS = [ 'display_name', 'name', 'about', 'website', 'picture', 'banner' ]

export default function UserProfile () {
  const { setProfile, store, logout } = useNostr()

  function handleSubmit (e : FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const allowed  = (entry : [ string, any ]) => ALLOWED_FIELDS.includes(entry[0])
    const formData = new FormData(e.target as HTMLFormElement)
    const entries  = [ ...formData.entries() ].filter(allowed)
    const newdata  = Object.fromEntries(entries)
    console.log(newdata)
    setProfile(newdata)
  }

  return (
    <div className='container'>
      { store.profile && 
        <form onSubmit={handleSubmit}>
          { Object.entries(store.profile).map(([ key, value ]) => {
            if (ALLOWED_FIELDS.includes(key)) {
              return <ProfileField key={key} label={key} value={value} />
            }
          })}
          <button type='submit'>Update</button>
          <button onClick={logout}>Logout</button>
        </form>     
      }
    </div>
  )
}

function ProfileField <T = Profile> (
  { label, value } : { label : keyof T, value : T[keyof T] }
) {
  const [ input, setInput ] = useState(String(value))
  const name = String(label)
  return (
    <div className='field'>
      <label>{name}</label>
      <input name={name} value={input} onChange={e => setInput(e.target.value)} />
    </div>
  )
}
