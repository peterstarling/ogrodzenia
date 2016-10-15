<?php

namespace App\Http\Controllers\Gallery;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use DB;
use Image;
use Storage;
use App\Models\Gallery;
use Illuminate\Http\File;
use Starling\Libraries\Response\ResponseParser;
use App\Http\Requests\Gallery\StorePhotoRequest;
use App\Http\Requests\Gallery\StoreGalleryRequest;

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

    public function addPhoto(StorePhotoRequest $request, $galleryId)
    {
        DB::beginTransaction();

        try {
            $gallery = Gallery::find($galleryId);
            $photo = $gallery->photos()->create(['title' => $request->get('title')]);

            $request->file('photo')->storeAs('photos', $photo->id, 'public');

            $img = Image::make($request->file('photo'));
            $img->fit(250, 150, function ($constraint) {
                $constraint->upsize();
            });
            Storage::putFileAs('photos', new File($img->stream()->__toString()), 'mini_' . $photo->id . '.jpg', 'public');

            // Storage::put('photos/mini_' . $photo->id . '.png', $img->stream()->__toString(), 'public');

            DB::commit();

        } catch (\Exception $e) {
            DB::rollback();

            throw $e;

        }

        $this->responseParser->setCode(201);
        return 'ok';

    }
}
