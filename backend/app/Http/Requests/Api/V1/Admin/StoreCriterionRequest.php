<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'hr_admin';
    }

    public function rules(): array
    {
        return [
            'section_id' => ['required', 'integer', 'exists:evaluation_sections,id'],
            'item_code' => ['required', 'string', 'max:20', 'unique:evaluation_criteria,item_code'],
            'criterion_text' => ['required', 'string'],
            'display_order' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
