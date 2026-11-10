<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFacultyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'hr_admin';
    }

    public function rules(): array
    {
        $facultyId = $this->route('faculty')?->id ?? $this->route('faculty');

        return [
            'department_id' => ['sometimes', 'required', 'integer', 'exists:departments,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('faculty', 'email')->ignore($facultyId)],
            'employment_status' => ['sometimes', 'required', Rule::in(['permanent', 'contractual', 'part-time'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
