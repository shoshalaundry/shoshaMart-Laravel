<?php

namespace App\Models;

use App\Traits\HasUuid;
use Database\Factories\TierPriceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id', 'product_id', 'tier_id', 'price', 'is_active'])]
class TierPrice extends Model
{
    /** @use HasFactory<TierPriceFactory> */
    use HasFactory, HasUuid;

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function tier()
    {
        return $this->belongsTo(Tier::class);
    }
}
