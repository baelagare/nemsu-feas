<?php

namespace Tests\Feature\Auth;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test Google auth fails when id_token is missing.
     */
    public function test_google_auth_validation_fails_when_id_token_missing(): void
    {
        $response = $this->postJson('/api/v1/auth/google', []);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'The given data was invalid.',
            ])
            ->assertJsonValidationErrors(['id_token']);
    }

    /**
     * Test Google auth fails when Google tokeninfo returns an error.
     */
    public function test_google_auth_fails_when_token_is_invalid(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response(['error' => 'invalid_token'], 400),
        ]);

        $response = $this->postJson('/api/v1/auth/google', [
            'id_token' => 'invalid_token_sample',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ])
            ->assertJsonValidationErrors(['id_token']);
    }

    /**
     * Test non-institutional Google accounts (e.g., @gmail.com) are rejected with 403.
     */
    public function test_google_auth_rejects_non_institutional_email(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'email' => 'random.person@gmail.com',
                'name' => 'Random Person',
                'sub' => '1234567890',
                'picture' => 'https://example.com/avatar.jpg',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/google', [
            'id_token' => 'valid_token_for_gmail',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Access restricted. Only verified NEMSU institutional accounts (@nemsu.edu.ph) are permitted.',
            ]);
    }

    /**
     * Test institutional student is provisioned with student role.
     */
    public function test_google_auth_provisions_student_for_standard_institutional_email(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'email' => 'student.evaluator@nemsu.edu.ph',
                'name' => 'Juan Dela Cruz',
                'sub' => 'google-student-001',
                'picture' => 'https://example.com/juan.jpg',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/google', [
            'id_token' => 'valid_google_id_token',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Authentication successful.',
                'data' => [
                    'user' => [
                        'email' => 'student.evaluator@nemsu.edu.ph',
                        'name' => 'Juan Dela Cruz',
                        'role' => 'student',
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
        $this->assertDatabaseHas('users', [
            'email' => 'student.evaluator@nemsu.edu.ph',
            'role' => 'student',
            'google_id' => 'google-student-001',
        ]);
    }

    /**
     * Test institutional HR accounts are assigned hr_admin role.
     */
    public function test_google_auth_provisions_hr_admin_for_hr_email(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'email' => 'hr.admin@nemsu.edu.ph',
                'name' => 'Dr. Evelyn V. Ramos',
                'sub' => 'google-hr-001',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/google', [
            'id_token' => 'valid_hr_token',
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
     * Test institutional Dean accounts are assigned dean role and linked to department.
     */
    public function test_google_auth_provisions_dean_and_links_department(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'email' => 'dean.dcs@nemsu.edu.ph',
                'name' => 'Dr. Computer Dean',
                'sub' => 'google-dean-001',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/google', [
            'id_token' => 'valid_dean_token',
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
     * Test /api/v1/auth/me returns authenticated user details.
     */
    public function test_auth_me_returns_current_authenticated_user(): void
    {
        $user = User::create([
            'name' => 'HR Analyst',
            'email' => 'hr.staff@nemsu.edu.ph',
            'role' => 'hr_admin',
            'staff_id' => 'HR-2024-04',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'hr.staff@nemsu.edu.ph',
                    'name' => 'HR Analyst',
                    'role' => 'hr_admin',
                    'staff_id' => 'HR-2024-04',
                ],
            ]);
    }

    /**
     * Test /api/v1/auth/logout revokes the active token.
     */
    public function test_auth_logout_revokes_token(): void
    {
        $user = User::create([
            'name' => 'Student User',
            'email' => 'student.user@nemsu.edu.ph',
            'role' => 'student',
        ]);

        $token = $user->createToken('logout-test-token')->plainTextToken;

        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $logoutResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Successfully logged out.',
            ]);

        // Subsequent call with the same token must be unauthorized
        $this->app['auth']->forgetGuards();
        $subsequentResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $subsequentResponse->assertStatus(401);
    }

    /**
     * Test CheckRole middleware allows authorized role and denies unauthorized role with 403.
     */
    public function test_role_middleware_enforces_role_authorization(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin.test@nemsu.edu.ph',
            'role' => 'hr_admin',
        ]);
        $adminToken = $admin->createToken('admin-token')->plainTextToken;

        $student = User::create([
            'name' => 'Student User',
            'email' => 'student.test@nemsu.edu.ph',
            'role' => 'student',
        ]);
        $studentToken = $student->createToken('student-token')->plainTextToken;

        // Admin should be granted access (200)
        $adminResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson('/api/v1/admin/verify-access');

        $adminResponse->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'HR Admin access granted.']);

        // Student should be denied access (403 Forbidden)
        $this->app['auth']->forgetGuards();
        $studentResponse = $this->withHeader('Authorization', 'Bearer ' . $studentToken)
            ->getJson('/api/v1/admin/verify-access');

        $studentResponse->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Forbidden. You do not have permission to access this resource.',
            ]);
    }
}
