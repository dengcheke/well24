const {src, dest} = require('gulp')
const less = require('gulp-less')
const cssmin = require('gulp-minify-css')
const LessAutoprefix = require('less-plugin-autoprefix');


return src('./src/theme/dark/*.less')
    .pipe(less({
        plugins: [
            new LessAutoprefix({browsers: ['last 2 versions']})
        ]
    }))
    .pipe(cssmin())
    .pipe(dest('./dist/style/theme/dark'))

