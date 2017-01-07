<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $fillable = ['name', 'description', 'category', 'slug', 'default_photo'];
    protected $appends = ['default_photo_path'];

    public function photos()
    {
    	return $this->hasMany(Photo::class);
    }

    public function getDefaultPhotoPathAttribute()
    {
    	if ($this->default_photo === null) {
    		return;
    	}

    	return $this->photos()->where('id', $this->default_photo)->first()->path;
    }
}
