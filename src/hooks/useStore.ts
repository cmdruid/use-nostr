import { useReducer } from 'react'

// We can strictly type our dispatch actions here.
export type Action<T> =
  | { type : 'reset',  payload : T }
  | { type : 'update', payload : Partial<T> }

// These types are useful for outside integrations.
export type StoreAPI<T> = ReturnType<typeof useStore<T>>

function reducer<T> (
  store  : T,
  action : Action<T>
) : T {
  try {
    const { type, payload } = action
    switch (type) {
      case 'reset':
        return payload
      case 'update':
        return { ...store, ...payload }
      default:
        throw new Error(`Invalid action: ${String(type)}`)
    }
  } catch (err) {
    console.error(err)
    const { message } = err as Error
    return { ...store, error: message }
  }
}

export function useStore<T> (defaults : T) {
  /**
   * Create a reducer store with custom hooks, then
   * return it along with our Store API.
   */

  // const reducer = createReducer(hooks)
  const [ store, dispatch ] = useReducer(reducer<T>, defaults)

  function reset (store : Partial<T>) {
    const payload = { ...defaults, ...store }
    dispatch({ type: 'reset', payload })
  }

  function update (store : Partial<T>) {
    dispatch({ type: 'update', payload: store })
  }

  return {
    reset,
    store,
    update
  }
}
