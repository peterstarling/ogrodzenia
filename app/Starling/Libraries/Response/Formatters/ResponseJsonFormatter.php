<?php

namespace Starling\Libraries\Response\Formatters;

use Starling\Libraries\Response\Contracts\ResponseFormatInterface;

class ResponseJsonFormatter implements ResponseFormatInterface
{
	public function format($data)
	{
		return json_encode($data);
	}
}