var path = require("path");
var webpack = require("webpack");

const NODE_ENV = process.env.NODE_ENV || 'development';

const isDev = NODE_ENV == 'development';

module.exports = {
    entry: {
        app: ['./src/index.js'],
    },
    include: [path.resolve(__dirname, 'src')],
    output: {
        filename: path.resolve(__dirname, 'bundle/observer.js'),
    },
    resolve: {
        //root: path.resolve(__dirname, './source/javascript'),
        extensions: ['', '.js'],
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules)/,
                loaders: ['babel?presets[]=es2015'],
            }
        ],
        noParse: []
    },

    watch: isDev,
    cache: true,
    watchOptions: {
        aggregateTimeout: 200,
    },
    devtool: isDev ? "inline-source-map" : null,
    resolveModules: {
        modulesDirectories: ['node_modules'],
    },
    plugins: [
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
            isDev: NODE_ENV === 'development'
        })
    ],

    devServer: {
        //contentBase: __dirname+'/public',
        hot: true,
    }
};