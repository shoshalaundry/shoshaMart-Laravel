<?php

use App\Models\Order;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tierA = Tier::create(['name' => 'Tier A']);
    $this->tierB = Tier::create(['name' => 'Tier B']);

    $this->superadmin = User::factory()->create(['role' => 'SUPERADMIN']);

    $this->adminA = User::factory()->create([
        'role' => 'ADMIN_TIER',
        'tier_id' => $this->tierA->id,
    ]);

    $this->adminB = User::factory()->create([
        'role' => 'ADMIN_TIER',
        'tier_id' => $this->tierB->id,
    ]);

    $this->buyerA = User::factory()->create([
        'role' => 'BUYER',
        'tier_id' => $this->tierA->id,
    ]);

    $this->buyerB = User::factory()->create([
        'role' => 'BUYER',
        'tier_id' => $this->tierB->id,
    ]);

    $this->orderA = Order::create([
        'buyer_id' => $this->buyerA->id,
        'tier_id' => $this->tierA->id,
        'order_number' => 'ORD-A',
        'nama_pemesan' => 'Pemesan A',
        'jenis_pesanan' => 'REGULER',
        'total_amount' => 100000,
        'status' => 'PENDING',
    ]);

    $this->orderB = Order::create([
        'buyer_id' => $this->buyerB->id,
        'tier_id' => $this->tierB->id,
        'order_number' => 'ORD-B',
        'nama_pemesan' => 'Pemesan B',
        'jenis_pesanan' => 'REGULER',
        'total_amount' => 200000,
        'status' => 'PENDING',
    ]);
});

test('ADMIN_TIER can approve orders in their own tier', function () {
    $this->actingAs($this->adminA)
        ->post(route('orders.approve', $this->orderA->id))
        ->assertRedirect();

    expect($this->orderA->fresh()->status)->toBe('APPROVED');
});

test('ADMIN_TIER cannot approve orders in other tiers', function () {
    $this->actingAs($this->adminA)
        ->post(route('orders.approve', $this->orderB->id))
        ->assertForbidden();

    expect($this->orderB->fresh()->status)->toBe('PENDING');
});

test('SUPERADMIN can approve orders in any tier', function () {
    $this->actingAs($this->superadmin)
        ->post(route('orders.approve', $this->orderA->id))
        ->assertRedirect();

    $this->actingAs($this->superadmin)
        ->post(route('orders.approve', $this->orderB->id))
        ->assertRedirect();

    expect($this->orderA->fresh()->status)->toBe('APPROVED');
    expect($this->orderB->fresh()->status)->toBe('APPROVED');
});

test('ADMIN_TIER without a tier cannot approve any orders', function () {
    $adminNoTier = User::factory()->create([
        'role' => 'ADMIN_TIER',
        'tier_id' => null,
    ]);

    $this->actingAs($adminNoTier)
        ->post(route('orders.approve', $this->orderA->id))
        ->assertForbidden();

    expect($this->orderA->fresh()->status)->toBe('PENDING');
});

test('ADMIN_TIER can see only orders in their tier', function () {
    // Admin A should see Order A but not Order B
    $response = $this->actingAs($this->adminA)->get(route('orders.index'));

    $orders = $response->viewData('page')['props']['orders']['data'];
    $orderIds = collect($orders)->pluck('id')->toArray();

    expect($orderIds)->toContain($this->orderA->id);
    expect($orderIds)->not->toContain($this->orderB->id);
});

test('SUPERADMIN can see all orders', function () {
    $response = $this->actingAs($this->superadmin)->get(route('orders.index'));

    $orders = $response->viewData('page')['props']['orders']['data'];
    $orderIds = collect($orders)->pluck('id')->toArray();

    expect($orderIds)->toContain($this->orderA->id);
    expect($orderIds)->toContain($this->orderB->id);
});
