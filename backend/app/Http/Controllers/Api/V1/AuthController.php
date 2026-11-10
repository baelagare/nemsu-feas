<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\GoogleAuthRequest;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Services\GoogleAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Authenticate institutional user via Email/Staff ID and Password.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $identifier = trim($request->validated('identifier'));
        $password = $request->validated('password');

        $user = User::query()
            ->where(function ($query) use ($identifier) {
                $query->where('email', strtolower($identifier))
                    ->orWhere('staff_id', $identifier)
                    ->orWhere('student_id', $identifier);
            })
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid institutional credentials. Please check your email/staff ID and password.',
            ], 401);
        }

        // Determine token abilities based on role
        $abilities = match ($user->role) {
            'hr_admin' => ['*'],
            'dean' => ['analytics:read', 'reports:export'],
            default => ['evaluations:submit', 'profile:read'],
        };

        $token = $user->createToken('auth-token', $abilities)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Authentication successful.',
            'data' => [
                'token' => $token,
                'user' => new UserResource($user->loadMissing('department')),
            ],
        ]);
    }

    /**
     * Authenticate or register an institutional user via Google ID Token.
     */
    public function google(GoogleAuthRequest $request, GoogleAuthService $authService): JsonResponse
    {
        $result = $authService->authenticate($request->validated('id_token'));

        return response()->json([
            'success' => true,
            'message' => 'Authentication successful.',
            'data' => [
                'token' => $result['token'],
                'user' => new UserResource($result['user']->loadMissing('department')),
            ],
        ]);
    }

    /**
     * Get the authenticated user's profile and permissions.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($request->user()->loadMissing('department')),
        ]);
    }

    /**
     * Revoke the current access token and sign out.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }
}
