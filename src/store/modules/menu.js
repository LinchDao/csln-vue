import request from '@/utils/request'

export default {
  namespaced: true, // 必须设置为 true
  state: { },
  mutations: { },
  actions: {
    tree({ commit }) {
      return request({
        url: '/api/menu/tree',
        method: 'get'
      })
    }
  }
}

