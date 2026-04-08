import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

export default new Vuetify({
	icons: {
		iconfont: 'mdi'
	},
	theme: {
		themes: {
			light: {
				primary:   '#2563EB', // electric blue — clean, premium CTA colour
				secondary: '#0F172A', // near-black slate — used for nav / headings
				accent:    '#F59E0B', // amber — savings highlights
				success:   '#059669', // emerald — clipped / progress
				error:     '#DC2626', // red
				warning:   '#D97706', // amber-600
				info:      '#0EA5E9', // sky
				anchor:    '#2563EB'
			}
		},
		options: {
			customProperties: true
		}
	}
});
