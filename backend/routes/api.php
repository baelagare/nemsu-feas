<?php

use App\Http\Controllers\Api\V1\AcademicPeriodController;
use App\Http\Controllers\Api\V1\Admin\AdminFacultyController;
use App\Http\Controllers\Api\V1\Admin\AdminRubricController;
use App\Http\Controllers\Api\V1\AnalyticsDepartmentController;
use App\Http\Controllers\Api\V1\AnalyticsFacultyController;
use App\Http\Controllers\Api\V1\AnalyticsFeedbackController;
use App\Http\Controllers\Api\V1\AnalyticsOverviewController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\EvaluationRubricController;
use App\Http\Controllers\Api\V1\EvaluationSubmissionController;
use App\Http\Controllers\Api\V1\FacultyController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\ReportExportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Health check endpoint
    Route::get('/health', HealthController::class);

    // Authentication (Institutional Login, Google Sign-In & Student Session)
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/google', [AuthController::class, 'google']);
        Route::post('/student-session', [AuthController::class, 'studentSession']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Standard alias for authenticated user profile
    Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'me']);

    // Academic Periods
    Route::get('/academic-periods/active', [AcademicPeriodController::class, 'active']);
    Route::get('/academic-periods', [AcademicPeriodController::class, 'index']);

    // Departments & Faculty Directory
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{department}', [DepartmentController::class, 'show']);
    Route::get('/departments/{department}/faculty', [FacultyController::class, 'byDepartment']);
    Route::get('/faculty', [FacultyController::class, 'index']);

    // Evaluation Instrument Rubric
    Route::get('/evaluations/rubric', [EvaluationRubricController::class, 'rubric']);

    // Student Evaluation Submission (Authenticated institutional student)
    Route::middleware(['auth:sanctum', 'role:student'])->group(function () {
        Route::post('/evaluations', [EvaluationSubmissionController::class, 'store']);
    });

    // Administrative Analytics & Reports (HR Admin & Academic Deans)
    Route::middleware(['auth:sanctum', 'role:hr_admin,dean'])->group(function () {
        Route::prefix('analytics')->group(function () {
            Route::get('/overview', AnalyticsOverviewController::class);
            Route::get('/departments', AnalyticsDepartmentController::class);
            Route::get('/faculty', AnalyticsFacultyController::class);
            Route::get('/feedback', AnalyticsFeedbackController::class);
        });

        Route::prefix('reports')->group(function () {
            Route::get('/export', ReportExportController::class);
        });
    });

    // HR Administrative Management (Faculty & Evaluation Instrument CRUD)
    Route::middleware(['auth:sanctum', 'role:hr_admin'])->prefix('admin')->group(function () {
        // Faculty Management
        Route::post('/faculty', [AdminFacultyController::class, 'store']);
        Route::put('/faculty/{faculty}', [AdminFacultyController::class, 'update']);
        Route::delete('/faculty/{faculty}', [AdminFacultyController::class, 'destroy']);

        // Evaluation Form Rubric Management (Sections & Criteria/Questions)
        Route::get('/rubric', [AdminRubricController::class, 'index']);
        Route::post('/rubric/sections', [AdminRubricController::class, 'storeSection']);
        Route::put('/rubric/sections/{section}', [AdminRubricController::class, 'updateSection']);
        Route::delete('/rubric/sections/{section}', [AdminRubricController::class, 'destroySection']);

        Route::post('/rubric/criteria', [AdminRubricController::class, 'storeCriterion']);
        Route::put('/rubric/criteria/{criterion}', [AdminRubricController::class, 'updateCriterion']);
        Route::delete('/rubric/criteria/{criterion}', [AdminRubricController::class, 'destroyCriterion']);
    });

    // Test route for role-based access verification
    Route::middleware(['auth:sanctum', 'role:hr_admin'])->get('/admin/verify-access', function () {
        return response()->json([
            'success' => true,
            'message' => 'HR Admin access granted.',
        ]);
    });
});
