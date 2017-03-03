<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __construct() {
        parent::__construct();
    }
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        \Meta::set('title', 'Ogrodzenia, automatyka i napędy do bram garażowych, rolety zewnętrzne, konstrukcje stalowe');
        \Meta::set('description', 'Jesteśmy firmą oferującą swoim klientom profesjonalne bramy garażowe, ogrodzenia panelowe i metalowe oraz automatykę do bram. Sprawdź naszą ofertę, w której znajdziesz także rolety i balustrady. ');
        return view('home');
    }
}
