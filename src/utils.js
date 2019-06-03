const b64Chars = { '+': '-', '/': '_', '=': '' }

const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'


export function randomString(length) {
  let array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  array = array.map(x => validChars.charCodeAt(x % validChars.length))
  return String.fromCharCode(...array)
}

export async function pkce(verifier) {
  return sha256(verifier).then(bufferToBase64UrlEncoded)
}

function urlEncodeB64(input) {
  return input.replace(/[+/=]/g, m => b64Chars[m])
}

function bufferToBase64UrlEncoded(input) {
  const bytes = new Uint8Array(input)
  return urlEncodeB64(window.btoa(String.fromCharCode(...bytes)))
}

function sha256(message) {
  const data = new TextEncoder().encode(message)
  return window.crypto.subtle.digest('SHA-256', data)
}



