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

    /**
     * References page.
     *
     * @return \Illuminate\Http\Response
     */
    public function references()
    {
        \Meta::set('title', 'Referencje');

        return view('pages/references');
    }

    /**
     * Offer page.
     *
     * @return \Illuminate\Http\Response
     */
    public function offer()
    {
        \Meta::set('title', 'Oferta');

        return view('pages/offer');
    }

    /**
     * Price list page.
     *
     * @return \Illuminate\Http\Response
     */
    public function priceList()
    {
        \Meta::set('title', 'Cennik');

        return view('pages/price-list');
    }
}
