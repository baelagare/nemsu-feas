<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\FacultyResource;
use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Http\JsonResponse;

class FacultyController extends Controller
{
    /**
     * List all active faculty members across departments.
     */
    public function index(): JsonResponse
    {
        $faculty = Faculty::active()->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => FacultyResource::collection($faculty),
        ]);
    }

    /**
     * List active faculty members belonging to a specific department.
     */
    public function byDepartment(Department $department): JsonResponse
    {
        $faculty = $department->faculty()
            ->active()
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => FacultyResource::collection($faculty),
        ]);
    }
}
