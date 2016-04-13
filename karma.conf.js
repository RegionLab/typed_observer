module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai'],
        files: ['tests/*.spec.js'],
        browsers: ['PhantomJS']
    })
};