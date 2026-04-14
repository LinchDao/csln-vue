import request from '@/utils/request'

export function listPermission() {
  return request({
    url: '/erp-service/permission/list',
    method: 'get'
  })
}

export function pagePermission(data) {
  return request({
    url: '/erp-service/permission/page',
    method: 'post',
    data
  })
}

export function getPermission(id) {
  return request({
    url: `/erp-service/permission/get/${id}`,
    method: 'get'
  })
}

export function addPermission(data) {
  return request({
    url: '/erp-service/permission/add',
    method: 'post',
    data
  })
}

export function updatePermission(data) {
  return request({
    url: '/erp-service/permission/update',
    method: 'put',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: `/erp-service/permission/delete/${id}`,
    method: 'delete'
  })
}
