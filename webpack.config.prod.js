const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
	template: __dirname + '/client/index.html',
	filename: 'index.html',
	inject: 'body',
});

const uglifySettings = {
	mangle: {
		screw_ie8: true,
		keep_fnames: true,
	},
	compress: {
		warnings: false,
		sequences: true,
		dead_code: true,
		conditionals: true,
		booleans: true,
		unused: true,
		if_return: true,
		join_vars: true,
		drop_console: true,
		screw_ie8: true,
	},
	output: {
		comments: false,
	},
};

module.exports = {
	entry: {
		'/static/js/bundle': './client/loom',
	},
	output: {
		path: './python/loompy',
		filename: '[name].[hash].js',
		sourceMapFilename: '[name].[hash].map',
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				include: path.join(__dirname, 'client'),
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
		new webpack.optimize.UglifyJsPlugin(uglifySettings),
		HTMLWebpackPluginConfig,
	],
};