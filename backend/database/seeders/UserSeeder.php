<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed official institutional accounts for HR Administration and Academic Deans.
     */
    public function run(): void
    {
        $dcs = Department::where('code', 'DCS')->first();
        $dbm = Department::where('code', 'DBM')->first();

        // 1. HR Administrator Account
        User::updateOrCreate(
            ['email' => 'hr.admin@nemsu.edu.ph'],
            [
                'name' => 'HR Administrator',
                'password' => Hash::make('NemsuAdmin2024!'),
                'role' => 'hr_admin',
                'staff_id' => 'HR-2024-001',
                'department_id' => null,
            ]
        );

        // 2. Academic Dean - DCS (Department of Computer Studies)
        if ($dcs) {
            User::updateOrCreate(
                ['email' => 'dean.dcs@nemsu.edu.ph'],
                [
                    'name' => 'Dr. Bryan Christopher Cruz',
                    'password' => Hash::make('NemsuDean2024!'),
                    'role' => 'dean',
                    'staff_id' => 'DEAN-DCS-001',
                    'department_id' => $dcs->id,
                ]
            );
        }

        // 3. Academic Dean - DBM (Department of Business and Management)
        if ($dbm) {
            User::updateOrCreate(
                ['email' => 'dean.dbm@nemsu.edu.ph'],
                [
                    'name' => 'Dr. Arthur Pendelton',
                    'password' => Hash::make('NemsuDean2024!'),
                    'role' => 'dean',
                    'staff_id' => 'DEAN-DBM-001',
                    'department_id' => $dbm->id,
                ]
            );
        }
    }
}
