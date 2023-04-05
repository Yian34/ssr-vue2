import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/vue-admin-template/customer/list',
    method: 'get',
    params
  })
}
