<?php

namespace App\Http\Controllers;

use App\Mail\ContactEnquiry;
use App\Http\Requests\PostContactRequest;

class ContactController extends Controller
{

    /**
     * Contact us page.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        \Meta::set('title', 'Kontakt');

        return view('contact/form');
    }

    /**
     * Send e-mail and display confirmation
     * 
     * @param  PostContactRequest $request
     * 
     * @return Illuminate\Http\Response
     */
    public function send(PostContactRequest $request)
    {
        \Mail::to(config('mail.own'))->queue(new ContactEnquiry($request->all()));

        return view('contact/confirmation');
    }
}
