<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationCriterion extends Model
{
    use HasFactory;

    protected $table = 'evaluation_criteria';

    protected $fillable = [
        'section_id',
        'item_code',
        'criterion_text',
        'display_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(EvaluationSection::class, 'section_id');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(EvaluationRating::class, 'criterion_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
