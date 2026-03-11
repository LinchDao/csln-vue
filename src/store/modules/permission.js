import { constantRoutes } from '@/router'
import Layout from '@/layout/index.vue'

const viewFiles = require.context('@/views', true, /\.vue$/)
const viewComponents = {}
viewFiles.keys().forEach(filePath => {
  const componentName = filePath
    .replace(/^\.\//, '')
    .replace(/\.vue$/, '')
    .split('/')
    .map(part => {
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('')

  const componentModule = viewFiles(filePath)
  const component = componentModule.default || componentModule

  viewComponents[componentName] = component
})

const loadComponent = (componentPath) => {
  const path = componentPath.replace(/^views\//, '')

  console.log('第一步处理后的path:', path)

  const hasIndex = path.endsWith('/index')
  const result = []

  if (hasIndex) {
    // 如果尾缀是index，去掉/index后转换为驼峰，再加上Index
    const pathWithoutIndex = path.replace(/\/index$/, '')
    const camelCase = pathWithoutIndex
      .split('/')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    result.push(camelCase + 'Index')
  } else {
    // 如果尾缀不是index
    // 生成带Index的版本
    const withIndex = path + '/index'
    const camelWithIndex = withIndex
      .split('/')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    result.push(camelWithIndex)

    // 生成不带Index的版本
    const camelWithoutIndex = path
      .split('/')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    result.push(camelWithoutIndex)
  }

  for (let i = 0; i < result.length; i++) {
    const r = result[i]
    if (viewComponents[r]) {
      return viewComponents[r]
    }
  }
  return null
}

// 递归过滤并处理后端路由
function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = JSON.parse(JSON.stringify(route))
    if (tmp.component) {
      if (tmp.component === 'Layout') {
        tmp.component = Layout
      } else {
        tmp.component = loadComponent(tmp.component)
      }
    }

    if (tmp.redirect) {
      // 保持重定向路径不变
    }
    if (tmp.title || tmp.icon) {
      tmp.meta = {}
      tmp.title && (tmp.meta.title = tmp.title)
      tmp.icon && (tmp.meta.icon = tmp.icon)
    }

    delete tmp.id
    delete tmp.parentId
    delete tmp.sort

    if (tmp.children && tmp.children.length > 0) {
      tmp.children = filterAsyncRoutes(tmp.children, roles)

      if (tmp.children.length === 0) {
        delete tmp.children
      }
    }

    res.push(tmp)
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  /**
   * 生成动态路由
   * @param {Array} roles - 用户角色数组
   * @param {Array} backendRoutes - 后端返回的路由数据
   */
  generateRoutes({ commit }, { roles, backendRoutes }) {
    return new Promise((resolve, reject) => {
      try {
        let accessedRoutes = []

        // 根据角色过滤路由
        if (roles.includes('SUPER_ADMIN')) {
          accessedRoutes = filterAsyncRoutes(backendRoutes, roles)
        } else {
          accessedRoutes = filterAsyncRoutes(backendRoutes, roles)
        }
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      } catch (error) {
        console.error('Generate routes error:', error)
        reject(error)
      }
    })
  },

  /**
   * 重置路由（用于登出时清空动态路由）
   */
  resetRoutes({ commit }) {
    commit('SET_ROUTES', [])
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
