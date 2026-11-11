<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\Department;
use App\Models\Evaluation;
use App\Models\EvaluationRating;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsService
{
    /**
     * Resolve target academic period (provided ID or active period).
     */
    public function resolveAcademicPeriod(?int $academicPeriodId = null): ?AcademicPeriod
    {
        if ($academicPeriodId) {
            return AcademicPeriod::find($academicPeriodId);
        }

        return AcademicPeriod::active()->first() ?? AcademicPeriod::orderBy('id', 'desc')->first();
    }

    /**
     * Translate quantitative mean score to official CHED/NEMSU descriptive rating.
     */
    public static function getDescriptiveRating(?float $score): string
    {
        if ($score === null || $score <= 0) {
            return 'No Evaluations';
        }
        if ($score >= 4.50) {
            return 'Outstanding';
        }
        if ($score >= 3.50) {
            return 'Very Satisfactory';
        }
        if ($score >= 2.50) {
            return 'Satisfactory';
        }
        if ($score >= 1.50) {
            return 'Fair';
        }

        return 'Poor';
    }

    /**
     * Compute system-wide or department-scoped high-level KPIs.
     *
     * @return array<string, mixed>
     */
    public function getOverview(?int $academicPeriodId = null, ?User $user = null): array
    {
        $period = $this->resolveAcademicPeriod($academicPeriodId);

        $evalQuery = Evaluation::query();
        $deptQuery = Department::query();
        $facultyQuery = Faculty::query()->where('is_active', true);

        if ($period) {
            $evalQuery->where('academic_period_id', $period->id);
        }

        // Restrict scope if user is academic dean
        $isDean = $user && $user->role === 'dean';
        if ($isDean && $user->department_id) {
            $evalQuery->where('department_id', $user->department_id);
            $deptQuery->where('id', $user->department_id);
            $facultyQuery->where('department_id', $user->department_id);
        }

        $totalEvaluations = $evalQuery->count();
        $targetEvaluations = (int) $deptQuery->sum('target_evaluations');
        $completionRate = $targetEvaluations > 0
            ? round(($totalEvaluations / $targetEvaluations) * 100, 1)
            : 0.0;

        $overallMean = $totalEvaluations > 0
            ? round((float) $evalQuery->avg('composite_mean'), 2)
            : 0.00;

        $sectionAMean = $totalEvaluations > 0
            ? round((float) $evalQuery->avg('section_a_mean'), 2)
            : 0.00;

        $sectionBMean = $totalEvaluations > 0
            ? round((float) $evalQuery->avg('section_b_mean'), 2)
            : 0.00;

        $sectionCMean = $totalEvaluations > 0
            ? round((float) $evalQuery->avg('section_c_mean'), 2)
            : 0.00;

        $activeFacultyCount = $facultyQuery->count();
        $evaluatedFacultyCount = (clone $evalQuery)->distinct('faculty_id')->count('faculty_id');

        // Rating Scale Distribution (Scores 1 to 5)
        $ratingDistribution = [
            5 => 0,
            4 => 0,
            3 => 0,
            2 => 0,
            1 => 0,
        ];

        if ($totalEvaluations > 0) {
            $distributionCounts = EvaluationRating::query()
                ->whereIn('evaluation_id', (clone $evalQuery)->select('id'))
                ->select('score', DB::raw('count(*) as count'))
                ->groupBy('score')
                ->pluck('count', 'score')
                ->toArray();

            foreach ($distributionCounts as $score => $cnt) {
                $ratingDistribution[(int) $score] = (int) $cnt;
            }
        }

        return [
            'academic_period' => $period ? [
                'id' => $period->id,
                'academic_year' => $period->academic_year,
                'semester' => $period->semester,
                'label' => "A.Y. {$period->academic_year}, {$period->semester}",
                'status' => $period->status,
            ] : null,
            'kpis' => [
                'total_evaluations' => $totalEvaluations,
                'target_evaluations' => $targetEvaluations,
                'completion_rate' => $completionRate,
                'overall_mean' => $overallMean,
                'descriptive_rating' => self::getDescriptiveRating($overallMean),
                'active_faculty_count' => $activeFacultyCount,
                'evaluated_faculty_count' => $evaluatedFacultyCount,
            ],
            'sections_mean' => [
                'section_a' => $sectionAMean,
                'section_b' => $sectionBMean,
                'section_c' => $sectionCMean,
            ],
            'rating_distribution' => $ratingDistribution,
        ];
    }

    /**
     * Compute comparative metrics across academic departments.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getDepartmentMetrics(?int $academicPeriodId = null, ?User $user = null): array
    {
        $period = $this->resolveAcademicPeriod($academicPeriodId);

        $query = Department::query()->withCount(['faculty' => function ($q) {
            $q->where('is_active', true);
        }]);

        if ($user && $user->role === 'dean' && $user->department_id) {
            $query->where('id', $user->department_id);
        }

        $departments = $query->orderBy('code')->get();

        return $departments->map(function ($dept) use ($period) {
            $evalQuery = Evaluation::query()->where('department_id', $dept->id);
            if ($period) {
                $evalQuery->where('academic_period_id', $period->id);
            }

            $count = $evalQuery->count();
            $target = (int) $dept->target_evaluations;
            $turnout = $target > 0 ? round(($count / $target) * 100, 1) : 0.0;
            $mean = $count > 0 ? round((float) $evalQuery->avg('composite_mean'), 2) : 0.00;
            $secA = $count > 0 ? round((float) $evalQuery->avg('section_a_mean'), 2) : 0.00;
            $secB = $count > 0 ? round((float) $evalQuery->avg('section_b_mean'), 2) : 0.00;
            $secC = $count > 0 ? round((float) $evalQuery->avg('section_c_mean'), 2) : 0.00;

            return [
                'id' => $dept->id,
                'code' => $dept->code,
                'name' => $dept->name,
                'dean_name' => $dept->dean_name,
                'evaluations_count' => $count,
                'target_evaluations' => $target,
                'completion_rate' => $turnout,
                'average_rating' => $mean,
                'section_a_mean' => $secA,
                'section_b_mean' => $secB,
                'section_c_mean' => $secC,
                'descriptive_rating' => self::getDescriptiveRating($mean),
                'faculty_count' => $dept->faculty_count,
            ];
        })->toArray();
    }

    /**
     * Compute individual faculty performance metrics and ranking roster.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getFacultyRoster(
        ?int $academicPeriodId = null,
        ?int $departmentId = null,
        ?string $search = null,
        ?User $user = null
    ): array {
        $period = $this->resolveAcademicPeriod($academicPeriodId);

        $query = Faculty::query()->with('department')->where('is_active', true);

        // Scope to dean's assigned department if dean
        if ($user && $user->role === 'dean' && $user->department_id) {
            $departmentId = $user->department_id;
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $facultyList = $query->orderBy('name')->get();

        return $facultyList->map(function ($fac) use ($period) {
            $evalQuery = Evaluation::query()->where('faculty_id', $fac->id);
            if ($period) {
                $evalQuery->where('academic_period_id', $period->id);
            }

            $evalCount = $evalQuery->count();
            $compositeMean = $evalCount > 0 ? round((float) $evalQuery->avg('composite_mean'), 2) : 0.00;
            $secA = $evalCount > 0 ? round((float) $evalQuery->avg('section_a_mean'), 2) : 0.00;
            $secB = $evalCount > 0 ? round((float) $evalQuery->avg('section_b_mean'), 2) : 0.00;
            $secC = $evalCount > 0 ? round((float) $evalQuery->avg('section_c_mean'), 2) : 0.00;

            $courseCodes = (clone $evalQuery)->distinct('course_code')->pluck('course_code')->filter()->values()->toArray();
            $latestRemark = (clone $evalQuery)
                ->whereNotNull('qualitative_comment')
                ->where('qualitative_comment', '!=', '')
                ->orderByDesc('submitted_at')
                ->value('qualitative_comment');

            return [
                'id' => $fac->id,
                'name' => $fac->name,
                'email' => $fac->email,
                'department_id' => $fac->department_id,
                'department_code' => $fac->department?->code,
                'department_name' => $fac->department?->name,
                'employment_status' => $fac->employment_status,
                'evaluations_count' => $evalCount,
                'composite_mean' => $compositeMean,
                'section_a_mean' => $secA,
                'section_b_mean' => $secB,
                'section_c_mean' => $secC,
                'descriptive_rating' => self::getDescriptiveRating($compositeMean),
                'courses' => implode(', ', $courseCodes),
                'sample_remark' => $latestRemark,
            ];
        })->toArray();
    }

    /**
     * Retrieve qualitative student remarks and feedback comments.
     *
     * @return array<string, mixed>
     */
    public function getFeedbackFeed(
        ?int $academicPeriodId = null,
        ?int $departmentId = null,
        ?int $facultyId = null,
        ?string $search = null,
        ?User $user = null
    ): array {
        $period = $this->resolveAcademicPeriod($academicPeriodId);

        $query = Evaluation::query()
            ->with(['faculty', 'department'])
            ->whereNotNull('qualitative_comment')
            ->where('qualitative_comment', '!=', '');

        if ($period) {
            $query->where('academic_period_id', $period->id);
        }

        // Scope to dean's assigned department if dean
        if ($user && $user->role === 'dean' && $user->department_id) {
            $departmentId = $user->department_id;
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($facultyId) {
            $query->where('faculty_id', $facultyId);
        }

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('qualitative_comment', 'like', "%{$search}%")
                    ->orWhere('course_code', 'like', "%{$search}%")
                    ->orWhereHas('faculty', function ($facQ) use ($search) {
                        $facQ->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $feedbacks = $query->orderBy('submitted_at', 'desc')->paginate(20);

        return [
            'data' => collect($feedbacks->items())->map(function ($ev) {
                return [
                    'id' => $ev->id,
                    'faculty_name' => $ev->faculty?->name,
                    'department_code' => $ev->department?->code,
                    'department_name' => $ev->department?->name,
                    'course_code' => $ev->course_code,
                    'composite_mean' => $ev->composite_mean,
                    'comment' => $ev->qualitative_comment,
                    'submitted_at' => $ev->submitted_at?->toIso8601String(),
                ];
            }),
            'pagination' => [
                'current_page' => $feedbacks->currentPage(),
                'last_page' => $feedbacks->lastPage(),
                'per_page' => $feedbacks->perPage(),
                'total' => $feedbacks->total(),
            ],
        ];
    }

    /**
     * Generate an official CSV export stream of faculty evaluations.
     */
    public function exportCsv(
        ?int $academicPeriodId = null,
        ?int $departmentId = null,
        ?User $user = null
    ): StreamedResponse {
        $period = $this->resolveAcademicPeriod($academicPeriodId);

        $query = Evaluation::query()->with(['faculty', 'department', 'academicPeriod']);

        if ($period) {
            $query->where('academic_period_id', $period->id);
        }

        if ($user && $user->role === 'dean' && $user->department_id) {
            $departmentId = $user->department_id;
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $query->orderBy('submitted_at', 'desc');

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="nemsu-feas-evaluation-report-' . date('Y-m-d_His') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return new StreamedResponse(function () use ($query) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // CSV Header Row
            fputcsv($handle, [
                'Evaluation ID',
                'Academic Year',
                'Semester',
                'Department Code',
                'Department Name',
                'Faculty Name',
                'Course Code',
                'Section A (Management)',
                'Section B (Pedagogy)',
                'Section C (Transparency)',
                'Composite Mean',
                'Descriptive Rating',
                'Qualitative Comment',
                'Date Submitted',
            ]);

            $query->chunk(100, function ($evaluations) use ($handle) {
                foreach ($evaluations as $eval) {
                    fputcsv($handle, [
                        $eval->id,
                        $eval->academicPeriod?->academic_year,
                        $eval->academicPeriod?->semester,
                        $eval->department?->code,
                        $eval->department?->name,
                        $eval->faculty?->name,
                        $eval->course_code,
                        number_format($eval->section_a_mean, 2),
                        number_format($eval->section_b_mean, 2),
                        number_format($eval->section_c_mean, 2),
                        number_format($eval->composite_mean, 2),
                        self::getDescriptiveRating($eval->composite_mean),
                        $eval->qualitative_comment,
                        $eval->submitted_at?->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
