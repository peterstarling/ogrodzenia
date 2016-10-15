<?php

namespace App\Http\Requests\Gallery;

use App\Http\Requests\BasicRequest;

class StorePhotoRequest extends BasicRequest
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
            'title' => 'string|max:250',
            'photo' => 'required|image|max:3072',
        ];
    }


}
