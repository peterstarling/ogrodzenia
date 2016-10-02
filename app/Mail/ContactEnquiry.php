<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ContactEnquiry extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Array of data
     * 
     * @var array
     */
    public $data;

    /**
     * Create a new message instance.
     *
     * @param  array $data
     * @return void
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->replyTo($this->data['email'])
            ->view('emails.enquiry');
    }
}
