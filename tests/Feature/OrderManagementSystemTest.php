<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Tier;
use App\Models\User;

beforeEach(function () {
    $this->tier = Tier::factory()->create(['name' => 'L24J']);
    $this->superadmin = User::factory()->create(['role' => 'SUPERADMIN']);
    $this->buyer = User::factory()->create([
        'role' => 'BUYER',
        'tier_id' => $this->tier->id,
    ]);
    $this->product = Product::factory()->create(['base_price' => 10000]);
    $this->product->tierPrices()->create([
        'tier_id' => $this->tier->id,
        'price' => 8000,
    ]);
});

test('buyer can create order and items are persisted', function () {
    $response = $this->actingAs($this->buyer)->post(route('orders.store'), [
        'nama_pemesan' => 'Budi Santoso',
        'jenis_pesanan' => 'awal bulan',
        'items' => [
            ['product_id' => $this->product->id, 'quantity' => 2],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    
    $order = Order::first();
    expect($order->total_amount)->toBe(16000);
    expect($order->items)->toHaveCount(1);
    
    $item = $order->items->first();
    expect($item->product_id)->toBe($this->product->id);
    expect($item->price)->toBe(8000);
    expect($item->subtotal)->toBe(16000);
});

test('admin can view orders list', function () {
    Order::factory()->create(['buyer_id' => $this->buyer->id, 'tier_id' => $this->tier->id, 'total_amount' => 1000]);

    $response = $this->actingAs($this->superadmin)->get(route('orders.index'));
    
    $response->assertInertia(fn ($page) => $page
        ->component('orders/index')
        ->has('orders.data')
    );
});

test('admin can view order details via json', function () {
    $order = Order::factory()->create(['buyer_id' => $this->buyer->id, 'tier_id' => $this->tier->id, 'total_amount' => 1000]);
    $order->items()->create([
        'id' => (string) \Illuminate\Support\Str::uuid(),
        'product_id' => $this->product->id,
        'quantity' => 1,
        'price' => 1000,
        'subtotal' => 1000,
    ]);

    $response = $this->actingAs($this->superadmin)->get(route('orders.show', $order->id));
    
    $response->assertJsonPath('id', $order->id);
    $response->assertJsonCount(1, 'items');
});
