import axios from 'axios';
import { USER_STATES } from '@/constants';

export const UserMixins = {
	data() {
		return {
			authUrl: '/mypath/login',
			user: {
				checked: false,
				state: USER_STATES.LOGGED_OUT
			}
		};
	},
	created() {
		this.getLinks();
	},
	methods: {
		userCheck() {
			return new Promise((resolve) => {
				// Use ?loggedOut query param to simulate a logged-out user for demo
				const params = new URLSearchParams(window.location.search);
				const url = params.get('loggedOut')
					? 'public/json/user2.json'
					: 'public/json/user.json';

				axios.get(url).then((response) => {
					const data = response.data.user;
					Object.assign(data, { checked: true, now: new Date(data.now) });

					if (data.user_status === 'notSignedIn') {
						data.state = USER_STATES.LOGGED_OUT;
					} else if (data.user_status === 'signedIn' && data.card !== '') {
						data.state = USER_STATES.SIGNED_IN_WITH_CARD;
					} else {
						data.state = USER_STATES.SIGNED_IN_NO_CARD;
					}

					this.user = data;
					this.$store.commit('userData', this.user);
					resolve();
				});
			});
		},

		logIn() {
			const targetPath = window.location.pathname + window.location.search;
			axios.get(this.authUrl, { params: { targetPath } }).then((data) => {
				if (data.responseText) {
					console.error('Login error');
				} else {
					location.reload();
				}
			});
		},

		getLinks() {
			const targetPath = window.location.pathname + window.location.search;
			this.$store.commit('userData', {
				links: { login: `${window.location.origin}/login?targetPath=${targetPath}` }
			});
		}
	}
};
