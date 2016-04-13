module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai'],
        files: ['tests/builder.js'],
        browsers: ['PhantomJS'],
        preprocessors: {
            // add webpack as preprocessor
            'tests/builder.js': ['webpack']
        },
        webpack: {
            entry: ['babel-polyfill'],
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
        },
        plugins: [
            'karma-phantomjs-launcher',
            'karma-mocha',
            'karma-chai',
            'karma-webpack',
        ],
    })
};