<?php

namespace App\Services;

use App\Models\Department;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class GoogleAuthService
{
    /**
     * Verify Google ID token and return user and Sanctum access token.
     *
     * @throws HttpException|ValidationException
     */
    public function authenticate(string $idToken): array
    {
        $payload = $this->verifyToken($idToken);

        $email = strtolower(trim($payload['email'] ?? ''));
        $allowedDomain = config('services.google.allowed_domain', 'nemsu.edu.ph');

        // Institutional Domain Constraint: Reject any non-NEMSU email
        if (!str_ends_with($email, '@' . $allowedDomain)) {
            abort(403, "Access restricted. Only verified NEMSU institutional accounts (@{$allowedDomain}) are permitted.");
        }

        $user = $this->findOrCreateUser($payload, $email);

        // Assign Sanctum token abilities based on role
        $abilities = match ($user->role) {
            'hr_admin' => ['*'],
            'dean' => ['reports:view', 'faculty:view-department'],
            default => ['evaluations:submit', 'student:view-status'],
        };

        $token = $user->createToken('nemsu-feas-auth-token', $abilities)->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Verify token via Google OAuth2 tokeninfo endpoint.
     */
    public function verifyToken(string $idToken): array
    {
        $response = Http::timeout(10)
            ->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'id_token' => ['Invalid or expired Google authentication token.'],
            ]);
        }

        $data = $response->json();

        // If a Google Client ID is configured, verify the audience
        $clientId = config('services.google.client_id');
        if ($clientId && isset($data['aud']) && $data['aud'] !== $clientId) {
            throw ValidationException::withMessages([
                'id_token' => ['Google token audience mismatch.'],
            ]);
        }

        return $data;
    }

    /**
     * Find or provision institutional user with designated role.
     */
    protected function findOrCreateUser(array $payload, string $email): User
    {
        $user = User::where('email', $email)->first();

        $name = $payload['name'] ?? explode('@', $email)[0];
        $googleId = $payload['sub'] ?? null;
        $avatar = $payload['picture'] ?? null;

        if ($user) {
            $user->update([
                'name' => $name,
                'google_id' => $googleId ?? $user->google_id,
                'avatar' => $avatar ?? $user->avatar,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);

            return $user;
        }

        // Determine initial role for new user
        $role = 'student';
        $departmentId = null;

        if (str_starts_with($email, 'hr.') || str_starts_with($email, 'admin.')) {
            $role = 'hr_admin';
        } elseif (str_starts_with($email, 'dean.') || str_contains($email, '.dean@')) {
            $role = 'dean';
            foreach (['dcs', 'dbm', 'dit', 'dgtt', 'ccje'] as $code) {
                if (str_contains($email, $code)) {
                    $dept = Department::where('code', strtoupper($code))->first();
                    if ($dept) {
                        $departmentId = $dept->id;
                    }
                    break;
                }
            }
        }

        return User::create([
            'name' => $name,
            'email' => $email,
            'google_id' => $googleId,
            'avatar' => $avatar,
            'role' => $role,
            'department_id' => $departmentId,
            'email_verified_at' => now(),
        ]);
    }
}
