/**
 * Client source task manager with BrowserSync
 *
 * @author dodortus (dodortus@gmail.com)
 * @fileOverview 클라이언트 정적파일 빌드 및 변경 감지 매니저
 * @Git https://github.com/dodortus/gulp-browser-sync
 */
const gulp = require('gulp');
const concat = require('gulp-concat');                // 파일 합치기
const uglify = require('gulp-uglify');                // JS 난독화
const scss = require('gulp-sass');                    // SCSS
const sourcemaps = require('gulp-sourcemaps');        // 컴파일된 CSS소스의 SCSS 위치 매핑
const minifyCSS = require('gulp-clean-css');          // CSS 압축
const autoprefixer = require('gulp-autoprefixer');    // CSS prefix 삽입
const imagemin = require('gulp-imagemin');            // 이미지 압축
const browserSync = require('browser-sync').create(); // browser-sync 호출
const inject = require('gulp-inject');                // HTML injection (개발환경 / 배포환경 소스 호출 분기)
const clean = require('gulp-clean');                  // 배포시 이전 파일, 폴더 삭제
const runSequence = require('run-sequence');          // 배포시 동기 수행

// Target path
const srcDir = './src';          // source directory path
const buildDir = './build';      // build source directory path
const contentsDir = srcDir + '/contents';  // 
const paths = {
  js: [
    contentsDir + '/js/lib/*.js',
    contentsDir + '/js/*.js'
  ],
  scss: {
    src: contentsDir + '/css/scss/*.scss',
    watch: contentsDir + '/css/scss/**/*.scss',
    result: contentsDir + '/css',
    buildTarget: contentsDir + '/css/*.css'
  },
  img: contentsDir + '/img/*',
  html: srcDir + '/*.html'
};

// SCSS config (REF: http://webclub.tistory.com/470)
const scssOpts = {
  outputStyle: "expanded",
  indentWidth: 1,
  indentType: "tab"
};

/**
 * HTML 변화를 감지하고 갱신한다.
 */
gulp.task('html', function () {
  return gulp.src(paths.html)
    // 변경된 파일을 browserSync를 통해 브라우저에 반영
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

/**
 * JS 변화를 감지하고 갱신한다.
 */
gulp.task('js', function () {
  return gulp.src(paths.js)
    // 변경된 파일을 browserSync를 통해 브라우저에 반영
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

/**
 * scss 파일을 css 로 컴파일한다.
 */
gulp.task('scss', function() {
  return gulp.src(paths.scss.src)
    // 소스맵 초기화(소스맵을 생성)
    .pipe(sourcemaps.init())

    // SCSS 작성시 watch 가 멈추지 않도록 logError 를 설정
    .pipe(scss(scssOpts).on('error', scss.logError))

    // 위에서 생성한 소스맵을 사용한다.
    .pipe(sourcemaps.write('.'))

    // CSS 파일이 생성될 목적지 설정
    .pipe(gulp.dest(paths.scss.result))

    // 변경된 파일을 browserSync를 통해 브라우저에 반영
    .pipe(browserSync.reload(
      {stream : true}
    ));
});

/**
 * 배포: JS
 */
gulp.task('build-js', function() {
  return gulp.src(paths.js)   // 개별 우선순위 설정 gulp.src([file1.js', file2.js'])
    .pipe(concat('all.js'))   // 소스머지
    .pipe(uglify({            // 난독화
      output: {
        comments: /^!/
      }
    }))
    .pipe(gulp.dest(buildDir + '/contents/js'))  // build 디렉토리에 파일 생성
});

/**
 * 배포: CSS
 */
gulp.task('build-css', ['scss'], function() {
  return gulp.src(paths.scss.buildTarget)
    // REF: https://github.com/browserslist/browserslist
    // 크로스브라우징 코드 삽입 (default: > 0.5%, last 2 versions, Firefox ESR, not dead).
    .pipe(autoprefixer(["last 4 versions", "> 0.5%", "not dead"]))
    .pipe(concat('all.css'))                    // 소스머지
    .pipe(minifyCSS({keepBreaks:true}))         // 최소화
    .pipe(gulp.dest(buildDir + '/contents/css'))   // build 디렉토리에 파일 생성
});

/**
 * 배포: 이미지
 */
gulp.task('build-img', function() {
  return gulp.src(paths.img)
    .pipe(imagemin())
    .pipe(gulp.dest(buildDir + '/contents/img'));
});

/**
 * 배포 환경의 소스로 index 파일을 생성한다.
 */
gulp.task('build-index', function () {
  const target = gulp.src(srcDir + '/index.html');
  const sources = gulp.src([buildDir + '/contents/js/*.js', buildDir + '/contents/css/*.css'], {read: false});

  return target.pipe(inject(sources, {
        ignorePath: "/build/",
        addRootSlash: false
      })
    ).pipe(gulp.dest(buildDir));
});

/**
 * 배포: 기존 폴더 제거
 */
gulp.task('build-clean', function() {
  return gulp.src(buildDir, {read: false})
    .pipe(clean());
});

/**
 * 브라우저 싱크 서버 초기화
 */
gulp.task('browserSync', ['html', 'js', 'scss'], function() {
  return browserSync.init({
    //proxy: "localhost:8080"   // 다른 개발 서버와 연동하여 브라우저 싱크 사용시 프록시를 통해 사용 가능하다.
    port : 7001,
    server: {
      baseDir: srcDir
    }
  });
});

/**
 * 파일 변경 감지
 */
gulp.task('watch', function() {
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.scss.watch, ['scss']);
});

/**
 * 배포 소스 빌드
 * 동기로 실행하기 위해 runSequence()로 순차적 수행
 */
gulp.task('build', function() {
  runSequence(
    'build-clean',
    ['build-js', 'build-css', 'build-img'],
    'build-index'
  );
});

/**
 * 기본 개발용 task 실행
 */
gulp.task('default', ['browserSync', 'watch']);