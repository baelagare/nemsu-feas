<?php

namespace Tests\Feature\Admin;

use App\Models\EvaluationCriterion;
use App\Models\EvaluationSection;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\EvaluationRubricSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRubricCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $hrAdmin;
    protected User $student;
    protected string $adminToken;
    protected string $studentToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            DepartmentSeeder::class,
            EvaluationRubricSeeder::class,
            UserSeeder::class,
        ]);

        $this->hrAdmin = User::where('role', 'hr_admin')->first();
        $this->adminToken = $this->hrAdmin->createToken('admin-token')->plainTextToken;

        $this->student = User::create([
            'name' => 'Student Rubric',
            'email' => 'student.rubric@nemsu.edu.ph',
            'role' => 'student',
        ]);
        $this->studentToken = $this->student->createToken('student-token')->plainTextToken;
    }

    /**
     * Test HR Admin can fetch the complete rubric tree.
     */
    public function test_hr_admin_can_fetch_rubric_sections(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/rubric');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'code',
                        'title',
                        'description',
                        'display_order',
                        'criteria',
                    ],
                ],
            ]);
    }

    /**
     * Test HR Admin can add a new rubric section.
     */
    public function test_hr_admin_can_create_rubric_section(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/rubric/sections', [
                'code' => 'D',
                'title' => 'D. Professionalism and Community Engagement',
                'description' => 'Rate each statement from 5 to 1.',
                'display_order' => 4,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'code' => 'D',
                    'title' => 'D. Professionalism and Community Engagement',
                ],
            ]);

        $this->assertDatabaseHas('evaluation_sections', [
            'code' => 'D',
        ]);
    }

    /**
     * Test HR Admin can update an existing section.
     */
    public function test_hr_admin_can_update_rubric_section(): void
    {
        $section = EvaluationSection::where('code', 'A')->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson("/api/v1/admin/rubric/sections/{$section->id}", [
                'title' => 'A. Classroom Management and Facilitation',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'A. Classroom Management and Facilitation',
                ],
            ]);

        $this->assertDatabaseHas('evaluation_sections', [
            'id' => $section->id,
            'title' => 'A. Classroom Management and Facilitation',
        ]);
    }

    /**
     * Test HR Admin can add a new criterion/question to a section.
     */
    public function test_hr_admin_can_create_rubric_criterion(): void
    {
        $section = EvaluationSection::where('code', 'A')->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/rubric/criteria', [
                'section_id' => $section->id,
                'item_code' => 'a7',
                'criterion_text' => 'Uses educational multimedia tools effectively.',
                'display_order' => 7,
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'item_code' => 'a7',
                    'criterion_text' => 'Uses educational multimedia tools effectively.',
                ],
            ]);

        $this->assertDatabaseHas('evaluation_criteria', [
            'item_code' => 'a7',
        ]);
    }

    /**
     * Test HR Admin can update a criterion/question.
     */
    public function test_hr_admin_can_update_rubric_criterion(): void
    {
        $criterion = EvaluationCriterion::where('item_code', 'a1')->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson("/api/v1/admin/rubric/criteria/{$criterion->id}", [
                'criterion_text' => 'Punctually starts and manages synchronous class sessions.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'criterion_text' => 'Punctually starts and manages synchronous class sessions.',
                ],
            ]);

        $this->assertDatabaseHas('evaluation_criteria', [
            'id' => $criterion->id,
            'criterion_text' => 'Punctually starts and manages synchronous class sessions.',
        ]);
    }

    /**
     * Test HR Admin can delete a criterion that has no submitted evaluations.
     */
    public function test_hr_admin_can_delete_unused_criterion(): void
    {
        $section = EvaluationSection::where('code', 'A')->first();
        $criterion = EvaluationCriterion::create([
            'section_id' => $section->id,
            'item_code' => 'a_temp',
            'criterion_text' => 'Temporary statement',
            'display_order' => 99,
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->deleteJson("/api/v1/admin/rubric/criteria/{$criterion->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'deactivated' => false,
            ]);

        $this->assertDatabaseMissing('evaluation_criteria', ['id' => $criterion->id]);
    }

    /**
     * Test non-admin cannot modify rubric (403 Forbidden).
     */
    public function test_student_cannot_modify_rubric(): void
    {
        $section = EvaluationSection::where('code', 'A')->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->studentToken)
            ->postJson('/api/v1/admin/rubric/criteria', [
                'section_id' => $section->id,
                'item_code' => 'hack',
                'criterion_text' => 'Unauthorized criterion',
            ]);

        $response->assertStatus(403);
    }
}
