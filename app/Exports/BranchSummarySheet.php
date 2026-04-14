<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class BranchSummarySheet implements FromView, ShouldAutoSize, WithTitle
{
    protected $groupedOrders;

    protected $tierName;

    public function __construct($groupedOrders, $tierName = 'SEMUA TIER')
    {
        $this->groupedOrders = $groupedOrders;
        $this->tierName = $tierName;
    }

    public function view(): View
    {
        return view('reports.excel_summary', [
            'groupedOrders' => $this->groupedOrders,
            'tierName' => $this->tierName,
        ]);
    }

    public function title(): string
    {
        return 'RINGKASAN';
    }
}
