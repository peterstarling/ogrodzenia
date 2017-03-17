<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Gallery;

class ProjectController extends Controller
{
	protected $gallery;

	public function __construct(Gallery $gallery)
	{
            parent::__construct();
            $this->gallery = $gallery;
	}

    /**
     * List all private galleries
     *
     * @return array
     */
    public function private()
    {
        \Meta::set('title', 'Realizacje prywatne');

        return view('projects/index')->with('projects', $this->gallery->where('category', 1)->get()->toArray());
    }

    /**
     * List all commercial galleries
     *
     * @return array
     */
    public function commercial()
    {
        \Meta::set('title', 'Realizacje dla firm');

        return view('projects/index')->with('projects', $this->gallery->where('category', 2)->get()->toArray());
    }

    /**
     * Display one project
     *
     * @return array
     */
    public function get($id, $slug)
    {
        $gallery = $this->gallery->find($id);

        \Meta::set('title', $gallery->name . ' - Realizacje');

        return view('projects/gallery')->with('gallery', $gallery)->with('photos', $gallery->photos);
    }
}
