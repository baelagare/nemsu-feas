<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationRubricResource extends JsonResource
{
    /**
     * Transform the rubric collection and rating scales into the evaluation questionnaire structure.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $ratingScales = $this->resource['rating_scales'] ?? [];
        $sections = $this->resource['sections'] ?? [];

        return [
            'rating_scale' => collect($ratingScales)->map(function ($scale) {
                return [
                    'score' => $scale->score,
                    'label' => $scale->label,
                    'description' => $scale->description,
                ];
            })->values(),
            'sections' => collect($sections)->map(function ($section) {
                return [
                    'id' => $section->id,
                    'code' => $section->code,
                    'title' => $section->title,
                    'description' => $section->description,
                    'items' => $section->criteria->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'item_code' => $item->item_code,
                            'text' => $item->criterion_text,
                            'display_order' => $item->display_order,
                        ];
                    })->values(),
                ];
            })->values(),
        ];
    }
}
