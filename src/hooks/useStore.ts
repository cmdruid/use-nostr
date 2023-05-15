import { useReducer } from 'react'

// We can strictly type our dispatch actions here.
type Action<T> =
  | { type : 'reset', payload : T }
  | { type : 'update', payload : { key : keyof T, value : T[keyof T] } }

type Hook<T>    = (value : T[keyof T]) => T[keyof T] | undefined
type Hooks<T>   = Partial<Record<keyof T, Hook<T>>>
type Reducer<T> = (store : T, action : Action<T>) => T

function applyHooks <T> (
  hooks : Hooks<T>,
  key   : keyof T,
  value : T[keyof T]
) {
  const fn = hooks[key]
  return (fn !== undefined)
    ? fn(value) ?? value
    : value
}

function createReducer<T> (
  hooks ?: Hooks<T>
) : Reducer<T> {
  // Handles the reducer actions that update our store.
  return (
    store  : T,
    action : Action<T>
  ) => {
    try {
      switch (action.type) {
        case 'reset':
          return action.payload
        case 'update': {
          // Unpack payload.
          const { key, value } = action.payload
          // Run output through hooks.
          if (hooks !== undefined) {
            applyHooks(hooks, key, value)
          }
          return { ...store, [key]: value }
        }
        default:
          throw new Error('Invalid action!')
      }
    } catch (err) {
      console.error(err)
      const { message } = err as Error
      return { ...store, error: message }
    }
  }
}

export default function useStore<T> (
  defaults : T,
  hooks   ?: Hooks<T>
) {
  // Reducer hook that creates our store from defaults,
  // then returns the store along with helper methods.
  // defaults._beforeUpdate = new Set()
  const reducer = createReducer(hooks)
  const [ store, dispatch ] = useReducer(reducer, defaults)

  function reset () {
    dispatch({ type: 'reset', payload: defaults })
  }

  function update<K extends keyof T> (key : K, value : T[K]) {
    dispatch({ type: 'update', payload: { key, value } })
  }

  return {
    store,
    reset,
    update
  }
}
