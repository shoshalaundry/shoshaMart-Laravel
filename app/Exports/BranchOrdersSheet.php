<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class BranchOrdersSheet implements FromCollection, WithHeadings, WithTitle, WithMapping, ShouldAutoSize
{
    protected $orders;
    protected $branchName;

    public function __construct($orders, $branchName)
    {
        $this->orders = $orders;
        $this->branchName = $branchName;
    }

    public function collection()
    {
        return $this->orders;
    }

    public function title(): string
    {
        return substr($this->branchName, 0, 31);
    }

    public function headings(): array
    {
        return [
            'ID Pesanan',
            'No. Pesanan',
            'Tanggal',
            'Nama Pemesan',
            'Jenis Pesanan',
            'Total Items',
            'Total amount'
        ];
    }

    /**
    * @var \App\Models\Order $order
    */
    public function map($order): array
    {
        return [
            $order->id,
            $order->order_number,
            $order->created_at->format('Y-m-d H:i'),
            $order->nama_pemesan,
            $order->jenis_pesanan,
            $order->items_count,
            $order->total_amount
        ];
    }
}
