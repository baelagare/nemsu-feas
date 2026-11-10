<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsOverviewController extends Controller
{
    /**
     * Get system-wide or department-scoped high-level KPIs.
     */
    public function __invoke(Request $request, AnalyticsService $analyticsService): JsonResponse
    {
        $periodId = $request->query('academic_period_id') ? (int) $request->query('academic_period_id') : null;

        $overview = $analyticsService->getOverview($periodId, $request->user());

        return response()->json([
            'success' => true,
            'data' => $overview,
        ]);
    }
}
