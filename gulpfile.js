var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

var paths = {
	less: ['./less/*.less'],
	js: ['./components/*.js','./main.js']
};

gulp.task('less', function () {
	return gulp.src('./less/style.less')
	.pipe(plumber())
	.pipe(less())
	.pipe(gulp.dest('./css'))
	.pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
  return gulp.src([
      './components/*.js',
      'main.js',
    ])
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('./'))
	.pipe(reload({stream: true}));
});

// 静态服务器
gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: "./",
		    proxy: "localhost"
        }
    });
	gulp.watch(paths.less, ['less']);
	gulp.watch(paths.js, ['scripts']);
});
