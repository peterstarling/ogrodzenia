<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

use App\Exceptions\CustomException;
use Starling\Libraries\Response\ResponseParser;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Auth\Access\AuthorizationException::class,
        \Symfony\Component\HttpKernel\Exception\HttpException::class,
        \Illuminate\Database\Eloquent\ModelNotFoundException::class,
        \Illuminate\Session\TokenMismatchException::class,
        \Illuminate\Validation\ValidationException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception)
    {
        if ($request->route() === null || !in_array('api', $request->route()->middleware())) {
            return parent::render($request, $exception);
        }

        if ($exception instanceof ValidationException) {
            $code = 422;
        } elseif ($exception instanceof CustomException) {
            $code = $exception->getCode();
        } elseif ($exception instanceof AuthenticationException) {
            $code = 401;
        } elseif ($exception instanceof ModelNotFoundException) {
            $code = 404;
        } else {
            $code = 500;
        }  

        $parser = app()->make(ResponseParser::class);
        $parser->setCode($code);

        if (env('APP_ENV') !== 'production') {
            $parser->addOptional(['trace' => $exception->getTrace()]);
        }

        $parser->setContent($exception->getMessage());

        return $parser;
    }

    /**
     * Convert an authentication exception into an unauthenticated response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Auth\AuthenticationException  $exception
     * @return \Illuminate\Http\Response
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson()) {
            return response()->json(['status' => 'ERROR', 'message' => 'Unauthenticated.'], 401);
        }

        return redirect()->guest('login');
    }
}
