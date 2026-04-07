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
		userCheck: function() {
			const that = this;
			return new Promise(function(resolve) {
				// Use loggedOut param to simulate a logged-out user for demo purposes
				that.url = that.$store.state.app.urlParam.loggedOut
					? 'public/json/user2.json'
					: 'public/json/user.json';

				axios.get(that.url).then((response) => {
					const data = response.data.user;
					Object.assign(data, {
						checked: true,
						now: new Date(data.now)
					});

					if (data.user_status === 'notSignedIn') {
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
			const that = this;
			axios
				.get(that.authUrl, {
					params: {
						targetPath: window.location.pathname + window.location.search
					}
				})
				.then((data) => {
					if (data.responseText) {
						console.error('Login error');
					} else {
						that.state = 2;
						location.reload();
					}
				});
		},
		getLinks: function() {
			const links = {
				login:
					window.location.origin +
					'/login?targetPath=' +
					window.location.pathname +
					window.location.search
			};
			this.$store.commit('userData', { links: links });
		}
	}
};
