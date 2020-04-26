import axios from 'axios';
export const Coupons = {
	methods: {
		url: function() {
			return 'coupons/src/json/data.json';
		},
		fetch: function(opts) {
			let that = this;
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
							that.parse(cpn);
						});
						opts.success(_.uniqBy(coupons, 'coupon_id'));
					} else {
						opts.error(response.data.message);
					}
				})
				.catch((response) => {});
		},
		sortOpts: [
			{ id: 'Expiration', selected: false },
			{ id: 'Value', selected: false },
			{ id: 'Most_Recent', selected: false },
			{ id: 'Category', selected: false }
		],
		sortKey: 'Expiration',
		sort_lists: {},
		parse: function(data) {
			// set most recent to default sort key
			this.sortOpts.filter((x) => {
				if (x.selected === true) {
					x.selected = false;
				}
			});
			this.sortOpts.filter((x) => {
				if (x.id === 'Most_Recent') {
					x.selected = true;
				}
			});

			return data.coupons;
		}
	}
};
