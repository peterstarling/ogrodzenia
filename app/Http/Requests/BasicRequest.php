<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

use Starling\Libraries\Response\ResponseParser;

class BasicRequest extends FormRequest
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
            //
        ];
    }

    public function response(array $errors)
    {
        $responseParser = app()->make(ResponseParser::class);
        $responseParser->addOptional(['errors' => $errors]);

        return $errors;
    }


}
