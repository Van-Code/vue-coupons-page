import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
	icons: {
		iconfont: 'mdiSvg'
	},
	theme: {
		themes: {
			light: {
				primary:   '#E63946',
				secondary: '#1D3557',
				accent:    '#A8DADC',
				success:   '#2D6A4F',
				error:     '#B91C1C',
				warning:   '#D97706',
				info:      '#457B9D',
				anchor:    '#1D3557'
			}
		},
		options: {
			customProperties: true // enables CSS custom property generation for theme colors
		}
	}
});
