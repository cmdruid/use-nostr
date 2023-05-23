export async function sleep (ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function withTimeout <
  T extends (...args : any) => Promise<ReturnType<T> | undefined>
> (fn : T, timeout = 5000) {
  let timer : NodeJS.Timeout
  return new Promise((resolve, reject) => {
    timer = setTimeout(() => { resolve(undefined) }, timeout)
    fn()
      .then((res) => { clearTimeout(timer); resolve(res) })
      .catch(err => { reject(err) })
  })
}

export function objFilter <T extends Record<string, any>> (
  obj    ?: T,
  filter ?: string[]
) {
  if (
    typeof obj === 'object' &&
    Array.isArray(filter)
  ) {
    const entries  = Object.entries(obj)
    const filtered = entries.filter(e => filter.includes(e[0]))
    return Object.fromEntries(filtered)
  }
  return obj
}
