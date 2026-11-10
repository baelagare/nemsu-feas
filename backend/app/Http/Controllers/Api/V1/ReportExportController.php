<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportController extends Controller
{
    /**
     * Export evaluation records as official CSV spreadsheet report.
     */
    public function __invoke(Request $request, AnalyticsService $analyticsService): StreamedResponse
    {
        $periodId = $request->query('academic_period_id') ? (int) $request->query('academic_period_id') : null;
        $departmentId = $request->query('department_id') ? (int) $request->query('department_id') : null;

        return $analyticsService->exportCsv($periodId, $departmentId, $request->user());
    }
}
