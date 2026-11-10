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
        Schema::create('rating_scales', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('score')->unique(); // 5, 4, 3, 2, 1
            $table->string('label');
            $table->text('description');
            $table->unsignedTinyInteger('display_order')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rating_scales');
    }
};
