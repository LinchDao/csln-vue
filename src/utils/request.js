import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken, TokenKey, getRefreshToken, setToken, setRefreshToken } from '@/utils/auth'

// 标记是否正在刷新 Token
let isRefreshing = false
// 重试队列，用于存储在刷新 Token 期间发起的请求
let requests = []

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      config.headers[TokenKey] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    // 处理文件流响应
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
        if (response.status !== 200) {
          return Promise.reject(new Error('下载文件失败'))
        }
      }
      return response.data
    }

    const res = response.data

    // 鉴权失败/Token过期处理 (401)
    if (res.code === 401) {
      const config = response.config

      if (!isRefreshing) {
        isRefreshing = true
        const refreshTokenStr = getRefreshToken()

        if (!refreshTokenStr) {
          // 没有刷新令牌，直接跳转登录
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
          return Promise.reject(new Error('登录已过期，请重新登录'))
        }

        // 发起刷新令牌请求（必须使用原始 axios 实例避免拦截器死循环）
        return axios.post(process.env.VUE_APP_BASE_API + '/erp-service/auth/refresh', { refreshToken: refreshTokenStr })
          .then(refreshRes => {
            const resData = refreshRes.data
            if (resData.code === 200) {
              const { accessToken, refreshToken: newRefreshToken, token } = resData.data
              const finalToken = accessToken || token

              // 1. 更新全局状态和本地存储
              store.commit('user/SET_TOKEN', finalToken)
              store.commit('user/SET_REFRESH_TOKEN', newRefreshToken)
              setToken(finalToken)
              setRefreshToken(newRefreshToken)

              // 2. 更新当前请求的 Header 并重新发起
              config.headers[TokenKey] = finalToken

              // 3. 执行队列中等待的请求
              requests.forEach(cb => cb(finalToken))
              requests = []

              return service(config)
            } else {
              // 刷新令牌也失效了
              store.dispatch('user/resetToken').then(() => {
                location.reload()
              })
              return Promise.reject(new Error(resData.message || '登录过期'))
            }
          })
          .catch(err => {
            store.dispatch('user/resetToken').then(() => {
              location.reload()
            })
            return Promise.reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      } else {
        // 正在刷新中，将当前请求挂起并放入队列
        return new Promise((resolve) => {
          requests.push((newToken) => {
            config.headers[TokenKey] = newToken
            resolve(service(config))
          })
        })
      }
    }

    // 常规业务错误处理
    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug

    // 如果 HTTP 状态码直接返回 401 也可以在此处理，
    // 但目前系统主要依赖后端 Result 中的 code。

    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
