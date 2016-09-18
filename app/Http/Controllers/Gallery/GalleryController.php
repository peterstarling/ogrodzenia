<?php

namespace App\Http\Controllers\Gallery;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Gallery;
use App\Http\Requests\Gallery\StoreGalleryRequest;
use Starling\Libraries\Response\ResponseParser;

class GalleryController extends Controller
{
	protected $responseParser;
	protected $gallery;

	public function __construct(ResponseParser $parser, Gallery $gallery)
	{
		$this->responseParser = $parser;
		$this->gallery = $gallery;
	}

    /**
     * List all galleries
     *
     * @return array
     */
    public function index()
    {
        return $this->gallery->all();
    }

    public function create(StoreGalleryRequest $request)
    {
    	$this->gallery->create($request->all());
    	$this->responseParser->setCode(201);

        return 'ok';
    }
}
