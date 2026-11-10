<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreCriterionRequest;
use App\Http\Requests\Api\V1\Admin\StoreSectionRequest;
use App\Http\Requests\Api\V1\Admin\UpdateCriterionRequest;
use App\Http\Requests\Api\V1\Admin\UpdateSectionRequest;
use App\Models\EvaluationCriterion;
use App\Models\EvaluationSection;
use Illuminate\Http\JsonResponse;

class AdminRubricController extends Controller
{
    /**
     * List all rubric sections and criteria for administrative management.
     */
    public function index(): JsonResponse
    {
        $sections = EvaluationSection::with(['criteria' => function ($query) {
            $query->orderBy('display_order');
        }])->orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'data' => $sections,
        ]);
    }

    // -------------------------------------------------------------------------
    // Sections Management
    // -------------------------------------------------------------------------

    public function storeSection(StoreSectionRequest $request): JsonResponse
    {
        $section = EvaluationSection::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Evaluation section created successfully.',
            'data' => $section,
        ], 201);
    }

    public function updateSection(UpdateSectionRequest $request, EvaluationSection $section): JsonResponse
    {
        $section->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Evaluation section updated successfully.',
            'data' => $section,
        ]);
    }

    public function destroySection(EvaluationSection $section): JsonResponse
    {
        $section->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation section deleted successfully.',
        ]);
    }

    // -------------------------------------------------------------------------
    // Criteria / Questions Management
    // -------------------------------------------------------------------------

    public function storeCriterion(StoreCriterionRequest $request): JsonResponse
    {
        $criterion = EvaluationCriterion::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Evaluation criterion question created successfully.',
            'data' => $criterion->loadMissing('section'),
        ], 201);
    }

    public function updateCriterion(UpdateCriterionRequest $request, EvaluationCriterion $criterion): JsonResponse
    {
        $criterion->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Evaluation criterion question updated successfully.',
            'data' => $criterion->loadMissing('section'),
        ]);
    }

    public function destroyCriterion(EvaluationCriterion $criterion): JsonResponse
    {
        if ($criterion->ratings()->exists()) {
            $criterion->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Criterion has existing ratings and has been deactivated to preserve evaluation records.',
                'deactivated' => true,
            ]);
        }

        $criterion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation criterion question deleted successfully.',
            'deactivated' => false,
        ]);
    }
}
