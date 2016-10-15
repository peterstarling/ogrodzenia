<?php

namespace Starling\Libraries\Response;

use Illuminate\Http\Response;
use Starling\Libraries\Response\Contracts\ResponseFormatInterface;

class ResponseParser
{
	/**
	 * Response object
	 * 
	 * @var Response
	 */
	protected $response;

	/**
	 * Selected formatter for the final response
	 * 
	 * @var ResponseFormatInterface
	 */
	protected $responseFormatter;

	/**
	 * Response status code
	 * 
	 * @var int
	 */
	public $code = 200;

	/**
	 * Optional data to attach to the response
	 * 
	 * @var array
	 */
	protected $optional = [];

	/**
	 * Set the input data
	 * 
	 * @var mixed
	 */
	protected $input;

	/**
	 * Dependency injection.
	 * 
	 * @param ResponseFormatInterface $responseFormatter
	 */
	public function __construct(Response $response, ResponseFormatInterface $responseFormatter)
	{
		$this->response = $response;
		$this->responseFormatter = $responseFormatter;
	}

	/**
	 * Code to set for the response
	 * 
	 * @param int $code
	 */
	public function setCode(int $code)
	{
		$this->code = $code;
	}

	/**
	 * Add optional elements to the response
	 * 
	 * @param array $optional
	 */
	public function addOptional(array $optional)
	{
		$this->optional = array_merge($this->optional, $optional);
	}

	/**
	 * Set the input data
	 * 
	 * @param  mixed $input
	 */
	public function setContent($input)
	{
		$this->input = $input;
	}

	public function output()
	{
		$response = [];

		if (!in_array($this->code, [200, 201])) {
			$response['status'] = 'ERROR';
			$response['message'] = $this->input;
		} else {
			$response['status'] = 'OK';
			$response['data'] = json_decode($this->input);
		}

		$response = array_merge($response, (array) $this->optional);

		// $output = $this->responseFormatter->format($response);
		$this->response->setContent($response);
		$this->response->setStatusCode($this->code);

		$this->response->header('Content-type', 'application/json');

		return $this->response;		
	}
}