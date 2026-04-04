<?php

namespace App\Models;

use App\Traits\HasUuid;
use Database\Factories\TierFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id', 'name'])]
class Tier extends Model
{
    /** @use HasFactory<TierFactory> */
    use HasFactory, HasUuid;

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'tier_prices')
            ->withPivot('price')
            ->withTimestamps();
    }

    public function tierPrices()
    {
        return $this->hasMany(TierPrice::class);
    }
}
