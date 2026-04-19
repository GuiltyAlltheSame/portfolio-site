const { src, dest, series, parallel, watch } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();

// copy HTML
function copyHTML() {
  return src('src/*.html')
    .pipe(dest('dist'));
}

// copy fonts
function copyFonts() {
  return src('src/assets/fonts/**/*.*', { encoding: false })
    .pipe(dest('dist/assets/fonts'));
}

// copy img
function copyImages() {
  return src('src/assets/img/**/*.*' , { encoding: false })
    .pipe(dest('dist/assets/img'));
}

// minify CSS
function minifyCSS() {
  return src('src/css/*.css')
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(dest('dist/css'));
}

//server start func
function serve(done) {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    notify: false,
    open: true
  });
  done();
}

//browser reloading func
function reload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  watch('src/*.html', series(copyHTML, reload));
  watch('src/css/*.css', series(minifyCSS, reload));
  watch('src/js/**/*.js', series(copyScripts, reload));
  watch('src/assets/fonts/**/*.{woff,woff2}', series(copyFonts, reload));
  watch('src/assets/img/**/*.{png,jpg,jpeg,gif,svg,webp}', series(copyImages, reload));
}

function copyScripts() {
  return src('src/js/**/*.js', { base: 'src/js' })
    .pipe(dest('dist/js'));
}

const build = series(
  parallel(copyHTML, minifyCSS, copyScripts, copyFonts, copyImages)
);

// Экспортируем задачи
exports.build = build;

exports.default = series(
  build,
  serve,
  watchFiles
);