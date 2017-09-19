var gulp              = require('gulp');
var runSequence       = require('run-sequence');
var autoprefixer      = require('gulp-autoprefixer');
var sass              = require('gulp-sass');
var sourcemaps        = require('gulp-sourcemaps');
var util              = require('gulp-util');
var ts                = require('typescript');
var inlineNg2Template = require('gulp-inline-ng2-template');
var gulpTs            = require('gulp-typescript');
var merge             = require('merge2');
var preprocess        = require('gulp-preprocess');
var del               = require('del');
var os                = require('os');

var tsProject   = gulpTs.createProject('./tsconfig.json', {declaration: true});
var src         = './src/';
var buildDir    = './build';
var staging     = './staging';
var dist        = './dist';
var aotCompiled = './aot-compiled';
gulp.task('clean', function () {
    return del([buildDir, staging, dist, aotCompiled]);
});

gulp.task('copy:html', function () {
    return gulp.src([src + '**/*.html'])
    // .pipe(preprocess({context: {NODE_ENV: process.env.NODE_ENV}})) //To set environment variables in-line
        .pipe(gulp.dest(staging));
});
gulp.task('copy:ts', function () {
    return gulp.src([src + '**/*.ts'])
    // .pipe(preprocess({context: {NODE_ENV: process.env.NODE_ENV}})) //To set environment variables in-line
        .pipe(gulp.dest(staging));
});

gulp.task('compile:sass', function () {
    var compressed   = {outputStyle: 'compressed'};
    var uncompressed = {sourceComments: 'map', errLogToConsole: true};
    return gulp.src(src + '**/*.scss', {base: src})
        .pipe(sass(compressed).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 3 versions', 'ie 10', 'ie 11', '> 5%', 'Firefox > 35', 'Chrome > 35'],
            cascade: false
        }))
        .pipe(gulp.dest(staging))
        .on('error', function (err) {
            util.log('compile:sass - Compiling SASS ERROR!!!', err);
            process.exit(-1);
        });
});

gulp.task("aot:copy", function () {
    var sources = [
        staging + '/**/*.ts',
        staging + '/**/ *.html'];

    return gulp.src(sources)
        .pipe(inlineNg2Template({
            base: '/src/',
            useRelativePaths: true
        }))
        .pipe(gulp.dest(dist));
});

function execCallback(cb) {
    return function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    };
}

gulp.task('aot:build', function (cb) {
    var exec = require('child_process').exec;

    var cmdForBuild = os.platform() === 'win32' ?
        'node_modules\\.bin\\ngc' : './node_modules/.bin/ngc';

    cmdForBuild += ' -p tsconfig-aot.json'; // use config for aot to compile

    exec(cmdForBuild, execCallback(cb));
});

gulp.task("aot:umd", function (cb) {
    var exec = require('child_process').exec;

    var cmdForUMD = os.platform() === 'win32' ?
        'node_modules\\.bin\\rollup' : './node_modules/.bin/rollup';

    cmdForUMD += ' -c rollup.config.js'; // use config for rollup

    exec(cmdForUMD, execCallback(cb));
});

gulp.task('compile:ts', function () {
    var tsSources = [src + '**/*.ts'];
    var tsResult;
    tsSources.push('!src/**/*.spec.ts', '!src/**/*e2e-spec.ts'); // exclude spec files
    tsResult = gulp.src(tsSources)
        .pipe(gulp.dest(staging))
        .pipe(inlineNg2Template({
            base: staging,
            target: 'es5',
            useRelativePaths: true,
            supportNonExistentFiles: false
        }))
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done.
        tsResult.dts.pipe(gulp.dest(buildDir)),
        tsResult.js.pipe(sourcemaps.write('.', {sourceRoot: src})).pipe(gulp.dest(buildDir))
    ]).on('error', function (err) {
        util.log('CS::compile:ts - Compiling typescripts ERROR!!!', err);
        process.exit(-1);
    });
});
gulp.task('clean:xtras', function () {
    return del([staging, aotCompiled]);
});
gulp.task("aot", function (callback) {
    return runSequence(
        'copy:html',
        'copy:ts',
        'compile:sass',
        'aot:copy',
        'aot:build',
        'aot:umd',
        callback
    );
});
gulp.task('default', function (callback) {
    return runSequence('clean', 'aot', 'clean:xtras', callback);
});
