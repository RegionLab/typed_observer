var path = require("path");


module.exports = {
    entry: {
        vanila: './vanila.js',
        react: './react.js',
        angular: './angular.js'
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename:'[name].js'
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
    watch:true,
    cache: true,
    resolveModules: {
        modulesDirectories: ['node_modules'],
    }
};