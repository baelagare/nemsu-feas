<?php

namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\Evaluation;
use App\Models\Faculty;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFacultyCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $hrAdmin;
    protected User $student;
    protected string $adminToken;
    protected string $studentToken;
    protected Department $dcs;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            DepartmentSeeder::class,
            UserSeeder::class,
        ]);

        $this->hrAdmin = User::where('role', 'hr_admin')->first();
        $this->adminToken = $this->hrAdmin->createToken('admin-token')->plainTextToken;

        $this->student = User::create([
            'name' => 'Student User',
            'email' => 'student.crud@nemsu.edu.ph',
            'role' => 'student',
        ]);
        $this->studentToken = $this->student->createToken('student-token')->plainTextToken;

        $this->dcs = Department::where('code', 'DCS')->first();
    }

    /**
     * Test HR Admin can add a new faculty member.
     */
    public function test_hr_admin_can_create_faculty(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/faculty', [
                'department_id' => $this->dcs->id,
                'name' => 'Prof. Roberto Mendoza',
                'email' => 'roberto.mendoza@nemsu.edu.ph',
                'employment_status' => 'permanent',
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Faculty member successfully added.',
                'data' => [
                    'name' => 'Prof. Roberto Mendoza',
                    'email' => 'roberto.mendoza@nemsu.edu.ph',
                    'employment_status' => 'permanent',
                ],
            ]);

        $this->assertDatabaseHas('faculty', [
            'name' => 'Prof. Roberto Mendoza',
            'email' => 'roberto.mendoza@nemsu.edu.ph',
        ]);
    }

    /**
     * Test HR Admin can update existing faculty details.
     */
    public function test_hr_admin_can_update_faculty(): void
    {
        $faculty = Faculty::create([
            'department_id' => $this->dcs->id,
            'name' => 'Instructor Old Name',
            'email' => 'old.email@nemsu.edu.ph',
            'employment_status' => 'contractual',
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson("/api/v1/admin/faculty/{$faculty->id}", [
                'name' => 'Instructor New Name',
                'employment_status' => 'permanent',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Instructor New Name',
                    'employment_status' => 'permanent',
                ],
            ]);

        $this->assertDatabaseHas('faculty', [
            'id' => $faculty->id,
            'name' => 'Instructor New Name',
            'employment_status' => 'permanent',
        ]);
    }

    /**
     * Test HR Admin can delete faculty without evaluations.
     */
    public function test_hr_admin_can_delete_unused_faculty(): void
    {
        $faculty = Faculty::create([
            'department_id' => $this->dcs->id,
            'name' => 'Temporary Instructor',
            'email' => 'temp.instructor@nemsu.edu.ph',
            'employment_status' => 'part-time',
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->deleteJson("/api/v1/admin/faculty/{$faculty->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'deactivated' => false,
            ]);

        $this->assertDatabaseMissing('faculty', ['id' => $faculty->id]);
    }

    /**
     * Test non-admin cannot access faculty management endpoints (403 Forbidden).
     */
    public function test_student_cannot_manage_faculty(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->studentToken)
            ->postJson('/api/v1/admin/faculty', [
                'department_id' => $this->dcs->id,
                'name' => 'Unauthorized Faculty',
                'employment_status' => 'permanent',
            ]);

        $response->assertStatus(403);
    }
}
