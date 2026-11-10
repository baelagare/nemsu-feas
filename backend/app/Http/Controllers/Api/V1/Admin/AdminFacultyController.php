<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreFacultyRequest;
use App\Http\Requests\Api\V1\Admin\UpdateFacultyRequest;
use App\Http\Resources\Api\V1\FacultyResource;
use App\Models\Faculty;
use Illuminate\Http\JsonResponse;

class AdminFacultyController extends Controller
{
    /**
     * Create a new faculty member.
     */
    public function store(StoreFacultyRequest $request): JsonResponse
    {
        $faculty = Faculty::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Faculty member successfully added.',
            'data' => new FacultyResource($faculty->loadMissing('department')),
        ], 201);
    }

    /**
     * Update an existing faculty member.
     */
    public function update(UpdateFacultyRequest $request, Faculty $faculty): JsonResponse
    {
        $faculty->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Faculty member successfully updated.',
            'data' => new FacultyResource($faculty->loadMissing('department')),
        ]);
    }

    /**
     * Remove or safely deactivate a faculty member.
     */
    public function destroy(Faculty $faculty): JsonResponse
    {
        if ($faculty->evaluations()->exists()) {
            $faculty->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Faculty member has existing student evaluation records and has been deactivated rather than deleted to preserve audit integrity.',
                'deactivated' => true,
            ]);
        }

        $faculty->delete();

        return response()->json([
            'success' => true,
            'message' => 'Faculty member successfully deleted.',
            'deactivated' => false,
        ]);
    }
}
