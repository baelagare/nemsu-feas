<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'hr_admin';
    }

    public function rules(): array
    {
        $sectionId = $this->route('section')?->id ?? $this->route('section');

        return [
            'code' => ['sometimes', 'required', 'string', 'max:10', Rule::unique('evaluation_sections', 'code')->ignore($sectionId)],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'display_order' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
