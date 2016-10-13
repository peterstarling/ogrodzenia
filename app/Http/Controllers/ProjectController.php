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
		$this->gallery = $gallery;
	}

    /**
     * List all galleries
     *
     * @return array
     */
    public function index()
    {
        \Meta::set('title', 'Realizacje');

        return view('projects/index')->with('projects', $this->gallery->all()->toArray());
    }
}
