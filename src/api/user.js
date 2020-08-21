import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function refreshToken(data) {
  return request({
    url: '/auth/refresh-token',
    method: 'post',
    data: { token: data }
  })
}

export function getInfo(token = 'admin-token') {
  return request({
    url: '/vue-element-admin/user/info',
    method: 'get',
    params: { token: 'admin-token' }
  })
}

export function getCurrentUserInfo() {
  return request({
    url: '/users/current',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/auth/sign-out',
    method: 'post'
  })
}
