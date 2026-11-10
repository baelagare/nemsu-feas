<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_period_id',
        'department_id',
        'faculty_id',
        'course_id',
        'course_code',
        'qualitative_comment',
        'composite_mean',
        'section_a_mean',
        'section_b_mean',
        'section_c_mean',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'composite_mean' => 'float',
            'section_a_mean' => 'float',
            'section_b_mean' => 'float',
            'section_c_mean' => 'float',
            'submitted_at' => 'datetime',
        ];
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(EvaluationRating::class);
    }
}
