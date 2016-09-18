<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Starling\Libraries\Response\ResponseParser;
use Starling\Libraries\Response\Formatters\ResponseJsonFormatter;
use Starling\Libraries\Response\Contracts\ResponseFormatInterface;


class ResponseServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(ResponseFormatInterface::class, ResponseJsonFormatter::class);
        $this->app->singleton(ResponseParser::class, ResponseParser::class);
    }
}
