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
        Schema::create('student_submission_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->string('student_id_hash', 64)->index(); // SHA-256 of student identifier for anonymous single-entry enforcement (RA 10173)
            $table->foreignId('faculty_id')->constrained('faculty')->cascadeOnDelete();
            $table->string('course_code');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->unique(
                ['academic_period_id', 'student_id_hash', 'faculty_id', 'course_code'],
                'ssl_period_hash_fac_crs_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_submission_ledger');
    }
};
