import { Buff, Bytes } from '@cmdcode/buff-utils'

function checkLib () {
  if (crypto.subtle === undefined) {
    throw new Error('WebCrypto library is undefined!')
  }
}

async function getKey (secret : Bytes) {
  /** Derive a CryptoKey object (for Webcrypto library). */
  checkLib()
  const seed    = Buff.bytes(secret)
  const options = { name: 'AES-CBC' }
  const usage   = [ 'encrypt', 'decrypt' ] as KeyUsage[]
  return crypto.subtle.importKey('raw', seed, options, true, usage)
}

async function encrypt (
  message : string,
  secret  : Bytes,
  vector ?: Bytes
) {
  /** Encrypt a message using a CryptoKey object. */
  const key = await getKey(secret)
  const msg = Buff.str(message)
  const iv  = (vector !== undefined)
    ? Buff.bytes(vector)
    : Buff.random(16)
  const opt = { name: 'AES-CBC', iv }
  return crypto.subtle.encrypt(opt, key, msg)
    .then((bytes) => new Buff(bytes).b64url + '?iv=' + iv.b64url)
}

async function decrypt (
  encoded : string,
  secret  : Bytes
) {
  /** Decrypt an encrypted message using a CryptoKey object. */
  if (!encoded.includes('?iv=')) {
    throw new Error('Missing vector on encrypted message!')
  }
  const [ message, vector ] = encoded.split('?iv=')
  const key = await getKey(secret)
  const msg = Buff.b64url(message)
  const iv  = Buff.b64url(vector)
  const opt = { name: 'AES-CBC', iv }
  return crypto.subtle.decrypt(opt, key, msg)
    .then(decoded => Buff.raw(decoded).str)
}

export const Cipher = {
  checkLib,
  getKey,
  encrypt,
  decrypt
}
