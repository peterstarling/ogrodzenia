<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function __construct()
    {
    	\Meta::set('site_name', 'Balusteel Ogrodzenia');
    	\Meta::set('url', 'URL');
    	\Meta::set('locale', 'pl_PL');
    	//\Meta::title('Balusteel');
    }
}
