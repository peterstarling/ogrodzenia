<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are handled
| by your application. Just tell Laravel the URIs it should respond
| to using a Closure or controller method. Build something great!
|
*/

// Home page
Route::get('/', 'HomeController@index')->name('home');

// Contact us
Route::get('kontakt.html', 'ContactController@index')->name('contact-us');

Route::post('kontakt.html', 'ContactController@send');


// References
Route::get('referencje.html', 'PageController@references')->name('references');

// About us
Route::get('o-nas.html', 'PageController@aboutUs')->name('about-us');

// Offer
Route::get('oferta/{slug}.html', 'PageController@offerDetails');
Route::get('oferta.html', 'PageController@offer')->name('offer');

// Price list
Route::get('cennik.html', 'PageController@priceList')->name('price-list');

// Private projects
Route::get('realizacje-prywatne.html', 'ProjectController@private')->name('private-projects');

// Commercial projects
Route::get('realizacje-dla-firm.html', 'ProjectController@commercial')->name('commercial-projects');

// Projects group
Route::group(['prefix' => 'realizacje'], function () {
	// One project
	Route::get('{id}-{slug}.html', 'ProjectController@get')->name('project');
});

// Guidebook
Route::get('poradnik.html', 'PageController@guidebook')->name('guidebook');

// FAQ
Route::get('faq.html', 'PageController@faq')->name('faq');

// FAQ
Route::get('opinie.html', 'PageController@opinions')->name('opinions');

Auth::routes();

Route::get('/logout', 'Auth\LoginController@logout');

Route::group(['prefix' => 'admin', 'namespace' => 'Admin', 'middleware' => 'auth'], function () {

	Route::get('{any?}', 'IndexController@index')->where('any', '^([^.]+)$');
});