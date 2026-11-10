<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * System health and service readiness check.
     */
    public function __invoke(): JsonResponse
    {
        $dbStatus = 'healthy';
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $dbStatus = 'unreachable: ' . $e->getMessage();
        }

        return response()->json([
            'success' => true,
            'message' => 'NEMSU-FEAS API service is operational.',
            'data' => [
                'service' => 'NEMSU-FEAS API',
                'version' => 'v1',
                'environment' => config('app.env'),
                'timestamp' => now()->toIso8601String(),
                'database' => $dbStatus,
            ],
        ]);
    }
}
