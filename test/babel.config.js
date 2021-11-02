module.exports = {
    "presets": [
        ["@babel/preset-env"],
    ],
    "plugins": [
        ["@vue/babel-plugin-transform-vue-jsx"],
        ["@babel/plugin-transform-runtime", {
            corejs: 3,
            helper: true
        }]
    ],
}
