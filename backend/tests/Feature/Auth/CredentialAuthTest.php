<?php

namespace Tests\Feature\Auth;

use App\Models\Department;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CredentialAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            DepartmentSeeder::class,
            UserSeeder::class,
        ]);
    }

    /**
     * Test HR admin can log in with institutional email and correct password.
     */
    public function test_hr_admin_can_login_with_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'hr.admin@nemsu.edu.ph',
            'password' => 'NemsuAdmin2024!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Authentication successful.',
                'data' => [
                    'user' => [
                        'email' => 'hr.admin@nemsu.edu.ph',
                        'role' => 'hr_admin',
                        'staff_id' => 'HR-2024-001',
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    /**
     * Test HR admin can log in using their staff ID.
     */
    public function test_hr_admin_can_login_with_staff_id(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'HR-2024-001',
            'password' => 'NemsuAdmin2024!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'hr.admin@nemsu.edu.ph',
                        'role' => 'hr_admin',
                    ],
                ],
            ]);
    }

    /**
     * Test Academic Dean can log in and receives their department details.
     */
    public function test_dean_can_login_with_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'dean.dcs@nemsu.edu.ph',
            'password' => 'NemsuDean2024!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'dean.dcs@nemsu.edu.ph',
                        'role' => 'dean',
                        'department' => [
                            'code' => 'DCS',
                        ],
                    ],
                ],
            ]);
    }

    /**
     * Test invalid password returns HTTP 401.
     */
    public function test_login_fails_with_invalid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'hr.admin@nemsu.edu.ph',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid institutional credentials. Please check your email/staff ID and password.',
            ]);
    }

    /**
     * Test missing fields returns HTTP 422.
     */
    public function test_login_validation_fails_when_fields_missing(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['identifier', 'password']);
    }

    /**
     * Test student can initiate session with institutional NEMSU email.
     */
    public function test_student_can_initiate_session_with_institutional_email(): void
    {
        $response = $this->postJson('/api/v1/auth/student-session', [
            'email' => 'maria.student@nemsu.edu.ph',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'maria.student@nemsu.edu.ph',
                        'role' => 'student',
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    /**
     * Test student session rejects non-institutional email.
     */
    public function test_student_session_rejects_non_institutional_email(): void
    {
        $response = $this->postJson('/api/v1/auth/student-session', [
            'email' => 'random@gmail.com',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test student session rejects administrative account.
     */
    public function test_student_session_rejects_admin_role_account(): void
    {
        $response = $this->postJson('/api/v1/auth/student-session', [
            'email' => 'hr.admin@nemsu.edu.ph',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);
    }
}
