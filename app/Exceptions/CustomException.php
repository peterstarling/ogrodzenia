<?php

namespace App\Exceptions;

class CustomException extends \Exception
{
	protected int $code = 500;
}