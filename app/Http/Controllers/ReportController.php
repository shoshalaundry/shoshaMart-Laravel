<?php

namespace App\Http\Controllers;

use App\Exports\OrdersExport;
use App\Models\Order;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function exportOrders(Request $request)
    {
        $request->validate([
            'format' => 'required|in:pdf,excel',
            'jenis_pesanan' => 'nullable|string',
            'tier_id' => 'nullable|string',
        ]);

        $format = $request->input('format');
        $jenisPesanan = $request->input('jenis_pesanan');
        $tierId = $request->input('tier_id');

        $query = Order::with(['buyer:id,username,branch_name', 'items'])
            ->withCount('items')
            ->where('status', 'APPROVED')
            ->latest();

        if ($jenisPesanan && $jenisPesanan !== 'ALL') {
            $query->where('jenis_pesanan', $jenisPesanan);
        }

        if ($tierId && $tierId !== 'ALL') {
            $query->where('tier_id', $tierId);
        }

        $orders = $query->get();

        if ($orders->isEmpty()) {
            return back()->with('error', 'Tidak ada data pesanan yang ditemukan untuk laporan ini.');
        }

        $filename = "LAPORAN-PESANAN-" . ($jenisPesanan !== 'ALL' ? strtoupper($jenisPesanan) . "-" : "") . now()->format('Y-m-d');

        if ($format === 'pdf') {
            $groupedOrders = $orders->groupBy('buyer_id');
            $pdf = Pdf::loadView('reports.orders', compact('groupedOrders', 'jenisPesanan'));
            $pdf->setPaper('a4', 'portrait');
            return $pdf->stream("{$filename}.pdf");
        }

        return Excel::download(new OrdersExport($orders), "{$filename}.xlsx");
    }
}
