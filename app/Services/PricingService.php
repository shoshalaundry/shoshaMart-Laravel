<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Tier;

class PricingService
{
    /**
     * Get the price for an eager-loaded product and tier.
     * Falls back to base_price if no tier price is defined.
     */
    public function getPriceForTier(Product $product, ?string $tierId): int|float
    {
        if (! $tierId) {
            return $product->base_price;
        }

        // Must use eager loaded relation 'tierPrices' instead of builder 'tierPrices()'
        $tierPrice = $product->tierPrices->firstWhere('tier_id', $tierId);

        return $tierPrice ? $tierPrice->price : $product->base_price;
    }

    /**
     * Calculate total order amount based on dynamic tier prices.
     * $items: [['product_id' => '...', 'quantity' => 1], ...]
     */
    public function calculateTotal(array $items, ?string $tierId): int|float
    {
        $total = 0;
        $productIds = collect($items)->pluck('product_id')->unique()->toArray();

        // Eager load everything at once to prevent N+1 queries
        $products = Product::with(['tierPrices' => function ($query) use ($tierId) {
            if ($tierId) {
                $query->where('tier_id', $tierId);
            }
        }])->whereIn('id', $productIds)->get()->keyBy('id');

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);

            if ($product) {
                // Since it's eager loaded with the specific tierId, we can just grab it
                $price = $this->getPriceForTier($product, $tierId);
                $total += $price * ($item['quantity'] ?? 1);
            }
        }

        return $total;
    }
}
