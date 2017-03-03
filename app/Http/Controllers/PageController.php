<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{

    public function __construct() {
        parent::__construct();
    }
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

    public function offerDetails($slug) {

        switch($slug) {
            case 'bramy-garazowe':
                \Meta::set('title', 'Automatyczne bramy garażowe, przesuwne Poznań');
                \Meta::set('description', 'Sprzedajemy i montujemy bramy automatyczne, ogrodzenia oraz bramy garażowe. Sprawdź naszą ofertę, którą przygotowaliśmy dla klientów z Poznania i województwa wielkopolskiego.  ');
                return view('pages/offer/bramy-garazowe');

            case 'rolety-zewnetrzne':
                \Meta::set('title', 'Rolety zewnętrzne - montaż Poznań, Wielkopolska');
                \Meta::set('description', 'Oferujemy montaż rolet zewnętrznych w Poznaniu. Sprawdź ofertę firmy Balu Steel i wybierz rolety najlepsze zewnętrzne dla twojego domu, mieszkania lub biura.');
                return view('pages/offer/rolety-zewnetrzne');

            case 'konstrukcje-stalowe':
                \Meta::set('title', 'Konstrukcje stalowke, wykonanie i montaż Poznań, Wielkopolska');
                \Meta::set('description', 'Balu Steel oferuje wykonanie konstrukcji stalowych na terenie Poznania i Wielkopolski. Oferujemy także profesjonalny montaż konstrukcji stalowych o dowolnym rozmiarze i przeznaczeniu. ');
                return view('pages/offer/konstrukcje-stalowe');

            case 'automatyka-do-bram':
                \Meta::set('title', 'Automatyka i napędy do bram garażowych, przesuwnych i skrzydłowych Poznań');
                \Meta::set('description', 'W naszej ofercie znajduje się automatyka do bram garażowych od najlepszych producentów. Posiadamy w sprzedaży napędy do bram przesuwnych i skrzydłowych.');
                return view('pages/offer/automatyka-do-bram');

            case 'ogrodzenia':
                \Meta::set('title', 'Nowoczesne ogrodzenia panelowe ze stali nierdzewnej, montaż Poznań');
                \Meta::set('description', 'Nowoczesne panele ogrodzeniowe oraz ogrodzenia ze stali nierdzewnej to jedne z najchętniej wybieranych produktów z oferty firmy Balu Steel. Sprawdź ceny i wybierz ogrodzenie dla siebie. ');
                return view('pages/offer/ogrodzenia');

            default:
                abort(404);
        }

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

    /**
     * Guidebook page.
     *
     * @return \Illuminate\Http\Response
     */
    public function guidebook()
    {
        \Meta::set('title', 'Poradnik');

        return view('pages/guidebook');
    }

    /**
     * FAQ page.
     *
     * @return \Illuminate\Http\Response
     */
    public function faq()
    {
        \Meta::set('title', 'Częste pytania');

        return view('pages/faq');
    }
}
