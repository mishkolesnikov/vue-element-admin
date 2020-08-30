import { login, logout, getCurrentUserInfo, refreshToken, updateUser } from '@/api/user'
import { setToken, removeToken, getAccessToken, getToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getAccessToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  email: '',
  user: {}
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_USER: (state, user) => {
    state.user = user
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ email: username.trim(), password: password }).then(response => {
        const { token } = response
        commit('SET_TOKEN', token.access_token)
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  refreshToken({ commit }) {
    return refreshToken(getToken())
      .then(response => {
        const { token } = response
        commit('SET_TOKEN', token.access_token)
        setToken(token)
        return response.token
      })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getCurrentUserInfo().then(data => {
        commit('SET_USER', data)

        const avatar = `/users/${data.id}/photo?token=${state.token}`
        const { firstName, email, roles } = data
        const introduction = `Hello, my name is ${firstName}`

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getCurrentUserInfo: roles must be a non-null array!')
        }

        commit('SET_NAME', firstName)
        commit('SET_AVATAR', avatar)
        commit('SET_EMAIL', email)
        commit('SET_ROLES', roles)
        commit('SET_INTRODUCTION', introduction)
        resolve({ roles })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', null)
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', null)
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const roles = [role]

    commit('SET_ROLES', roles)
    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  },

  updateUser({ commit, state, dispatch }, user) {
    const newUser = {
      ...state.user,
      firstName: user.name,
      email: user.email
    }

    return updateUser(newUser).then(token => {
      commit('SET_TOKEN', token.access_token)
      setToken(token)
      return dispatch('getInfo')
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
