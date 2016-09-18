<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;

use Starling\Libraries\Response\ResponseParser;

class ResponseMiddleware
{
    /**
     * Response parser library
     * 
     * @var ResponseParser
     */
    protected $parser;

    /**
     * Dependency injection.
     * 
     * @param ResponseParser $parser
     */
    public function __construct(ResponseParser $parser)
    {
        $this->parser = $parser;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        if ($response instanceof Response) {
            $content = $response->content();
        } elseif ($response instanceof JsonResponse) {
            $response->setStatusCode(401);
            return $response;
        } else {
            $content = $response;
        }

        $this->parser->setContent($content);

        return $this->parser->output();
    }
}
