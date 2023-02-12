import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"
import SecureLS from "secure-ls"
const ls = new SecureLS({ isCompression: false })

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
		user: {
      id: '',
      nickname: '',
      avatar: '',
      role: '',
      status: '',
      identifier: '',
      credential: '',
      create_time: '',
      real_name: '',
      identity_card_type: '',
      identity_card_no: '',
      phone: '',
      email: '',
      gender: '',
			student_no: '',
      modified_time: '',
    }
  },
  mutations: {
		updateUser (state, user) {
      state.user = user
    },
    updataBusiness (state, business) {
      state.business = business
    },
    clearUser (state, user) {
      state.user = user
    }
  },
  actions: {
  },
  modules: {
  },
	plugins: [createPersistedState({
    key: 'userInfo',  //儲存在 localStorage 的 key
    // 加密localStorage中的内容
    // storage: {
    //     getItem: key => ls.get(key),
    //     setItem: (key, value) => ls.set(key, value, {expires: 1000 * 60 * 60 * 2}),
    //     removeItem: key => ls.remove(key)
    // },
  })]
})
