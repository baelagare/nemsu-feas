<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'display_order',
    ];

    public function criteria(): HasMany
    {
        return $this->hasMany(EvaluationCriterion::class, 'section_id')->orderBy('display_order');
    }
}
