import axios from 'axios';
export const couponMixin = {
	methods: {
		getUrl: function() {
			return 'src/json/true.json?';
		},
		clip: function(options) {
			var that = this;
			options = options || {};
			options.url = this.getUrl() + 'clip';
			axios
				.get(options.url, { params: options.data })
				.then((response) => {
					const result = response.data.result;
					if (result) {
						options.success(options.model);
					} else {
						options.error(options.model, response.data);
					}
				})
				.catch((error) => console.log(error));
		},
		unclip: function(options) {
			var that = this;
			options = options || {};
			options.url = this.getUrl() + 'unclip';
			axios
				.get(options.url, { params: options.data })
				.then((response) => {
					const result = response.data.result;
					if (result) {
						options.success();
					} else {
						options.error(options.model, response.data);
					}
				})
				.catch((error) => console.log(error));
		}
	}
};
