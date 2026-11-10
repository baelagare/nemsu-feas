<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreEvaluationRequest;
use App\Http\Resources\Api\V1\EvaluationReceiptResource;
use App\Services\EvaluationService;
use Illuminate\Http\JsonResponse;

class EvaluationSubmissionController extends Controller
{
    /**
     * Store a newly submitted student evaluation.
     */
    public function store(StoreEvaluationRequest $request, EvaluationService $evaluationService): JsonResponse
    {
        $normalizedRatings = $request->normalizeRatings($request->input('ratings'));

        $evaluation = $evaluationService->submitEvaluation(
            $request->user(),
            $request->validated(),
            $normalizedRatings
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation submitted successfully. Thank you for your feedback.',
            'data' => new EvaluationReceiptResource(['evaluation' => $evaluation]),
        ], 201);
    }
}
