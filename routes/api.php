<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:api');

Route::group(['prefix' => 'gallery', 'namespace' => 'Gallery', 'middleware' => 'jwt.auth'], function() {
	// get all galleries
	Route::get('/', 'GalleryController@index');

	// create a new gallery
	Route::post('/', 'GalleryController@create');

	Route::group(['prefix' => '{gallery_id}/photos'], function() {
		// add a new photo
		Route::post('/', 'GalleryController@addPhoto');

	});

});
