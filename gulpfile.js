/**
 * Client source build manager with BrowserSync
 *
 * @author dodortus (dodortus@gmail.com)
 * @fileOverview 클라이언트 정적파일 빌드 및 변경 감지 매니저
 * @Git https://github.com/dodortus/gulp-browser-sync
 */

// Load modules
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const minifyCSS = require('gulp-minify-css');
const browserSync = require('browser-sync').create(); // browser-sync 호출

// Target directory
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

    // HTML 파일을 browserSync로 브라우저에 반영
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

/**
 * 자바스크립트 파일을 하나로 합치고 압축한다.
 * 개별파일설정  gulp.src([file1.js', file2.js'])
 */
gulp.task('build-js', function() {
	return gulp.src(paths.js)
		.pipe(concat('all.js'))         // 소스머지
		.pipe(uglify())                 // 난독화
		.pipe(gulp.dest(dist + '/js'))  // dist 디렉토리에 파일 생성

    // 스크립트 파일을 browserSync로 브라우저에 반영
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

// CSS 압축
gulp.task('build-css', function() {
  return gulp.src(paths.css)
    .pipe(concat('all.css'))            // 소스머지
    .pipe(minifyCSS({keepBreaks:true})) // 최소화
    .pipe(gulp.dest(dist + '/css'))     // dist 디렉토리에 파일 생성

    // CSS 파일을 browserSync로 브라우저에 반영
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

// 브라우저 싱크 서버 초기화
gulp.task('browserSync', ['html', 'build-js', 'build-css'], function() {
  return browserSync.init({
    port : 7001,
    server: {
      baseDir: './'
    },
    //proxy: "localhost:8080" // 다른 개발 서버와 연동하여 브라우저 싱크 사용시 프록시를 통해 사용 가능하다.
  });
});

// 파일 변경 감지
gulp.task('watch', function() {
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.js, ['build-js']);
  gulp.watch(paths.css, ['build-css']);
});

// 소스 압축
gulp.task('build', ['build-js', 'build-css']);

// 기본 task 설정
gulp.task('default', ['browserSync','watch']);
