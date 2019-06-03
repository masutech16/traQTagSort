import axios from 'axios'
import { randomString, pkce } from './utils'

const baseURL = 'https://q.trap.jp/api/1.0'

axios.defaults.baseURL = baseURL

export function getMe() {
  return axios.get(`/users/me`)
}

export function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export async function redirectAuthorizationEndpoint() {
  const state = randomString(10)
  const codeVerifier = randomString(43)
  const codeChallenge = await pkce(codeVerifier)

  localStorage.setItem(`login-code-verifier-${state}`, codeVerifier)

  const authorizationEndpointUrl = new URL(`${baseURL}/oauth2/authorize`)
  authorizationEndpointUrl.search = new URLSearchParams({
    client_id: process.env.VUE_APP_API_CLIENT_ID,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state
  })
  window.location.assign(authorizationEndpointUrl)
}

export async function fetchAuthToken(code, verifier) {
  return axios.post(`/oauth2/token`, new URLSearchParams({
    client_id: process.env.VUE_APP_API_CLIENT_ID,
    grant_type: 'authorization_code',
    code_verifier: verifier,
    code
  }))

}
