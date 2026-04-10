import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/erp-service/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/erp-service/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/erp-service/logout',
    method: 'post'
  })
}

export function refreshToken(refreshToken) {
  return request({
    url: '/erp-service/auth/refresh',
    method: 'post',
    data: { refreshToken }
  })
}
