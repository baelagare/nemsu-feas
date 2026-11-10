<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSubmissionLedger extends Model
{
    use HasFactory;

    protected $table = 'student_submission_ledger';

    protected $fillable = [
        'academic_period_id',
        'student_id_hash',
        'faculty_id',
        'course_code',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    /**
     * Generate an anonymous hash for a student email
     * to enforce single-entry while guaranteeing privacy (RA 10173).
     */
    public static function generateHash(string $identifier): string
    {
        $salt = config('app.key') ?: 'nemsu-feas-institutional-salt';
        return hash('sha256', strtolower(trim($identifier)) . '|' . $salt);
    }
}
