import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state: {
		app: {
			user: {
				state: 0,
				checked: false
			}
		}
	},
	mutations: {
		userData(state, payload) {
			Object.assign(state.app.user, payload);
		},
		userState(state, payload) {
			state.app.user.state = payload.state;
		}
	},
	getters: {
		isLoggedIn: (state) => state.app.user.state > 0
	}
});
