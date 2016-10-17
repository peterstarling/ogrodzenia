<?php

namespace App\Http\Controllers\Gallery;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use DB;
use Image;
use Storage;
use App\Models\Photo;
use App\Models\Gallery;
use Illuminate\Http\File;
use Starling\Libraries\Response\ResponseParser;
use App\Http\Requests\Gallery\StorePhotoRequest;
use App\Http\Requests\Gallery\StoreGalleryRequest;
use App\Http\Requests\Gallery\UpdateGalleryRequest;

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
        return $this->gallery->with('photos')->get();
    }

    /**
     * Show one gallery
     *
     * @return array
     */
    public function showGallery($galleryId)
    {
        return Gallery::with('photos')->findOrFail($galleryId);
    }

    /**
     * Update gallery
     * 
     * @param  UpdateGalleryRequest $request
     * @param  Gallery $gallery
     */
    public function updateGallery(UpdateGalleryRequest $request, Gallery $gallery)
    {
        $input = array_filter($request->only(['name', 'description', 'default_photo']));
        
        $gallery->update($input);
    }

    /**
     * Create a new gallery
     * 
     * @param  StoreGalleryRequest $request
     * 
     * @return string
     */
    public function create(StoreGalleryRequest $request)
    {
        $slug = str_slug($request->input('name'));

    	$gallery = $this->gallery->create($request->only(['name', 'description']) + ['slug' => $slug]);
    	$this->responseParser->setCode(201);

        return $gallery->id;
    }

    /**
     * Add a new photo
     * 
     * @param StorePhotoRequest $request
     * @param int            $galleryId
     *
     * @return  string
     */
    public function addPhoto(StorePhotoRequest $request, $galleryId)
    {
        DB::beginTransaction();

        try {
            $gallery = Gallery::findOrFail($galleryId);
            $photo = $gallery->photos()->create(['title' => $request->get('title')]);

            $img = Image::make($request->file('photo'));
            $img->interlace()->resize(1280, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });

            Storage::put('public/photos/' . $galleryId . '/' . $photo->id . '.jpg', $img->stream()->__toString(), 'public');

            $img->fit(250, 150, function ($constraint) {
                $constraint->upsize();
            });

            Storage::put('public/photos/' . $galleryId . '/mini_' . $photo->id . '.jpg', $img->stream()->__toString(), 'public');

            DB::commit();

        } catch (\Exception $e) {
            DB::rollback();

            throw $e;

        }

        $this->responseParser->setCode(201);
        return 'ok';

    }

    /**
     * Get photo
     * 
     * @param  int $galleryId
     * @param  Photo $photo
     * @return Photo
     */
    public function showPhoto($galleryId, Photo $photo)
    {
        return $photo;
    }

    /**
     * Delete photo
     * 
     * @param  int $galleryId
     * @param  int $photoId
     */
    public function deletePhoto($galleryId, $photoId)
    {
        $photo = Photo::findOrFail($photoId);

        $this->deletePhotoItem($photo);
    }

    public function deleteGallery($galleryId)
    {
        $gallery = Gallery::find($galleryId);

        if ($gallery === null) {
            return;
        }

        $gallery->photos->each(function (Photo $photo) {
            $this->deletePhotoItem($photo);
        });

        try
        {
            $gallery->delete();
        } catch (\Exception $e) {
            // do nothing
        }
    }

    private function deletePhotoItem(Photo $photo)
    {
        try
        {
            $path = $photo->path;
            $path = array_map(function ($element) {
                return str_replace('storage', 'public', $element);
            }, $path);
            
            $photo->delete();

            Storage::delete([$path['full'], $path['mini']]);

        } catch (\Exception $e) {
            dd($e);
            // do nothing
        }
    }
}
