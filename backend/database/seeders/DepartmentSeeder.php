<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Seed official academic units of NEMSU - Cantilan Campus.
     */
    public function run(): void
    {
        $departments = [
            [
                'code' => 'DCS',
                'name' => 'Department of Computer Studies',
                'dean_name' => 'Dr. Bryan Christopher Cruz',
                'target_evaluations' => 260,
            ],
            [
                'code' => 'DBM',
                'name' => 'Department of Business and Management',
                'dean_name' => 'Dr. Arthur Pendelton',
                'target_evaluations' => 225,
            ],
            [
                'code' => 'DIT',
                'name' => 'Department of Industrial Technology',
                'dean_name' => 'Engr. Roberto Alcantara',
                'target_evaluations' => 185,
            ],
            [
                'code' => 'DGTT',
                'name' => 'Department of General Teacher Education',
                'dean_name' => 'Dr. Lourdes Mendoza',
                'target_evaluations' => 165,
            ],
            [
                'code' => 'CCJE',
                'name' => 'College of Criminal Justice Education',
                'dean_name' => 'Atty. Ronald B. Dela Cruz',
                'target_evaluations' => 135,
            ],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(['code' => $dept['code']], $dept);
        }
    }
}
