import axios from 'axios'
import { randomString, pkce } from './utils'

const baseURL = 'https://q.trap.jp/api/1.0'

axios.defaults.baseURL = baseURL

const api = {
  setAuthToken: function (token) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  },

  redirectAuthorizationEndpoint: async function () {
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
  },

  fetchAuthToken: async function (code, verifier) {
    return axios.post(`/oauth2/token`, new URLSearchParams({
      client_id: process.env.VUE_APP_API_CLIENT_ID,
      grant_type: 'authorization_code',
      code_verifier: verifier,
      code
    }))
  },

  getMe: async function () {
    return axios.get('/users/me')
  },

  getUserTags: function (userId) {
    return axios.get(`/users/${userId}/tags`)
  },

  addTag: async function (userId, tagName) {
    return await axios.post(`/users/${userId}/tags`, { tag: tagName })
  },

  deleteTag: async function (userId, tagId) {
    return await axios.delete(`/users/${userId}/tags/${tagId}`)
  },

  lockTag: async function (userId, tagId) {
    return await patchTag(userId, tagId, true)
  },

  unlockTag: async function (userId, tagId) {
    return await patchTag(userId, tagId, false)
  }
}

async function patchTag(userId, tagId, isLocked) {
  return await axios.patch(`/users/${userId}/tags/${tagId}`, { isLocked: isLocked })

}

export default api
