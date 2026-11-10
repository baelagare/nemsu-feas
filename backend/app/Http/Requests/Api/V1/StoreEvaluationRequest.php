<?php

namespace App\Http\Requests\Api\V1;

use App\Models\AcademicPeriod;
use App\Models\EvaluationCriterion;
use App\Models\Faculty;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreEvaluationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'academic_period_id' => ['required', 'integer', 'exists:academic_periods,id'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'faculty_id' => ['required', 'integer', 'exists:faculty,id'],
            'course_code' => ['required', 'string', 'max:50'],
            'ratings' => ['required'],
            'ratings.*' => ['nullable'],
            'qualitative_comment' => ['nullable', 'string', 'max:2000'],
            'positive_feedback' => ['nullable', 'string', 'max:1000'],
            'improvement_feedback' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Custom validation to enforce institutional rules and all-criteria rating.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                // 1. Validate Academic Period is currently open
                if ($this->academic_period_id) {
                    $period = AcademicPeriod::find($this->academic_period_id);
                    if (! $period || ! $period->isOpen()) {
                        $validator->errors()->add(
                            'academic_period_id',
                            'The selected academic period is not currently open for evaluations.'
                        );
                    }
                }

                // 2. Validate Faculty belongs to the chosen Department and is active
                if ($this->faculty_id && $this->department_id) {
                    $faculty = Faculty::find($this->faculty_id);
                    if ($faculty) {
                        if ((int) $faculty->department_id !== (int) $this->department_id) {
                            $validator->errors()->add(
                                'faculty_id',
                                'The selected faculty member does not belong to the selected department.'
                            );
                        }
                        if (! $faculty->is_active) {
                            $validator->errors()->add(
                                'faculty_id',
                                'The selected faculty member is currently inactive.'
                            );
                        }
                    }
                }

                // 3. Validate complete ratings for all active criteria (15 items)
                $rawRatings = $this->input('ratings');
                $normalizedRatings = $this->normalizeRatings($rawRatings);

                $activeCriteria = EvaluationCriterion::active()->get();
                $requiredCount = $activeCriteria->count();

                if (count($normalizedRatings) < $requiredCount) {
                    $missing = $requiredCount - count($normalizedRatings);
                    $validator->errors()->add(
                        'ratings',
                        "Please rate all {$requiredCount} evaluation criteria statements ({$missing} remaining)."
                    );
                }

                foreach ($normalizedRatings as $criterionId => $score) {
                    if (! is_numeric($score) || (int) $score < 1 || (int) $score > 5) {
                        $validator->errors()->add(
                            "ratings.{$criterionId}",
                            "Rating score for item {$criterionId} must be an integer between 1 and 5."
                        );
                    }
                }
            },
        ];
    }

    /**
     * Normalize ratings input whether submitted as:
     * - [ {"criterion_id": 1, "score": 5}, ... ]
     * - {"1": 5, "2": 4}
     * - {"a1": 5, "a2": 4}
     *
     * @return array<int, int> [criterion_id => score]
     */
    public function normalizeRatings(mixed $ratings): array
    {
        if (! is_array($ratings)) {
            return [];
        }

        $normalized = [];
        $criteriaByCode = EvaluationCriterion::all()->keyBy('item_code');
        $criteriaById = EvaluationCriterion::all()->keyBy('id');

        // Case A: Indexed array of objects [ {"criterion_id": 1, "score": 5} ]
        if (array_is_list($ratings)) {
            foreach ($ratings as $entry) {
                if (! is_array($entry)) {
                    continue;
                }

                $criterionId = $entry['criterion_id'] ?? $entry['criteria_id'] ?? null;
                $itemCode = $entry['item_code'] ?? null;
                $score = $entry['score'] ?? null;

                if (! $criterionId && $itemCode && isset($criteriaByCode[$itemCode])) {
                    $criterionId = $criteriaByCode[$itemCode]->id;
                }

                if ($criterionId && isset($criteriaById[$criterionId]) && $score !== null) {
                    $normalized[(int) $criterionId] = (int) $score;
                }
            }

            return $normalized;
        }

        // Case B: Associative array { "1": 5 } or { "a1": 5 }
        foreach ($ratings as $key => $score) {
            if ($score === null || $score === '') {
                continue;
            }

            $criterionId = null;
            if (is_numeric($key) && isset($criteriaById[(int) $key])) {
                $criterionId = (int) $key;
            } elseif (isset($criteriaByCode[(string) $key])) {
                $criterionId = $criteriaByCode[(string) $key]->id;
            }

            if ($criterionId) {
                $normalized[$criterionId] = (int) $score;
            }
        }

        return $normalized;
    }
}
