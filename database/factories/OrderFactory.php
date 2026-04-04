<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'buyer_id' => \App\Models\User::factory(),
            'tier_id' => \App\Models\Tier::factory(),
            'total_amount' => fake()->numberBetween(10000, 1000000),
            'status' => 'PENDING',
            'nama_pemesan' => fake()->name(),
            'jenis_pesanan' => fake()->randomElement(['awal bulan', 'pertengahan bulan', 'Lembur', 'tambahan bulan ini']),
        ];
    }
}
