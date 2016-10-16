<?php

namespace App\Models;

use Storage;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    protected $fillable = ['title'];
    protected $appends = ['path'];

    public function gallery()
    {
    	return $this->belongsTo(Gallery::class);
    }

    public function getPathAttribute()
    {
    	return [
    		'full' => Storage::url('photos/' . $this->gallery_id . '/' . $this->id . '.jpg'),
    		'mini' => Storage::url('photos/' . $this->gallery_id . '/mini_' . $this->id . '.jpg'),
    	];
    }
}
