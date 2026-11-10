<?php

namespace Tests\Feature\Analytics;

use App\Models\AcademicPeriod;
use App\Models\Department;
use App\Models\Evaluation;
use App\Models\EvaluationCriterion;
use App\Models\EvaluationRating;
use App\Models\Faculty;
use App\Models\StudentSubmissionLedger;
use App\Models\User;
use Database\Seeders\AcademicPeriodSeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\EvaluationRubricSeeder;
use Database\Seeders\FacultyAndCourseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsApiTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicPeriod $period;
    protected Department $dcsDept;
    protected Department $dbmDept;
    protected Faculty $dcsFaculty;
    protected Faculty $dbmFaculty;
    protected User $hrAdmin;
    protected User $dcsDean;
    protected User $student;
    protected string $hrToken;
    protected string $deanToken;
    protected string $studentToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            AcademicPeriodSeeder::class,
            DepartmentSeeder::class,
            FacultyAndCourseSeeder::class,
            EvaluationRubricSeeder::class,
        ]);

        $this->period = AcademicPeriod::active()->first();
        $this->dcsDept = Department::where('code', 'DCS')->first();
        $this->dbmDept = Department::where('code', 'DBM')->first();

        $this->dcsFaculty = Faculty::where('department_id', $this->dcsDept->id)->first();
        $this->dbmFaculty = Faculty::where('department_id', $this->dbmDept->id)->first();

        // Create sample users
        $this->hrAdmin = User::create([
            'name' => 'HR Director',
            'email' => 'hr.director@nemsu.edu.ph',
            'role' => 'hr_admin',
            'staff_id' => 'HR-2024-001',
        ]);
        $this->hrToken = $this->hrAdmin->createToken('hr-token')->plainTextToken;

        $this->dcsDean = User::create([
            'name' => 'Dean DCS',
            'email' => 'dean.dcs@nemsu.edu.ph',
            'role' => 'dean',
            'department_id' => $this->dcsDept->id,
            'staff_id' => 'DEAN-DCS-01',
        ]);
        $this->deanToken = $this->dcsDean->createToken('dean-token')->plainTextToken;

        $this->student = User::create([
            'name' => 'Student Evaluator',
            'email' => 'student.eval@nemsu.edu.ph',
            'role' => 'student',
            'student_id' => '2024-50001',
        ]);
        $this->studentToken = $this->student->createToken('student-token')->plainTextToken;

        // Seed 2 evaluations: 1 in DCS, 1 in DBM
        $this->seedEvaluation($this->dcsDept, $this->dcsFaculty, 'IT 211', 4.80, 5, 'Exceptional instructor!');
        $this->seedEvaluation($this->dbmDept, $this->dbmFaculty, 'BA 101', 3.60, 4, 'Very knowledgeable and patient.');
    }

    /**
     * Helper to create an evaluation with criteria ratings.
     */
    protected function seedEvaluation(
        Department $dept,
        Faculty $faculty,
        string $courseCode,
        float $compositeScore,
        int $ratingScore,
        string $comment
    ): Evaluation {
        $eval = Evaluation::create([
            'academic_period_id' => $this->period->id,
            'department_id' => $dept->id,
            'faculty_id' => $faculty->id,
            'course_code' => $courseCode,
            'qualitative_comment' => $comment,
            'composite_mean' => $compositeScore,
            'section_a_mean' => $compositeScore,
            'section_b_mean' => $compositeScore,
            'section_c_mean' => $compositeScore,
            'submitted_at' => now(),
        ]);

        $criteria = EvaluationCriterion::active()->get();
        $ratings = [];
        foreach ($criteria as $c) {
            $ratings[] = [
                'evaluation_id' => $eval->id,
                'criterion_id' => $c->id,
                'score' => $ratingScore,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        EvaluationRating::insert($ratings);

        return $eval;
    }

    /**
     * Test unauthenticated access to analytics is rejected.
     */
    public function test_unauthenticated_request_is_denied(): void
    {
        $response = $this->getJson('/api/v1/analytics/overview');
        $response->assertStatus(401);
    }

    /**
     * Test student role cannot access administrative analytics (403 Forbidden).
     */
    public function test_student_role_is_forbidden_from_analytics(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->studentToken)
            ->getJson('/api/v1/analytics/overview');

        $response->assertStatus(403);
    }

    /**
     * Test HR Admin can access campus-wide overview KPIs.
     */
    public function test_hr_admin_can_access_overview_kpis(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->hrToken)
            ->getJson('/api/v1/analytics/overview');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'kpis' => [
                        'total_evaluations' => 2,
                        'evaluated_faculty_count' => 2,
                    ],
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(4.20, $data['kpis']['overall_mean']); // (4.80 + 3.60) / 2
        $this->assertEquals('Very Satisfactory', $data['kpis']['descriptive_rating']);
        $this->assertEquals(15, $data['rating_distribution'][5]); // 15 ratings of 5
        $this->assertEquals(15, $data['rating_distribution'][4]); // 15 ratings of 4
    }

    /**
     * Test HR Admin can access department comparative metrics.
     */
    public function test_hr_admin_can_access_department_metrics(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->hrToken)
            ->getJson('/api/v1/analytics/departments');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonCount(5, 'data');

        $dcsData = collect($response->json('data'))->firstWhere('code', 'DCS');
        $this->assertNotNull($dcsData);
        $this->assertEquals(1, $dcsData['evaluations_count']);
        $this->assertEquals(4.80, $dcsData['average_rating']);
        $this->assertEquals('Outstanding', $dcsData['descriptive_rating']);
    }

    /**
     * Test HR Admin can access full faculty roster and filter by search.
     */
    public function test_hr_admin_can_access_faculty_roster_and_search(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->hrToken)
            ->getJson('/api/v1/analytics/faculty');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Search for specific faculty member
        $searchResponse = $this->withHeader('Authorization', 'Bearer ' . $this->hrToken)
            ->getJson('/api/v1/analytics/faculty?search=' . urlencode($this->dcsFaculty->name));

        $searchResponse->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $facRecord = $searchResponse->json('data.0');
        $this->assertEquals($this->dcsFaculty->name, $facRecord['name']);
        $this->assertEquals(1, $facRecord['evaluations_count']);
        $this->assertEquals(4.80, $facRecord['composite_mean']);
        $this->assertEquals('Outstanding', $facRecord['descriptive_rating']);
    }

    /**
     * Test academic dean analytics are scoped strictly to their assigned department.
     */
    public function test_academic_dean_is_scoped_to_assigned_department(): void
    {
        // 1. Overview for DCS Dean shows only 1 DCS evaluation (not the DBM one)
        $overviewResponse = $this->withHeader('Authorization', 'Bearer ' . $this->deanToken)
            ->getJson('/api/v1/analytics/overview');

        $overviewResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'kpis' => [
                        'total_evaluations' => 1,
                        'overall_mean' => 4.80,
                        'descriptive_rating' => 'Outstanding',
                    ],
                ],
            ]);

        // 2. Department metrics for DCS Dean returns only 1 department (DCS)
        $this->app['auth']->forgetGuards();
        $deptResponse = $this->withHeader('Authorization', 'Bearer ' . $this->deanToken)
            ->getJson('/api/v1/analytics/departments');

        $deptResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJson([
                'data' => [
                    [
                        'code' => 'DCS',
                        'evaluations_count' => 1,
                    ],
                ],
            ]);

        // 3. Faculty roster for DCS Dean returns only DCS faculty
        $this->app['auth']->forgetGuards();
        $rosterResponse = $this->withHeader('Authorization', 'Bearer ' . $this->deanToken)
            ->getJson('/api/v1/analytics/faculty');

        $rosterResponse->assertStatus(200);
        foreach ($rosterResponse->json('data') as $facultyItem) {
            $this->assertEquals('DCS', $facultyItem['department_code']);
        }
    }

    /**
     * Test qualitative feedback feed with search.
     */
    public function test_qualitative_feedback_feed(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->hrToken)
            ->getJson('/api/v1/analytics/feedback');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonCount(2, 'data');

        // Search feedback comment
        $searchResponse = $this->withHeader('Authorization', 'Bearer ' . $this->hrToken)
            ->getJson('/api/v1/analytics/feedback?search=Exceptional');

        $searchResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJson([
                'data' => [
                    [
                        'department_code' => 'DCS',
                        'course_code' => 'IT 211',
                    ],
                ],
            ]);
    }

    /**
     * Test CSV report export returns streamed spreadsheet.
     */
    public function test_report_csv_export(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->hrToken)
            ->get('/api/v1/reports/export');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('content-type'));
        $this->assertStringContainsString('attachment; filename="nemsu-feas-evaluation-report-', $response->headers->get('content-disposition'));

        // Streamed content validation
        $content = $response->streamedContent();
        $this->assertStringContainsString('Faculty Name', $content);
        $this->assertStringContainsString('Department Code', $content);
        $this->assertStringContainsString('Composite Mean', $content);
        $this->assertStringContainsString($this->dcsFaculty->name, $content);
        $this->assertStringContainsString('IT 211', $content);
        $this->assertStringContainsString('Exceptional instructor!', $content);
    }
}
