const { src, dest, series, parallel, watch } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();


const MODULES = [
  'src/js/db.js',
  'src/js/login.js',
  'src/js/reviews.js',
  'src/js/messages.js',
  'src/js/admin.js',
  'src/js/likes.js'
];

// Копируем HTML
function copyHTML() {
  return src('src/*.html')
    .pipe(dest('dist'));
}

// Копируем шрифты
function copyFonts() {
  return src('src/assets/fonts/**/*.*', { encoding: false })
    .pipe(dest('dist/assets/fonts'));
}

// Копируем изображения
function copyImages() {
  return src('src/assets/img/**/*.*' , { encoding: false })
    .pipe(dest('dist/assets/img'));
}

// Минификация CSS
function minifyCSS() {
  return src('src/css/*.css')
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(dest('dist/css'));
}
// Минификация JS
function minifyJS() {
  return src(['src/js/*.js', ...MODULES.map(m => '!'+m)]) // исключили MODULES
    .pipe(terser())
    .pipe(dest('dist/js'));
}

//Функция для запуска сервера
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

//Функция для перезагрузки браузера
function reload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  watch('src/*.html', series(copyHTML, reload));
  watch('src/css/*.css', series(minifyCSS, reload));
  watch('src/js/*.js', series(parallel(minifyJS, copyModules), reload));
  watch('src/assets/fonts/**/*.{woff,woff2}', series(copyFonts, reload));
  watch('src/assets/img/**/*.{png,jpg,jpeg,gif,svg,webp}', series(copyImages, reload));
}

function copyModules() {
  return src(MODULES, { base: 'src/js' })
    .pipe(dest('dist/js'));
}



// Экспортируем задачи
exports.default = series(
  parallel(copyHTML, minifyCSS, minifyJS, copyModules, copyFonts, copyImages),
  serve,
  watchFiles
);