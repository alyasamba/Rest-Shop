'use strict';

import del from 'del';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import csso from 'gulp-csso';
import iife from 'gulp-iife';
import imagemin from 'gulp-imagemin';
import ngAnnotate from 'gulp-ng-annotate';
import sass from 'gulp-sass';
import bulkSass from 'gulp-sass-bulk-import';
import uglify from 'gulp-uglify';
import watch from 'gulp-watch';
import merge from 'merge-stream';


// ===== Paths =====

const dirs = {
    src: './app/',
    build: './build/'
};

const path = {
    src: {  // Where to take files from.
        vendorJs: [
            'bower_components/angular/angular.min.js',
            'bower_components/angular-animate/angular-animate.min.js',
            'bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'bower_components/angular-bootstrap/ui-bootstrap.min.js',
            'bower_components/angularjs-slider/dist/rzslider.min.js'
        ],
        srcJs: [
            'js/app.js',
            'js/controllers/**/*.js',
            'js/directives/**/*.js',
            'js/filters/**/*.js',
            'js/services/**/*.js'
        ],
        htmlIndex: 'index.html',
        htmlPartials: 'partials/**/*',
        vendorStyles: [
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'bower_components/angularjs-slider/dist/rzslider.css'
        ],
        srcStyles: [
            'styles/main.scss'
        ],
        fonts: [
            'bower_components/bootstrap/dist/fonts/*'
        ],
        img: 'img/**/*'
    },
    build: {  // Where to put files into.
        js: 'js/',
        htmlIndex: '', // root of build folder
        htmlPartials: 'partials/',
        styles: 'css/',
        fonts: 'fonts/',
        img: 'img/'
    },
    watch: {  // Which files changes to watch.
        html: '**/*.html',
        styles: 'styles/**/*.scss',
        js: 'js/**/*.js',
        img: 'img/**/*'
    }
};

const addDirName = (fileset) => {
    if (fileset instanceof Array) {
        return fileset.map((x) => dirs.src + x);
    } else {
        return dirs.src + fileset;
    }
};

const take = (pathKey) => {
    let fileset = addDirName(path.src[pathKey]);
    return gulp.src(fileset);
};

const put = (pathKey) => {
    let fileset = dirs.build + path.build[pathKey];
    return gulp.dest(fileset);
};


// ===== Tasks =====

// HTML

gulp.task('htmlIndex:build', () => {
    return take('htmlIndex')
        .pipe(put('htmlIndex'));
});

gulp.task('htmlPartials:build', () => {
    return take('htmlPartials')
        .pipe(put('htmlPartials'));
});

gulp.task('html:build', ['htmlIndex:build', 'htmlPartials:build']);


// Styles

gulp.task('styles:build', () => {
    let cssStream = take('vendorStyles');

    let scssStream = take('srcStyles')
        .pipe(bulkSass())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(csso());

    return merge(cssStream, scssStream)
        .pipe(concat('app.css'))
        .pipe(put('styles'));
});


// JavaScript

gulp.task('vendorJs:build', () => {
    return take('vendorJs')
        .pipe(concat('vendor.js'))
        .pipe(put('js'));
});

gulp.task('srcJs:build', () => {
    return take('srcJs')
        .pipe(babel())
        .pipe(ngAnnotate())
        .pipe(iife({useStrict: false}))
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(put('js'));
});

gulp.task('js:build', ['vendorJs:build', 'srcJs:build']);


// Images

gulp.task('img:build', () => {
    return take('img')
        .pipe(imagemin())
        .pipe(put('img'));
});


// Fonts

gulp.task('fonts:build', () => {
    return take('fonts')
        .pipe(put('fonts'));
});


// Watch

const watchFiles = (pathKey) => {
    let fileset = addDirName(path.watch[pathKey]);
    let taskName = pathKey + ':build';

    watch(fileset, () => {
        gulp.start(taskName);
    });
};

gulp.task('watch', () => {
    const keys = ['html', 'styles', 'js', 'img'];
    for (let i = 0; i < keys.length; i++) {
        watchFiles(keys[i]);
    }
});


// Other

gulp.task('clean', () => del(dirs.build));

gulp.task('build', ['html:build', 'styles:build', 'js:build', 'img:build', 'fonts:build']);

gulp.task('default', ['build', 'watch']);
