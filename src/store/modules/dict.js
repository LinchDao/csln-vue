import request from '@/utils/request'
import { DICT_KEY } from '@/utils/dict'

const state = {
  dictCache: {}
}

const mutations = {
  // 设置字典缓存
  SET_DICT(state, { key, list }) {
    state.dictCache[key] = list
  }
}

const actions = {

  async loadDict({ commit, state }, dictKey) {
    if (state.dictCache[dictKey]) {
      return state.dictCache[dictKey]
    }
    try {
      const res = await request({
        url: `/api/dict/get/${dictKey}`,
        method: 'get'
      })
      const list = res.data.dictList || []
      commit('SET_DICT', { key: dictKey, list })
      return list
    } catch (e) {
      console.error(`加载字典【${dictKey}】失败`, e)
      return []
    }
  },

  // 预加载所有常用字典（页面一打开就加载）
  async loadAllDict({ dispatch }) {
    await dispatch('loadDict', DICT_KEY.SIZE)
    await dispatch('loadDict', DICT_KEY.COLOR)
    await dispatch('loadDict', DICT_KEY.PRUCHASE_ORDER_STATUS)
    await dispatch('loadDict', DICT_KEY.PRUCHASE_IN_STATUS)
  },

  // 清空某个字典缓存（编辑后用）
  clearDict({ commit }, dictKey) {
    commit('SET_DICT', { key: dictKey, list: null })
  }
}

const getters = {

  getSizeDict: (state) => state.dictCache[DICT_KEY.SIZE] || [],
  getColorDict: (state) => state.dictCache[DICT_KEY.COLOR] || [],
  getPurchaseOrderStatus: (state) => state.dictCache[DICT_KEY.PRUCHASE_ORDER_STATUS] || [],
  getPurchaseInStatus: (state) => state.dictCache[DICT_KEY.PRUCHASE_IN_STATUS] || []

}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
