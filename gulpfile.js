var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('gulp-buffer');
var rev = require('gulp-rev');
var revDel = require('rev-del');
var uglify = require('gulp-uglify');
var stringify = require('stringify');

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

gulp.task('watch', function() {
	gulp.watch(['resources/assets/js/**/*.js'], ['default']);
});