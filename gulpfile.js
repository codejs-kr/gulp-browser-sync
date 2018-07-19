/**
 * Client source build manager with BrowserSync
 *
 * @author dodortus (dodortus@gmail.com)
 * @fileOverview 클라이언트 정적파일 빌드 및 변경 감지 매니저
 * @Git https://github.com/dodortus/gulp-browser-sync
 */

// Load modules
const gulp = require('gulp');
const concat = require('gulp-concat');                // 파일 합치기
const uglify = require('gulp-uglify');                // JS 난독화
const minifyCSS = require('gulp-clean-css');          // CSS 압축
const autoprefixer = require('gulp-autoprefixer');    // CSS prefix 삽입
const imagemin = require('gulp-imagemin');            // 이미지 압축
const browserSync = require('browser-sync').create(); // browser-sync 호출
const inject = require('gulp-inject');                // HTML injection (개발환경 / 배포환경 소스 호출 분기)

// Target path
const src = './src';          // source directory path
const build = './build';      // build source directory path
const paths = {
  js: [
    src + '/contents/js/lib/*.js',
    src + '/contents/js/*.js'
  ],
  css: src + '/contents/css/*.css',
  img: src + '/contents/img/*',
  html: src + '/*.html'
};

// HTML 변화를 감지하고 갱신한다.
gulp.task('html', function () {
  return gulp.src(paths.html)
    // 변경된 파일을 browserSync를 통해 브라우저에 반영
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

// JS 변화를 감지하고 갱신한다.
gulp.task('js', function () {
  return gulp.src(paths.js)
    // 변경된 파일을 browserSync를 통해 브라우저에 반영
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

// CSS 변화를 감지하고 갱신한다.
gulp.task('css', function () {
  return gulp.src(paths.css)
    // 변경된 파일을 browserSync를 통해 브라우저에 반영
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
    .pipe(concat('all.js'))                   // 소스머지
    .pipe(uglify({                            // 난독화
      output: {
        comments: /^!/
      }
    }))
    .pipe(gulp.dest(build + '/contents/js'))  // build 디렉토리에 파일 생성
});

// CSS 압축
gulp.task('build-css', function() {
  return gulp.src(paths.css)
    // REF: https://github.com/browserslist/browserslist
    // 크로스브라우징 코드 삽입 (default: > 0.5%, last 2 versions, Firefox ESR, not dead).
    .pipe(autoprefixer(["last 4 versions", "> 0.5%", "not dead"]))
    .pipe(concat('all.css'))                  // 소스머지
    .pipe(minifyCSS({keepBreaks:true}))       // 최소화
    .pipe(gulp.dest(build + '/contents/css')) // build 디렉토리에 파일 생성
});

// 이미지 최적화
gulp.task('build-img', function() {
  return gulp.src(paths.img)
    .pipe(imagemin())
    .pipe(gulp.dest(build + '/contents/img'));
});

// 배포 환경의 소스로 index 파일을 생성한다.
gulp.task('build-index', function () {
  const target = gulp.src(src + '/index.html');
  const sources = gulp.src([build + '/contents/js/*.js', build + '/contents/css/*.css'], {read: false});

  return target.pipe(inject(sources, {
        ignorePath: "/build/"
      })
    ).pipe(gulp.dest(build));
});

// 브라우저 싱크 서버 초기화
gulp.task('browserSync', ['html', 'js', 'css'], function() {
  return browserSync.init({
    //proxy: "localhost:8080" // 다른 개발 서버와 연동하여 브라우저 싱크 사용시 프록시를 통해 사용 가능하다.
    port : 7001,
    server: {
      baseDir: src
    }
  });
});

// 파일 변경 감지
gulp.task('watch', function() {
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.css, ['css']);
});

// 배포 소스 빌드
gulp.task('build', ['build-js', 'build-css', 'build-img', 'build-index']);

// 기본 개발용 task 설정
gulp.task('default', ['browserSync', 'watch']);