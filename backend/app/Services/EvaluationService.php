<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Evaluation;
use App\Models\EvaluationCriterion;
use App\Models\EvaluationRating;
use App\Models\EvaluationSection;
use App\Models\StudentSubmissionLedger;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EvaluationService
{
    /**
     * Submit an anonymous student faculty evaluation and record ledger entry.
     *
     * @param  array<string, mixed>  $data
     * @param  array<int, int>  $normalizedRatings  [criterion_id => score]
     * @throws ValidationException
     */
    public function submitEvaluation(User $user, array $data, array $normalizedRatings): Evaluation
    {
        $academicPeriodId = (int) $data['academic_period_id'];
        $departmentId = (int) $data['department_id'];
        $facultyId = (int) $data['faculty_id'];
        $courseCode = strtoupper(trim($data['course_code']));

        // 1. Anti-Duplicate Single Entry Check (RA 10173 Anonymous Hash Ledger)
        $studentIdentifier = $user->student_id ?: $user->email;
        $studentHash = StudentSubmissionLedger::generateHash($studentIdentifier);

        $alreadySubmitted = StudentSubmissionLedger::query()
            ->where('academic_period_id', $academicPeriodId)
            ->where('faculty_id', $facultyId)
            ->where('course_code', $courseCode)
            ->where('student_id_hash', $studentHash)
            ->exists();

        if ($alreadySubmitted) {
            throw ValidationException::withMessages([
                'evaluation' => [
                    'You have already submitted an evaluation for this faculty member and course in the current academic period.',
                ],
            ]);
        }

        // 2. Format Qualitative Feedback
        $qualitativeComment = $data['qualitative_comment'] ?? null;
        if (! $qualitativeComment) {
            $parts = [];
            if (! empty($data['positive_feedback'])) {
                $parts[] = 'Strengths: ' . trim($data['positive_feedback']);
            }
            if (! empty($data['improvement_feedback'])) {
                $parts[] = 'Areas for Improvement: ' . trim($data['improvement_feedback']);
            }
            if (count($parts) > 0) {
                $qualitativeComment = implode("\n", $parts);
            }
        }

        // 3. Calculate Section Means and Composite Overall Mean
        $sections = EvaluationSection::with('criteria')->orderBy('display_order')->get();
        $sectionMeans = [
            'A' => 0.00,
            'B' => 0.00,
            'C' => 0.00,
        ];

        $totalScores = [];
        foreach ($sections as $section) {
            $sectionScores = [];
            foreach ($section->criteria as $criterion) {
                if (isset($normalizedRatings[$criterion->id])) {
                    $score = (int) $normalizedRatings[$criterion->id];
                    $sectionScores[] = $score;
                    $totalScores[] = $score;
                }
            }

            if (count($sectionScores) > 0) {
                $sectionMeans[$section->code] = round(array_sum($sectionScores) / count($sectionScores), 2);
            }
        }

        $compositeMean = count($totalScores) > 0
            ? round(array_sum($totalScores) / count($totalScores), 2)
            : 0.00;

        // 4. Resolve Course ID if catalog course exists
        $courseId = Course::query()
            ->where('department_id', $departmentId)
            ->where('code', $courseCode)
            ->value('id');

        // 5. Atomic Persistence (Completely Anonymized Evaluation + Private Ledger)
        return DB::transaction(function () use (
            $academicPeriodId,
            $departmentId,
            $facultyId,
            $courseId,
            $courseCode,
            $qualitativeComment,
            $compositeMean,
            $sectionMeans,
            $normalizedRatings,
            $studentHash
        ) {
            $now = now();

            // Record anonymized evaluation
            $evaluation = Evaluation::create([
                'academic_period_id' => $academicPeriodId,
                'department_id' => $departmentId,
                'faculty_id' => $facultyId,
                'course_id' => $courseId,
                'course_code' => $courseCode,
                'qualitative_comment' => $qualitativeComment,
                'composite_mean' => $compositeMean,
                'section_a_mean' => $sectionMeans['A'] ?? 0.00,
                'section_b_mean' => $sectionMeans['B'] ?? 0.00,
                'section_c_mean' => $sectionMeans['C'] ?? 0.00,
                'submitted_at' => $now,
            ]);

            // Record individual criterion ratings
            $ratingRows = [];
            foreach ($normalizedRatings as $criterionId => $score) {
                $ratingRows[] = [
                    'evaluation_id' => $evaluation->id,
                    'criterion_id' => $criterionId,
                    'score' => $score,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            EvaluationRating::insert($ratingRows);

            // Record single-entry receipt in private hashed ledger
            StudentSubmissionLedger::create([
                'academic_period_id' => $academicPeriodId,
                'student_id_hash' => $studentHash,
                'faculty_id' => $facultyId,
                'course_code' => $courseCode,
                'submitted_at' => $now,
            ]);

            return $evaluation->load(['faculty', 'department', 'academicPeriod']);
        });
    }
}
