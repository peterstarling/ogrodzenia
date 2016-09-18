<?php

use Mockery as m;

use Starling\Libraries\Response\Formatters\ResponseJsonFormatter;

class ResponseJsonFormatterTest extends TestCase
{
	public function setUp()
	{
		$this->formatter = new ResponseJsonFormatter;
	}

	public function test_format()
	{
		$data = ['asdasd' => 'asdasdas', 'asdasdasaa' => 1231232];

		$result = $this->formatter->format($data);

		$this->assertEquals(json_encode($data), $result);
	}
}