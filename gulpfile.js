/**
 * Client source build manager with BrowserSync
 *
 * @author dodortus (dodortus@gmail.com)
 * @fileOverview 클라이언트 정적파일 빌드 및 변경 감지 매니저
 * @Git https://github.com/dodortus/gulp-browser-sync
 */

// modules
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const minifyCSS = require('gulp-minify-css');
const browserSync = require('browser-sync').create(); // browser-sync 호출

// target directory
const src = 'public/src';   // source directory path
const dist = 'public/dist'; // result directory path
const paths = {
  html: '*.html',
	js: src + '/js/*.js',
	css: src + '/css/*.css'
};

// HTML의 변화를 감지하고 갱신한다.
gulp.task('html', function () {
  return gulp.src(paths.html)
    /**
    * HTML 파일을 browserSync로 브라우저에 반영
    */
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

/**
 * 자바스크립트 파일을 하나로 합치고 압축한다.
 * 개별파일설정  gulp.src([file1.js', file2.js'])
 */
gulp.task('combine-js', function() {
	return gulp.src(paths.js)
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest(dist + '/js'))
    /**
    * 스크립트 파일을 browserSync로 브라우저에 반영
    */
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

// CSS 압축
gulp.task('combine-css', function() {
  return gulp.src(paths.css)
    .pipe(concat('all.css'))
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(gulp.dest(dist + '/css'))
    /**
    * CSS 파일을 browserSync로 브라우저에 반영
    */
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

// 브라우저 싱크 서버 초기화
gulp.task('browserSync', ['html', 'combine-js', 'combine-css'], function() {
  return browserSync.init({
    port : 7001,
    server: {
      baseDir: './'
    },
    //proxy: "localhost:8080" // 다른 개발 서버에 프록시 연결 하여 브라우저 싱크 사용시 활성화 한다.
  });
});

// 파일 변경 감지
gulp.task('watch', function() {
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.js, ['combine-js']);
  gulp.watch(paths.css, ['combine-css']);
});

// 소스 압축
gulp.task('combine', ['combine-js', 'combine-css']);

// 기본 task 설정
gulp.task('default', ['browserSync','watch']);
