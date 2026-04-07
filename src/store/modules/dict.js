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
  /**
   * 加载字典（新增convertToNumber参数，控制dictValue是否转数字）
   * @param {Object} commit/state - Vuex内置参数
   * @param {Object} options - 入参对象
   * @param {string} options.dictKey - 字典key（必填）
   * @param {boolean} options.convertToNumber - true=转数字，false=不转（必填）
   */
  async loadDict({ commit, state }, options) {
    const { dictKey, convertToNumber } = options
    // 缓存存在则直接返回
    if (state.dictCache[dictKey]) {
      return state.dictCache[dictKey]
    }

    try {
      const res = await request({
        url: `/api/dict/get/${dictKey}`,
        method: 'get'
      })
      let list = res.data.dictList || []

      // 根据参数决定是否将dictValue转为数字
      if (convertToNumber) {
        list = list.map(item => ({
          ...item,
          // 仅转换dictValue，兼容字符串数字/纯数字/空值
          dictValue: item.dictValue !== undefined && item.dictValue !== null
            ? Number(item.dictValue)
            : item.dictValue
        }))
      }

      commit('SET_DICT', { key: dictKey, list })
      return list
    } catch (e) {
      console.error(`加载字典【${dictKey}】失败`, e)
      return []
    }
  },

  // 预加载所有常用字典（按需求为每个字典设置convertToNumber参数）
  async loadAllDict({ dispatch }) {
    // 格式：await dispatch('loadDict', { dictKey: 字典key, convertToNumber: true/false })
    await dispatch('loadDict', { dictKey: DICT_KEY.SIZE, convertToNumber: false })
    await dispatch('loadDict', { dictKey: DICT_KEY.COLOR, convertToNumber: false })
    await dispatch('loadDict', { dictKey: DICT_KEY.PRUCHASE_ORDER_STATUS, convertToNumber: true })
    await dispatch('loadDict', { dictKey: DICT_KEY.PRUCHASE_IN_STATUS, convertToNumber: true })
    await dispatch('loadDict', { dictKey: DICT_KEY.MASTER_ORDER_TYPE, convertToNumber: true })
    await dispatch('loadDict', { dictKey: DICT_KEY.DELIVERY_TYPE, convertToNumber: true })
    await dispatch('loadDict', { dictKey: DICT_KEY.MASTER_ORDER_STATUS, convertToNumber: true })
    await dispatch('loadDict', { dictKey: DICT_KEY.SUB_ORDER_STATUS, convertToNumber: true })
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
  getPurchaseInStatus: (state) => state.dictCache[DICT_KEY.PRUCHASE_IN_STATUS] || [],
  getMasterOrderTypes: (state) => state.dictCache[DICT_KEY.MASTER_ORDER_TYPE] || [],
  getDeliveryTypes: (state) => state.dictCache[DICT_KEY.DELIVERY_TYPE] || [],
  getMasterOrderStatus: (state) => state.dictCache[DICT_KEY.MASTER_ORDER_STATUS] || [],
  getSubOrderStatus: (state) => state.dictCache[DICT_KEY.SUB_ORDER_STATUS] || [],
  getRoleList: (state) => state.dictCache[DICT_KEY.ROLE_LIST] || []
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
