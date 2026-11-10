<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsFacultyController extends Controller
{
    /**
     * Get individual faculty performance ranking and evaluation statistics.
     */
    public function __invoke(Request $request, AnalyticsService $analyticsService): JsonResponse
    {
        $periodId = $request->query('academic_period_id') ? (int) $request->query('academic_period_id') : null;
        $departmentId = $request->query('department_id') ? (int) $request->query('department_id') : null;
        $search = $request->query('search');

        $roster = $analyticsService->getFacultyRoster($periodId, $departmentId, $search, $request->user());

        return response()->json([
            'success' => true,
            'data' => $roster,
        ]);
    }
}
