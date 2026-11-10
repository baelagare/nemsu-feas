<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\EvaluationRubricResource;
use App\Models\EvaluationSection;
use App\Models\RatingScale;
use Illuminate\Http\JsonResponse;

class EvaluationRubricController extends Controller
{
    /**
     * Get the official SET evaluation questionnaire rubric, sections, criteria, and rating scale.
     */
    public function rubric(): JsonResponse
    {
        $ratingScales = RatingScale::orderBy('score', 'desc')->get();
        $sections = EvaluationSection::with(['criteria' => function ($query) {
            $query->where('is_active', true)->orderBy('display_order');
        }])->orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'data' => new EvaluationRubricResource([
                'rating_scales' => $ratingScales,
                'sections' => $sections,
            ]),
        ]);
    }
}
