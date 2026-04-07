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
		},
		notification: {
			show: false,
			message: '',
			color: 'success'
		}
	},
	mutations: {
		userData(state, payload) {
			Object.assign(state.app.user, payload);
		},
		userState(state, payload) {
			state.app.user.state = payload.state;
		},
		notify(state, { message, color = 'success' }) {
			state.notification = { show: true, message, color };
		},
		clearNotification(state) {
			state.notification.show = false;
		}
	},
	getters: {
		isLoggedIn: (state) => state.app.user.state > 0
	}
});
