<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PostContactRequest extends FormRequest
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
        $phoneRegex = '/^(?:\(?\+?48)?(?:[-\.\(\)\s]*(\d)){9}\)?/';

        return [
            'name' => 'required|string|max:300',
            'email' => 'required|email',
            'phone' => ['regex:' . $phoneRegex],
            'captcha' => 'required|captcha',
            'query' => 'required|string',
        ];
    }


}
