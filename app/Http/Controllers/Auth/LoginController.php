<?php

namespace App\Http\Controllers\Auth;

use Tymon\JWTAuth\JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login / registration.
     *
     * @var string
     */
    protected $redirectTo = '/admin';

    /**
     * JWT library
     * @var JWTAuth
     */
    protected $auth;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(JWTAuth $auth)
    {
        $this->auth = $auth;
        $this->middleware('guest', ['except' => 'logout']);
    }

    public function logout(Request $request)
    {
        if ($token = $this->auth->getToken()) {
            $this->auth->invalidate();
        }
        
        \Auth::logout();

        return redirect()->route('login');
    }
}
