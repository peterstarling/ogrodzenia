<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use Tymon\JWTAuth\JWTAuth;

class IndexController extends Controller
{
	/**
	 * JWT library to issue tokens
	 * 
	 * @var JWTAuth
	 */
	protected $jwt;

	public function __construct(JWTAuth $jwt)
	{
		$this->jwt = $jwt;
	}
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin/index')
        	->with(['access_token' => $this->jwt->fromUser(\Auth::user()),
        			'api_url' => config('app.url') . '/api']);
    }
}
