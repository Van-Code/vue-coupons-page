import axios from 'axios';

export const couponMixin = {
	methods: {
		getUrl: function() {
			return './json/true.json';
		},
		clip: function(options) {
			options = options || {};
			options.url = this.getUrl();
			axios
				.get(options.url, { params: { action: 'clip', id: options.data.id } })
				.then((response) => {
					if (response.data.result) {
						options.success(options.model);
					} else {
						options.error(options.model, response.data);
					}
				})
				.catch((error) => console.error('Clip error:', error));
		},
		unclip: function(options) {
			options = options || {};
			options.url = this.getUrl();
			axios
				.get(options.url, { params: { action: 'unclip', id: options.data.id } })
				.then((response) => {
					if (response.data.result) {
						options.success();
					} else {
						options.error(options.model, response.data);
					}
				})
				.catch((error) => console.error('Unclip error:', error));
		}
	}
};
