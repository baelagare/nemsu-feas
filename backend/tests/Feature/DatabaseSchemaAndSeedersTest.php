<?php

namespace Tests\Feature;

use App\Models\AcademicPeriod;
use App\Models\Department;
use App\Models\EvaluationCriterion;
use App\Models\EvaluationSection;
use App\Models\RatingScale;
use App\Models\StudentSubmissionLedger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseSchemaAndSeedersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test all required database tables exist in the schema.
     */
    public function test_all_12_domain_tables_exist(): void
    {
        $tables = [
            'users',
            'academic_periods',
            'departments',
            'faculty',
            'courses',
            'faculty_course_assignments',
            'evaluation_sections',
            'evaluation_criteria',
            'rating_scales',
            'evaluations',
            'evaluation_ratings',
            'student_submission_ledger',
        ];

        foreach ($tables as $table) {
            $this->assertTrue(Schema::hasTable($table), "Expected table [{$table}] does not exist.");
        }
    }

    /**
     * Test institutional departments are seeded with correct codes.
     */
    public function test_official_departments_are_seeded(): void
    {
        $this->assertDatabaseCount('departments', 5);

        $codes = ['DCS', 'DBM', 'DIT', 'DGTT', 'CCJE'];
        foreach ($codes as $code) {
            $this->assertDatabaseHas('departments', ['code' => $code]);
        }
    }

    /**
     * Test active academic period is seeded as open.
     */
    public function test_active_academic_period_is_seeded(): void
    {
        $period = AcademicPeriod::active()->first();

        $this->assertNotNull($period);
        $this->assertEquals('2024-2025', $period->academic_year);
        $this->assertEquals('1st Semester', $period->semester);
        $this->assertEquals('open', $period->status);
        $this->assertTrue($period->isOpen());
    }

    /**
     * Test rating scale contains 5 points (scores 5 to 1).
     */
    public function test_rating_scale_rubric_is_seeded(): void
    {
        $this->assertDatabaseCount('rating_scales', 5);

        for ($score = 1; $score <= 5; $score++) {
            $this->assertDatabaseHas('rating_scales', ['score' => $score]);
        }
    }

    /**
     * Test 3 evaluation sections and exactly 15 criteria are seeded.
     */
    public function test_evaluation_sections_and_15_criteria_are_seeded(): void
    {
        $this->assertDatabaseCount('evaluation_sections', 3);
        $this->assertDatabaseCount('evaluation_criteria', 15);

        $sectionA = EvaluationSection::where('code', 'A')->with('criteria')->first();
        $sectionB = EvaluationSection::where('code', 'B')->with('criteria')->first();
        $sectionC = EvaluationSection::where('code', 'C')->with('criteria')->first();

        $this->assertNotNull($sectionA);
        $this->assertCount(6, $sectionA->criteria);

        $this->assertNotNull($sectionB);
        $this->assertCount(5, $sectionB->criteria);

        $this->assertNotNull($sectionC);
        $this->assertCount(4, $sectionC->criteria);
    }

    /**
     * Test user institutional role helper methods and department relationship.
     */
    public function test_user_roles_and_department_relationship(): void
    {
        $dcs = Department::where('code', 'DCS')->first();

        $admin = User::create([
            'name' => 'HR Director Test',
            'email' => 'hr.director.test@nemsu.edu.ph',
            'role' => 'hr_admin',
            'department_id' => $dcs->id,
        ]);

        $this->assertTrue($admin->isHrAdmin());
        $this->assertFalse($admin->isDean());
        $this->assertFalse($admin->isStudent());
        $this->assertEquals('DCS', $admin->department->code);
    }

    /**
     * Test student anti-duplicate hash generator produces deterministic SHA-256 strings.
     */
    public function test_student_submission_ledger_hash_generation(): void
    {
        $hash1 = StudentSubmissionLedger::generateHash('student@nemsu.edu.ph');
        $hash2 = StudentSubmissionLedger::generateHash('STUDENT@nemsu.edu.ph ');

        $this->assertEquals(64, strlen($hash1));
        $this->assertEquals($hash1, $hash2);
    }
}
