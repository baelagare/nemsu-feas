<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class GoogleAuthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_token' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_token.required' => 'Google ID token is required.',
            'id_token.string' => 'Google ID token must be a valid string.',
        ];
    }
}
