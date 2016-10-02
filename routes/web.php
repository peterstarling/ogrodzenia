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
Route::get('oferta.html', 'PageController@offer')->name('offer');

// Price list
Route::get('cennik.html', 'PageController@priceList')->name('price-list');

// Projects
Route::get('realizacje.html', 'PageController@projects')->name('projects');

// Guidebook
Route::get('poradnik.html', 'PageController@guidebook')->name('guidebook');

Auth::routes();

Route::get('/logout', 'Auth\LoginController@logout');

Route::group(['prefix' => 'admin', 'namespace' => 'Admin', 'middleware' => 'auth'], function () {

	Route::get('{any?}', 'IndexController@index')->where('any', '^([^.]+)$');
});