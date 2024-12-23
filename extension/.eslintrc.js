module.exports = {
    plugins: ['eslint-plugin-tsdoc'],
    extends: ['alloy', 'alloy/typescript'],
    ignorePatterns: ['/build/dist/', '/coverage/', '/dist/', '/node_modules/', '/.eslintcache', 'debug.log'],
    env: {
        browser: true,
    },
    rules: {
        'no-param-reassign': 'off',
        'max-params': 'off',
        'tsdoc/syntax': 'warn',
        'max-depth': 0,
    },
    root: true,
};