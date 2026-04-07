const path = require('path');

module.exports = {
	transpileDependencies: ['vuetify'],
	outputDir: 'dist',
	// In production, publicPath must match the GitHub Pages sub-path: /repo-name/
	// In development, use / so the dev server resolves assets from root
	publicPath: process.env.NODE_ENV === 'production' ? '/vue-coupons-page/' : '/',
	chainWebpack: (config) => {
		config.plugin('html').tap((args) => {
			args[0].template = path.join(__dirname, 'template.html');
			return args;
		});
	},
	productionSourceMap: false
};
