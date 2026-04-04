<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class OrdersExport implements WithMultipleSheets
{
    use Exportable;

    protected $orders;

    public function __construct($orders)
    {
        $this->orders = $orders;
    }

    public function sheets(): array
    {
        $sheets = [];
        $groupedOrders = $this->orders->groupBy('buyer_id');

        foreach ($groupedOrders as $buyerId => $ordersByBranch) {
            $branchName = $ordersByBranch->first()->buyer->branch_name ?? $ordersByBranch->first()->buyer->username;
            $sheets[] = new BranchOrdersSheet($ordersByBranch, $branchName);
        }

        return $sheets;
    }
}
