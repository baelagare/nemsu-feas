<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationReceiptResource extends JsonResource
{
    /**
     * Transform the evaluation receipt into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $evaluation = $this->resource['evaluation'];
        $faculty = $evaluation->faculty;
        $department = $evaluation->department;
        $period = $evaluation->academicPeriod;

        $confirmationCode = 'FEAS-EV-' . strtoupper(substr(hash('crc32b', (string) $evaluation->id . $evaluation->submitted_at), 0, 8));

        return [
            'confirmation_code' => $confirmationCode,
            'status' => 'submitted',
            'faculty' => $faculty ? $faculty->name : null,
            'department' => $department ? $department->name : null,
            'department_code' => $department ? $department->code : null,
            'course_code' => $evaluation->course_code,
            'academic_period' => $period ? "A.Y. {$period->academic_year}, {$period->semester}" : null,
            'submitted_at' => $evaluation->submitted_at?->toIso8601String(),
            'message' => 'Your evaluation has been anonymously submitted and recorded in compliance with RA 10173.',
        ];
    }
}
