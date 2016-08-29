<?php

return array(
  "driver" => "smtp",
  "host" => "mailtrap.io",
  "port" => 2525,
  "from" => array(
      "address" => "from@example.com",
      "name" => "Example"
  ),
  "username" => "37239b98c1601daf9",
  "password" => "7003266a609df4",
  "sendmail" => "/usr/sbin/sendmail -bs",
  "pretend" => false
);