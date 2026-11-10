<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Database\Seeder;

class FacultyAndCourseSeeder extends Seeder
{
    /**
     * Seed official faculty members and course offerings across departments.
     */
    public function run(): void
    {
        $dcs = Department::where('code', 'DCS')->first();
        $dbm = Department::where('code', 'DBM')->first();
        $dit = Department::where('code', 'DIT')->first();
        $dgtt = Department::where('code', 'DGTT')->first();
        $ccje = Department::where('code', 'CCJE')->first();

        $roster = [
            // Department of Computer Studies (DCS)
            [
                'dept' => $dcs,
                'faculty' => [
                    ['name' => 'Engr. Maria Santos', 'email' => 'maria.santos@nemsu.edu.ph', 'employment_status' => 'permanent'],
                    ['name' => 'Prof. Alexander Cruz', 'email' => 'alexander.cruz@nemsu.edu.ph', 'employment_status' => 'permanent'],
                    ['name' => 'Dr. Jane Doe', 'email' => 'jane.doe@nemsu.edu.ph', 'employment_status' => 'permanent'],
                    ['name' => 'Prof. Juan dela Cruz', 'email' => 'juan.delacruz@nemsu.edu.ph', 'employment_status' => 'part-time'],
                ],
                'courses' => [
                    ['code' => 'CS 101', 'name' => 'Introduction to Computing'],
                    ['code' => 'IT 211', 'name' => 'Data Structures and Algorithms'],
                    ['code' => 'CS 301', 'name' => 'Operating Systems & Architecture'],
                    ['code' => 'IT 312', 'name' => 'Web Systems and Technologies'],
                ],
            ],
            // Department of Business and Management (DBM)
            [
                'dept' => $dbm,
                'faculty' => [
                    ['name' => 'Dr. Arthur Pendelton', 'email' => 'arthur.pendelton@nemsu.edu.ph', 'employment_status' => 'permanent'],
                    ['name' => 'Prof. Karen Miller', 'email' => 'karen.miller@nemsu.edu.ph', 'employment_status' => 'permanent'],
                ],
                'courses' => [
                    ['code' => 'BA 101', 'name' => 'Principles of Management'],
                    ['code' => 'ACC 201', 'name' => 'Financial Accounting'],
                ],
            ],
            // Department of Industrial Technology (DIT)
            [
                'dept' => $dit,
                'faculty' => [
                    ['name' => 'Engr. Roberto Alcantara', 'email' => 'roberto.alcantara@nemsu.edu.ph', 'employment_status' => 'permanent'],
                    ['name' => 'Prof. Mark Johnson', 'email' => 'mark.johnson@nemsu.edu.ph', 'employment_status' => 'permanent'],
                ],
                'courses' => [
                    ['code' => 'ITEC 110', 'name' => 'Industrial Safety & Ethics'],
                    ['code' => 'ET 202', 'name' => 'Electronics Circuit Analysis'],
                ],
            ],
            // Department of General Teacher Education (DGTT)
            [
                'dept' => $dgtt,
                'faculty' => [
                    ['name' => 'Dr. Lourdes Mendoza', 'email' => 'lourdes.mendoza@nemsu.edu.ph', 'employment_status' => 'permanent'],
                    ['name' => 'Prof. Cherry Garcia', 'email' => 'cherry.garcia@nemsu.edu.ph', 'employment_status' => 'permanent'],
                ],
                'courses' => [
                    ['code' => 'ED 101', 'name' => 'The Child and Adolescent Learner'],
                    ['code' => 'ED 205', 'name' => 'Assessment in Learning 1'],
                ],
            ],
            // College of Criminal Justice Education (CCJE)
            [
                'dept' => $ccje,
                'faculty' => [
                    ['name' => 'Atty. Ronald B. Dela Cruz', 'email' => 'ronald.delacruz@nemsu.edu.ph', 'employment_status' => 'permanent'],
                    ['name' => 'Prof. Dennis Torres', 'email' => 'dennis.torres@nemsu.edu.ph', 'employment_status' => 'permanent'],
                ],
                'courses' => [
                    ['code' => 'CRIM 101', 'name' => 'Introduction to Criminology'],
                    ['code' => 'LEA 201', 'name' => 'Law Enforcement Operations and Planning'],
                ],
            ],
        ];

        foreach ($roster as $group) {
            if (! $group['dept']) {
                continue;
            }

            foreach ($group['faculty'] as $fac) {
                Faculty::updateOrCreate(
                    ['email' => $fac['email']],
                    [
                        'department_id' => $group['dept']->id,
                        'name' => $fac['name'],
                        'employment_status' => $fac['employment_status'],
                        'is_active' => true,
                    ]
                );
            }

            foreach ($group['courses'] as $course) {
                Course::updateOrCreate(
                    ['department_id' => $group['dept']->id, 'code' => $course['code']],
                    [
                        'title' => $course['name'],
                    ]
                );
            }
        }
    }
}
