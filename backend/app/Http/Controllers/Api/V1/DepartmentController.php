<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    /**
     * List all institutional departments and colleges.
     */
    public function index(): JsonResponse
    {
        $departments = Department::with(['faculty' => function ($query) {
            $query->where('is_active', true)->orderBy('name');
        }])->get();

        return response()->json([
            'success' => true,
            'data' => DepartmentResource::collection($departments),
        ]);
    }

    /**
     * Get details for a specific department.
     */
    public function show(Department $department): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new DepartmentResource($department->loadMissing('faculty')),
        ]);
    }
}
