<?php

use App\Exports\OrdersExport;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns a summary sheet as the first sheet', function () {
    // Create two users representing two different branches
    $userA = User::factory()->create(['branch_name' => 'Branch A']);
    $userB = User::factory()->create(['branch_name' => 'Branch B']);

    // Create orders for each branch
    Order::factory()->count(2)->create(['buyer_id' => $userA->id]);
    Order::factory()->count(3)->create(['buyer_id' => $userB->id]);

    $allOrders = Order::all();
    $export = new OrdersExport($allOrders, 'Pest Tier');
    $sheets = $export->sheets();

    // We expect 3 sheets: 1 summary sheet + 2 branch sheets
    expect($sheets)->toHaveCount(3);

    // First sheet should be the summary sheet
    expect($sheets[0]->title())->toBe('RINGKASAN');

    // Remaining sheets should be branch sheets
    expect($sheets[1]->title())->toBe('Branch A');
    expect($sheets[2]->title())->toBe('Branch B');
});
