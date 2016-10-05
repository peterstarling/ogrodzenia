<?php

return [
  "driver" => env('MAIL_DRIVER', 'smtp'),
  "host" => env('MAIL_HOST', "mailtrap.io"),
  "port" => env('MAIL_PORT', 2525),
  "from" => array(
      "address" => "no-reply@balusteel.eu",
      "name" => "Balusteel Ogrodzenia"
  ),
  "username" => env('MAIL_USERNAME', "37239b98c1601daf9"),
  "password" => env('MAIL_PASSWORD', "7003266a609df4"),
  "sendmail" => "/usr/sbin/sendmail -bs",
  "pretend" => false,
  "own" => env('MAIL_OWN'),
];