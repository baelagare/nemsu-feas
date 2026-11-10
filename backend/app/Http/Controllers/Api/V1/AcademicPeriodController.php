<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AcademicPeriodResource;
use App\Models\AcademicPeriod;
use Illuminate\Http\JsonResponse;

class AcademicPeriodController extends Controller
{
    /**
     * Get the currently active/open academic period for student evaluations.
     */
    public function active(): JsonResponse
    {
        $period = AcademicPeriod::active()->first();

        if (! $period) {
            return response()->json([
                'success' => false,
                'message' => 'No active academic period found for faculty evaluations.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new AcademicPeriodResource($period),
        ]);
    }

    /**
     * List all academic periods.
     */
    public function index(): JsonResponse
    {
        $periods = AcademicPeriod::orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => AcademicPeriodResource::collection($periods),
        ]);
    }
}
