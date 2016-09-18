<?php

namespace Starling\Libraries\Response\Contracts;

interface ResponseFormatInterface
{
	/**
	 * Format the data
	 * 
	 * @param  mixed $data 	Data going in
	 * @return mixed 		Data formatted
	 */
	public function format($data);
}