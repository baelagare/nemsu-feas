<?php

namespace Tests\Feature\Evaluation;

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

class EvaluationSubmissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            AcademicPeriodSeeder::class,
            DepartmentSeeder::class,
            FacultyAndCourseSeeder::class,
            EvaluationRubricSeeder::class,
        ]);
    }

    /**
     * Helper to build a complete 15-item rating payload.
     *
     * @return array<int, int>
     */
    protected function generateCompleteRatings(int $defaultScore = 5): array
    {
        $ratings = [];
        $criteria = EvaluationCriterion::active()->get();
        foreach ($criteria as $item) {
            $ratings[$item->id] = $defaultScore;
        }

        return $ratings;
    }

    /**
     * Test fetching active academic period.
     */
    public function test_can_fetch_active_academic_period(): void
    {
        $response = $this->getJson('/api/v1/academic-periods/active');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'open',
                    'academic_year' => '2024-2025',
                    'semester' => '1st Semester',
                ],
            ]);
    }

    /**
     * Test fetching departments and faculty directory.
     */
    public function test_can_fetch_departments_and_department_faculty(): void
    {
        $deptResponse = $this->getJson('/api/v1/departments');

        $deptResponse->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonCount(5, 'data');

        $dcs = Department::where('code', 'DCS')->first();
        $facultyResponse = $this->getJson("/api/v1/departments/{$dcs->id}/faculty");

        $facultyResponse->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonCount(4, 'data');
    }

    /**
     * Test fetching questionnaire rubric.
     */
    public function test_can_fetch_rubric_with_sections_and_rating_scales(): void
    {
        $response = $this->getJson('/api/v1/evaluations/rubric');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonCount(5, 'data.rating_scale')
            ->assertJsonCount(3, 'data.sections');
    }

    /**
     * Test student can successfully submit an evaluation with ratings, comments, and ledger record.
     */
    public function test_student_can_successfully_submit_evaluation(): void
    {
        $student = User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'juan.student@nemsu.edu.ph',
            'role' => 'student',
            'student_id' => '2024-00100',
        ]);
        $token = $student->createToken('student-auth')->plainTextToken;

        $period = AcademicPeriod::active()->first();
        $dept = Department::where('code', 'DCS')->first();
        $faculty = Faculty::where('department_id', $dept->id)->first();

        // 15 ratings: scores range 4 and 5
        $ratings = $this->generateCompleteRatings(4);

        $payload = [
            'academic_period_id' => $period->id,
            'department_id' => $dept->id,
            'faculty_id' => $faculty->id,
            'course_code' => 'IT 211',
            'ratings' => $ratings,
            'positive_feedback' => 'Very clear lectures and helpful demonstrations.',
            'improvement_feedback' => 'Provide more real-world lab activities.',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/evaluations', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Evaluation submitted successfully. Thank you for your feedback.',
                'data' => [
                    'status' => 'submitted',
                    'faculty' => $faculty->name,
                    'department_code' => 'DCS',
                    'course_code' => 'IT 211',
                ],
            ]);

        // Verify database records
        $this->assertDatabaseCount('evaluations', 1);
        $this->assertDatabaseCount('evaluation_ratings', 15);
        $this->assertDatabaseCount('student_submission_ledger', 1);

        $evaluation = Evaluation::first();
        $this->assertEquals(4.00, $evaluation->composite_mean);
        $this->assertEquals(4.00, $evaluation->section_a_mean);
        $this->assertStringContainsString('Very clear lectures', $evaluation->qualitative_comment);
        $this->assertStringContainsString('Provide more real-world', $evaluation->qualitative_comment);

        // Verify RA 10173 privacy: No student identifier in evaluation table
        $this->assertFalse(array_key_exists('user_id', $evaluation->getAttributes()));
        $this->assertFalse(array_key_exists('student_id', $evaluation->getAttributes()));

        // Verify ledger has hashed identifier
        $expectedHash = StudentSubmissionLedger::generateHash($student->student_id);
        $this->assertDatabaseHas('student_submission_ledger', [
            'academic_period_id' => $period->id,
            'faculty_id' => $faculty->id,
            'course_code' => 'IT 211',
            'student_id_hash' => $expectedHash,
        ]);
    }

    /**
     * Test submission fails when evaluation criteria ratings are incomplete.
     */
    public function test_submission_fails_when_ratings_incomplete(): void
    {
        $student = User::create([
            'name' => 'Maria Evaluator',
            'email' => 'maria.student@nemsu.edu.ph',
            'role' => 'student',
        ]);
        $token = $student->createToken('student-auth')->plainTextToken;

        $period = AcademicPeriod::active()->first();
        $dept = Department::where('code', 'DCS')->first();
        $faculty = Faculty::where('department_id', $dept->id)->first();

        // Provide only 5 ratings instead of 15
        $allCriteria = EvaluationCriterion::active()->take(5)->get();
        $incompleteRatings = [];
        foreach ($allCriteria as $c) {
            $incompleteRatings[$c->id] = 5;
        }

        $payload = [
            'academic_period_id' => $period->id,
            'department_id' => $dept->id,
            'faculty_id' => $faculty->id,
            'course_code' => 'CS 101',
            'ratings' => $incompleteRatings,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/evaluations', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ratings']);
    }

    /**
     * Test duplicate evaluation submission is rejected to prevent ballot stuffing.
     */
    public function test_duplicate_submission_is_prevented_by_ledger(): void
    {
        $student = User::create([
            'name' => 'Pedro Evaluator',
            'email' => 'pedro.student@nemsu.edu.ph',
            'role' => 'student',
        ]);
        $token = $student->createToken('student-auth')->plainTextToken;

        $period = AcademicPeriod::active()->first();
        $dept = Department::where('code', 'DCS')->first();
        $faculty = Faculty::where('department_id', $dept->id)->first();
        $ratings = $this->generateCompleteRatings(5);

        $payload = [
            'academic_period_id' => $period->id,
            'department_id' => $dept->id,
            'faculty_id' => $faculty->id,
            'course_code' => 'IT 211',
            'ratings' => $ratings,
        ];

        // 1st submission succeeds
        $firstResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/evaluations', $payload);
        $firstResponse->assertStatus(201);

        // 2nd submission for the exact same faculty + course + period by the same student must fail
        $secondResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/evaluations', $payload);

        $secondResponse->assertStatus(422)
            ->assertJsonValidationErrors(['evaluation']);

        // Database must still have only 1 evaluation and 1 ledger entry
        $this->assertDatabaseCount('evaluations', 1);
        $this->assertDatabaseCount('student_submission_ledger', 1);
    }

    /**
     * Test different students can evaluate the same faculty and course.
     */
    public function test_different_students_can_evaluate_same_faculty(): void
    {
        $student1 = User::create([
            'name' => 'Student One',
            'email' => 'student1@nemsu.edu.ph',
            'role' => 'student',
        ]);
        $student2 = User::create([
            'name' => 'Student Two',
            'email' => 'student2@nemsu.edu.ph',
            'role' => 'student',
        ]);

        $token1 = $student1->createToken('s1-token')->plainTextToken;
        $token2 = $student2->createToken('s2-token')->plainTextToken;

        $period = AcademicPeriod::active()->first();
        $dept = Department::where('code', 'DCS')->first();
        $faculty = Faculty::where('department_id', $dept->id)->first();
        $ratings = $this->generateCompleteRatings(5);

        $payload = [
            'academic_period_id' => $period->id,
            'department_id' => $dept->id,
            'faculty_id' => $faculty->id,
            'course_code' => 'CS 101',
            'ratings' => $ratings,
        ];

        // Student 1 submits
        $res1 = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->postJson('/api/v1/evaluations', $payload);
        $res1->assertStatus(201);

        // Reset guard cache between test calls
        $this->app['auth']->forgetGuards();

        // Student 2 submits
        $res2 = $this->withHeader('Authorization', 'Bearer ' . $token2)
            ->postJson('/api/v1/evaluations', $payload);
        $res2->assertStatus(201);

        $this->assertDatabaseCount('evaluations', 2);
        $this->assertDatabaseCount('student_submission_ledger', 2);
    }

    /**
     * Test non-student role cannot submit evaluations.
     */
    public function test_non_student_role_cannot_submit_evaluation(): void
    {
        $hrAdmin = User::create([
            'name' => 'HR Staff',
            'email' => 'hr.staff@nemsu.edu.ph',
            'role' => 'hr_admin',
        ]);
        $token = $hrAdmin->createToken('hr-token')->plainTextToken;

        $period = AcademicPeriod::active()->first();
        $dept = Department::where('code', 'DCS')->first();
        $faculty = Faculty::where('department_id', $dept->id)->first();
        $ratings = $this->generateCompleteRatings(5);

        $payload = [
            'academic_period_id' => $period->id,
            'department_id' => $dept->id,
            'faculty_id' => $faculty->id,
            'course_code' => 'CS 101',
            'ratings' => $ratings,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/evaluations', $payload);

        $response->assertStatus(403);
    }
}
