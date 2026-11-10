<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'dean_name' => $this->dean_name,
            'target_evaluations' => $this->target_evaluations,
            'faculty' => FacultyResource::collection($this->whenLoaded('faculty')),
        ];
    }
}
