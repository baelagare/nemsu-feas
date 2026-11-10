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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('faculty_id')->constrained('faculty')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->string('course_code')->index();
            $table->text('qualitative_comment')->nullable();
            $table->decimal('composite_mean', 4, 2)->default(0.00);
            $table->decimal('section_a_mean', 4, 2)->default(0.00);
            $table->decimal('section_b_mean', 4, 2)->default(0.00);
            $table->decimal('section_c_mean', 4, 2)->default(0.00);
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->index(['academic_period_id', 'faculty_id']);
            $table->index(['academic_period_id', 'department_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
