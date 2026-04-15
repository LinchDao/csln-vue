import request from '@/utils/request'
import { DICT_KEY } from '@/utils/dict'
import { getToken, TokenKey } from '@/utils/auth'

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
    if (state.dictCache[dictKey]) {
      return state.dictCache[dictKey]
    }

    try {
      const res = await request({
        url: `/erp-service/dict/get/${dictKey}`,
        method: 'get'
      })
      let list = res.data.dictList || []

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

  // 清空某个字典缓存（编辑后用）
  clearDict({ commit }, dictKey) {
    commit('SET_DICT', { key: dictKey, list: null })
  }
}


function syncFetchDict(dictKey, convertToNumber) {
  try {
    const xhr = new XMLHttpRequest()
    // 同步请求接口（注意：这里使用的是基础URL，请确保与 request.js 一致）
    xhr.open('GET', `${process.env.VUE_APP_BASE_API}/erp-service/dict/get/${dictKey}`, false)
    
    const token = getToken()
    if (token) {
      xhr.setRequestHeader(TokenKey, token)
    }
    
    xhr.send()

    if (xhr.status === 200) {
      const res = JSON.parse(xhr.responseText)
      let list = res.data.dictList || []
      if (convertToNumber) {
        list = list.map(item => ({
          ...item,
          dictValue: item.dictValue !== undefined && item.dictValue !== null ? Number(item.dictValue) : item.dictValue
        }))
      }
      return list
    }
  } catch (e) {
    console.error(`同步加载字典【${dictKey}】异常`, e)
  }
  return []
}

const getters = {
  getDictFromCache: (state) => (dictKey, convertToNumber = false) => {
    if (state.dictCache[dictKey] && state.dictCache[dictKey].length > 0) {
      return state.dictCache[dictKey]
    }
    const list = syncFetchDict(dictKey, convertToNumber)
    if (list && list.length > 0) {
      state.dictCache[dictKey] = list
    }
    return list || []
  },

  getSizeDict: (state, getters) => getters.getDictFromCache(DICT_KEY.SIZE),
  getColorDict: (state, getters) => getters.getDictFromCache(DICT_KEY.COLOR),
  getPurchaseOrderStatus: (state, getters) => getters.getDictFromCache(DICT_KEY.PRUCHASE_ORDER_STATUS, true),
  getPurchaseInStatus: (state, getters) => getters.getDictFromCache(DICT_KEY.PRUCHASE_IN_STATUS, true),
  getMasterOrderTypes: (state, getters) => getters.getDictFromCache(DICT_KEY.MASTER_ORDER_TYPE, true),
  getDeliveryTypes: (state, getters) => getters.getDictFromCache(DICT_KEY.DELIVERY_TYPE, true),
  getMasterOrderStatus: (state, getters) => getters.getDictFromCache(DICT_KEY.MASTER_ORDER_STATUS, true),
  getSubOrderStatus: (state, getters) => getters.getDictFromCache(DICT_KEY.SUB_ORDER_STATUS, true),
  getRoleList: (state, getters) => getters.getDictFromCache(DICT_KEY.ROLE_LIST),
  getCustomerLevels: (state, getters) => getters.getDictFromCache(DICT_KEY.CUSTOMER_LEVEL)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
