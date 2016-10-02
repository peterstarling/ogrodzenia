<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * About us page.
     *
     * @return \Illuminate\Http\Response
     */
    public function aboutUs()
    {
        \Meta::set('title', 'O nas');

        return view('pages/about-us');
    }

    /**
     * Contact us page.
     *
     * @return \Illuminate\Http\Response
     */
    public function contactUs()
    {
        \Meta::set('title', 'Kontakt');

        return view('pages/contact-us');
    }
}
