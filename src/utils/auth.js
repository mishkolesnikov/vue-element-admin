import Cookies from 'js-cookie'

const TokenKey = 'Auth-Token'

export function getToken() {
  const token = Cookies.get(TokenKey)
  return token ? JSON.parse(token) : null
}

export function getAccessToken() {
  const token = Cookies.get(TokenKey)
  return token ? JSON.parse(token).access_token : null
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
