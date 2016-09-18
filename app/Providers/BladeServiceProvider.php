<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class BladeServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        \Blade::setContentTags('<%', '%>');
        \Blade::setEscapedContentTags('<%%', '%%>');
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {

    }
}
