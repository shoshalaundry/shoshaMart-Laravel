<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $isSuperAdmin = $user?->isSuperAdmin();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'image_url' => $this->image_url,
            'satuan_barang' => $this->satuan_barang,
            'stock' => $this->stock,
            'base_price' => $this->when($isSuperAdmin, $this->base_price),
            'display_price' => $this->display_price, // Assumes this is appended or calculated before
            'tier_prices' => $this->when($isSuperAdmin, $this->tierPrices),
        ];
    }
}
