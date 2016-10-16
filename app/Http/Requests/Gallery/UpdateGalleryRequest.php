<?php

namespace App\Http\Requests\Gallery;

use App\Http\Requests\BasicRequest;

class UpdateGalleryRequest extends BasicRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'string|max:300',
            'description' => 'string',
            'default_photo' => 'integer|exists:photos,id'
        ];
    }


}
