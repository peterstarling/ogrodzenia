const elixir = require('laravel-elixir');
const htmlmin = require('gulp-htmlmin');

require('laravel-elixir-html-minify');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(mix => {
    mix
    	.styles('main.css')
    	.scriptsIn('public/js/')
    	.version(['css/main.css', 'js/app.js'])
});
