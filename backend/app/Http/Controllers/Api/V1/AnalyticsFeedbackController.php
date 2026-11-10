<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsFeedbackController extends Controller
{
    /**
     * Get qualitative comments and feedback remarks from student evaluations.
     */
    public function __invoke(Request $request, AnalyticsService $analyticsService): JsonResponse
    {
        $periodId = $request->query('academic_period_id') ? (int) $request->query('academic_period_id') : null;
        $departmentId = $request->query('department_id') ? (int) $request->query('department_id') : null;
        $facultyId = $request->query('faculty_id') ? (int) $request->query('faculty_id') : null;
        $search = $request->query('search');

        $feed = $analyticsService->getFeedbackFeed($periodId, $departmentId, $facultyId, $search, $request->user());

        return response()->json([
            'success' => true,
            'data' => $feed['data'],
            'pagination' => $feed['pagination'],
        ]);
    }
}
