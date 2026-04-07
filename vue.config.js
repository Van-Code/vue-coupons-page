const path = require('path');

module.exports = {
	transpileDependencies: [ 'vuetify' ],
	outputDir: 'dist',
	indexPath: '../index.html',
	publicPath: process.env.NODE_ENV === 'production' ? './dist' : '/coupons/dist',
	chainWebpack: (config) => {
		config.plugin('html').tap((args) => {
			args[0].template = path.join(__dirname, 'template.html');
			return args;
		});
	},
	devServer: {
		proxy: 'http://localhost'
	},
	productionSourceMap: false
};
