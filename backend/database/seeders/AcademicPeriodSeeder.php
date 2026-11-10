<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use Illuminate\Database\Seeder;

class AcademicPeriodSeeder extends Seeder
{
    /**
     * Seed official academic evaluation periods.
     */
    public function run(): void
    {
        AcademicPeriod::updateOrCreate(
            [
                'academic_year' => '2024-2025',
                'semester' => '1st Semester',
            ],
            [
                'status' => 'open',
                'start_date' => '2024-08-15',
                'end_date' => '2024-12-20',
            ]
        );
    }
}
