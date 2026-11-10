<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->index()->after('email');
            $table->string('avatar')->nullable()->after('google_id');
            $table->enum('role', ['hr_admin', 'dean', 'student'])->default('student')->index()->after('avatar');
            $table->string('staff_id')->nullable()->unique()->after('role');
            $table->string('student_id')->nullable()->unique()->after('staff_id');
            $table->foreignId('department_id')->nullable()->after('student_id')->constrained('departments')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn([
                'google_id',
                'avatar',
                'role',
                'staff_id',
                'student_id',
                'department_id',
            ]);
        });
    }
};
