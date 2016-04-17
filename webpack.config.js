var path = require("path");


module.exports = {
    entry:  ['babel-polyfill', './src/index.js'],
    include: [path.resolve(__dirname, 'src')],
    output: {
        filename:'index.js',
        libraryTarget: 'umd',
        library: 'typed_observer',
        umdNamedDefine: true
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
    resolveModules: {
        modulesDirectories: ['node_modules'],
    }
};