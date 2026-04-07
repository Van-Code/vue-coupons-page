import axios from 'axios';
import { uniqBy } from 'lodash';

export const Coupons = {
	methods: {
		url: function() {
			return './json/data.json';
		},
		fetch: function(opts) {
			axios
				.get(this.url())
				.then((response) => {
					if (response.data.result) {
						let coupons = response.data.coupons;
						coupons.forEach((cpn) => {
							response.data.status.forEach((cs) => {
								if (cs.coupon_id === cpn.coupon_id) {
									Object.assign(cpn, { status: cs });
								}
							});
						});
						opts.success(uniqBy(coupons, 'coupon_id'));
					} else {
						opts.error(response.data.message);
					}
				})
				.catch((err) => {
					opts.error(err);
				});
		},
		sortOpts: [
			{ id: 'Expiration', selected: false },
			{ id: 'Value', selected: false },
			{ id: 'Most_Recent', selected: false },
			{ id: 'Category', selected: false }
		],
		sortKey: 'Most_Recent'
	}
};
