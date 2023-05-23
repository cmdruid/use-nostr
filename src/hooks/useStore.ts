import { useReducer } from 'react'

// We define some basic helper types here.
type Key<T>      = keyof T
type Value<T>    = T[Key<T>]
type Hook<T>     = (value ?: Value<T>) => Value<T> | null | undefined
type Reducer<T>  = (store : T, action : Action<T>) => T

// We can strictly type our dispatch actions here.
export type Action<T> =
  | { type : 'reset',  payload : T }
  | { type : 'update', payload : Partial<T> }
  | { type : 'write',  payload : Record<string, any> }

// These types are useful for outside integrations.
export type Hooks<T>    = Partial<Record<Key<T>, Hook<T>>>
export type StoreAPI<T> = ReturnType<typeof useStore<T>>

function createReducer<T> (
  hooks : Hooks<T> = {}
) : Reducer<T> {
  /**
   * Returns a reducer method with custom hooks applied.
   */
  return (
    store  : T,
    action : Action<T>
  ) : T => {
    try {
      const { type, payload } = action
      switch (type) {
        case 'reset':
          return payload
        case 'update': {
          for (const k in payload) {
            const key    = k as Key<T>
            const value  = payload[key] as Value<T>
            const hook   = hooks[key]
            payload[key] = (typeof hook === 'function')
              ? hook(value) ?? value
              : value
          }
          return { ...store, ...payload }
        }
        case 'write': {
          return { ...store, ...payload }
        }
        default:
          throw new Error(`Invalid action: ${String(type)}`)
      }
    } catch (err) {
      console.error(err)
      const { message } = err as Error
      return { ...store, error: message }
    }
  }
}

export function useStore<T> (
  defaults : T,
  hooks   ?: Hooks<T>
) {
  /**
   * Create a reducer store with custom hooks, then
   * return it along with our Store API.
   */
  const reducer = createReducer(hooks)
  const [ store, dispatch ] = useReducer(reducer, defaults)

  function setError (err : Error | string) {
    const error = (err instanceof Error)
      ? err.message
      : err
    dispatch({ type: 'write', payload: { error } })
  }

  function reset (store : Partial<T>) {
    const payload = { ...defaults, ...store }
    dispatch({ type: 'reset', payload })
  }

  function update (store : Partial<T>) {
    dispatch({ type: 'update', payload: store })
  }

  return {
    reset,
    setError,
    store,
    update
  }
}
