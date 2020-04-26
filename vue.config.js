const path = require('path');

module.exports = {
	transpileDependencies: [ 'vuetify' ],
	outputDir: 'dist',
	indexPath: '../index.html',
	publicPath: process.env.NODE_ENV === 'production' ? './dist' : '/coupons/dist',
	//publicPath: 'dist',
	chainWebpack: (config) => {
		config.plugin('html').tap((args) => {
			args[0].template = path.join(__dirname, 'template.html');
			return args;
		});
	},
	devServer: {
		proxy: 'http://localhost'
	},
	productionSourceMap: false //no source maps
	// configureWebpack: {
	// 	optimization: {
	// 		splitChunks: {
	// 			name: true,
	// 			chunks: 'all',
	// 			cacheGroups: {
	// 				vendors: {
	// 					test: /[\\/]node_modules[\\/]/,
	// 					priority: -10,
	// 					filename: 'vendors.bundle.js'
	// 				},
	// 				default: {
	// 					priority: -20,
	// 					name: 'dist/bundle'
	// 				}
	// 			}
	// 		}
	// 	},
	// 	output: {
	// 		filename: 'bundle.js'
	// 	},

	// 	plugins: []
	// }
};
