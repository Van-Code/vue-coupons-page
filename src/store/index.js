import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
Vue.urlParam = {};
getUrlParam();

Vue.responsive = { current: '' };
//determine device
Vue.responsive = {
	cutoffs: [ 0, 767, 960 ],
	init: function() {
		var that = this;
		that.current = that.getValue(that.dimensions());

		//If the window resizes past a cutoff, reload the page
		window.addEventListener('resize', function(size) {
			var value = that.getValue(that.dimensions());
			if (!Vue.noresizeEvent && that.current !== value) {
				var t = setTimeout(function() {
					location.reload();
				}, 10);
			}
			Vue.responsive.current = that.current;
		});
	},
	getValue: function(obj) {
		var that = this,
			index = 2;
		while (index > 0) {
			if (obj.winW > that.cutoffs[index]) {
				return index;
			}
			index--;
		}
		return index;
	},
	dimensions: function() {
		if (document.body && document.body.offsetWidth) {
			return {
				winW: document.body.offsetWidth,
				winH: document.body.offsetHeight
			};
		} else if (
			document.compatMode == 'CSS1Compat' &&
			document.documentElement &&
			document.documentElement.offsetWidth
		) {
			return {
				winW: document.documentElement.offsetWidth,
				winH: document.documentElement.offsetHeight
			};
		} else if (window.innerWidth && window.innerHeight) {
			return {
				winW: window.innerWidth,
				winH: window.innerHeight
			};
		}
	}
};
Vue.responsive.init();

export const store = new Vuex.Store({
	state: {
		app: {
			user: {
				state: 0
			},
			responsive: {
				current: Vue.responsive.current
			},
			urlParam: Vue.urlParam
		},
		showDialog: false
	},
	mutations: {
		userData(state, payload) {
			Object.assign(state.app.user, payload);
		},
		userState(state, payload) {
			Object.assign(state.app.user, { state: payload.state });
		}
	},
	getters: {
		isLoggedIn: (state) => {
			return state.app.user.state > 0;
		},
		isMobile: (state) => {
			return state.app.responsive.current < 2;
		}
	}
});
function getUrlParam() {
	var match,
		pl = /\+/g, // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function(s) {
			return decodeURIComponent(s.replace(pl, ' '));
		},
		query = window.location.search.substring(1);
	Vue.urlParam = {};
	while ((match = search.exec(query))) Vue.urlParam[decode(match[1])] = decode(match[2]);
}
