<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with official NEMSU institutional reference data.
     */
    public function run(): void
    {
        $this->call([
            AcademicPeriodSeeder::class,
            DepartmentSeeder::class,
            FacultyAndCourseSeeder::class,
            EvaluationRubricSeeder::class,
            UserSeeder::class,
        ]);
    }
}
