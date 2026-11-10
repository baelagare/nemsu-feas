<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'hr_admin';
    }

    public function rules(): array
    {
        $criterionId = $this->route('criterion')?->id ?? $this->route('criterion');

        return [
            'section_id' => ['sometimes', 'required', 'integer', 'exists:evaluation_sections,id'],
            'item_code' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('evaluation_criteria', 'item_code')->ignore($criterionId)],
            'criterion_text' => ['sometimes', 'required', 'string'],
            'display_order' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
