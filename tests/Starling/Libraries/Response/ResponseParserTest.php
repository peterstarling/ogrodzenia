<?php

use Mockery as m;

use Illuminate\Http\Response;
use Starling\Libraries\Response\ResponseParser;
use Starling\Libraries\Response\Contracts\ResponseFormatInterface;

class ResponseParserTest extends TestCase
{
	public function setUp()
	{
		$this->response = m::mock(Response::class);
		$this->formatter = m::mock(ResponseFormatInterface::class);
		$this->parser = new ResponseParser($this->response, $this->formatter);
	}

	public function test_output()
	{
		$response = new Response;

		$response->setContent(['asdasdas'], 404);
		$response->setStatusCode(404);
		dd($response);
	}
}