var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('gulp-buffer');
var rev = require('gulp-rev');
var revDel = require('rev-del');
var uglify = require('gulp-uglify');
var stringify = require('stringify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');

var exposeConfig = { expose: { angular: 'angular' } };

gulp.task('default', () => {

	// the app
	var app = browserify({
    	entries: './resources/assets/js/admin/app.js',
    	debug: true
  	});


	app
	  	.transform("babelify", {
	  		presets: ["es2015"],
	  	})
	  	.transform('exposify', exposeConfig)
	  	.transform(stringify, {
	        appliesTo: { includeExtensions: ['.html'] },
	        minify: true
	    })
	    .bundle()
	    .pipe(source('js/app.js'))
	    .pipe(gulp.dest('public'))
	    .pipe(buffer())
	    // .pipe(uglify())
	    .pipe(rev())
	    .pipe(gulp.dest('public/build'))
	    .pipe(rev.manifest())
        .pipe(revDel({ oldManifest: 'public/build/rev-manifest.json', dest: 'public/build' }))
        .pipe(gulp.dest('public/build'));

});

gulp.task('js', function() {
	gulp.src('resources/assets/js/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(gulp.dest('public/js'))
		.pipe(rename('all.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
  		.pipe(gulp.dest('public/js'));
});

gulp.task('css', function() {
	gulp.src('resources/assets/css/all.css')
		.pipe(minifyCSS())
		.pipe(concat('all.min.css'))
		.pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
	gulp.watch(['resources/assets/js/**/*.js'], ['default']);
});