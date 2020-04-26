import axios from 'axios';
export const UserMixins = {
	data() {
		return {
			state: 0,
			url: '/mypath/user',
			authUrl: '/mypath/login',
			clearUrl: '/mypath/clear',
			user: {
				checked: false,
				state: 0
			}
		};
	},
	created() {
		this.getLinks();
	},
	methods: {
		userCheck: function(options) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.url = 'coupons/src/json/user.json?';
				if (that.$store.state.app.urlParam.loggedOut) {
					that.url = 'coupons/src/json/user2.json?';
				}
				axios.get(that.url).then((response) => {
					let data = response.data.user;
					Object.assign(data, {
						checked: true,
						now: new Date(data.now)
					});
					if (data && data.user_status === 'notSignedIn') {
						data.state = 0;
					} else if (data.user_status === 'signedIn' && data.card !== '') {
						data.state = 2;
					} else {
						data.state = 1;
					}
					that.user = data;

					that.$store.commit('userData', that.user);
					resolve();
				});
			});
		},
		logIn: function() {
			var that = this;
			axios
				.get(that.authUrl, {
					params: {
						targetPath: window.location.pathname + window.location.search
					}
				})
				.then((data) => {
					if (data.responseText) {
						console.log('There was an error');
					} else {
						that.state = 2;
						location.reload();
					}
				});
		},
		getLinks: function() {
			var links = {
				login: window.location.origin + '/login?targetPath=' + window.location.pathname + window.location.search
			};
			this.$store.commit('userData', { links: links });
		}
	}
};
