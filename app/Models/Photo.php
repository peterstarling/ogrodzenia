<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    protected $fillable = ['title'];

    public function gallery()
    {
    	return $this->belongsTo(Gallery::class);
    }
}
