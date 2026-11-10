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
        Schema::create('evaluation_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('evaluation_sections')->cascadeOnDelete();
            $table->string('item_code')->unique(); // 'a1'..'a6', 'b1'..'b5', 'c1'..'c4'
            $table->text('criterion_text');
            $table->unsignedSmallInteger('display_order')->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_criteria');
    }
};
