<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Pemesanan</title>
    <style>
        body {
            font-family: 'Courier', sans-serif;
            font-size: 10pt;
            margin: 0;
            padding: 0;
        }
        .page {
            page-break-after: always;
            padding: 20px;
        }
        .page:last-child {
            page-break-after: never;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 16pt;
            text-transform: uppercase;
        }
        .branch-info {
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            text-transform: uppercase;
            font-size: 9pt;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 9pt;
        }
        .summary {
            font-weight: bold;
            background-color: #eee;
        }
    </style>
</head>
<body>
    @foreach($groupedOrders as $buyerId => $orders)
        @php
            $firstOrder = $orders->first();
            $branchName = $firstOrder->buyer->branch_name ?? $firstOrder->buyer->username;
        @endphp
        <div class="page">
            <div class="header">
                <h1>Laporan Pemesanan Shosha Mart</h1>
                <div>Filter Jenis: {{ $jenisPesanan ?? 'SEMUA' }}</div>
            </div>

            <div class="branch-info">
                <strong>CABANG:</strong> {{ strtoupper($branchName) }}<br>
                <strong>TANGGAL CETAK:</strong> {{ now()->format('d/m/Y H:i') }}
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="20%">No. Pesanan</th>
                        <th width="15%">Tanggal</th>
                        <th width="20%">Pemesan (User)</th>
                        <th width="15%">Jenis</th>
                        <th width="10%">Item</th>
                        <th width="15%">Total (IDR)</th>
                    </tr>
                </thead>
                <tbody>
                    @php $grandTotal = 0; $totalItems = 0; @endphp
                    @foreach($orders as $index => $order)
                        @php 
                            $grandTotal += $order->total_amount;
                            $totalItems += $order->items_count;
                        @endphp
                        <tr>
                            <td style="text-align: center;">{{ $index + 1 }}</td>
                            <td>{{ $order->order_number }}</td>
                            <td>{{ $order->created_at->format('d/m/Y') }}</td>
                            <td>{{ $order->nama_pemesan }}</td>
                            <td>{{ strtoupper($order->jenis_pesanan) }}</td>
                            <td class="text-right">{{ $order->items_count }}</td>
                            <td class="text-right">{{ number_format($order->total_amount, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="summary">
                        <td colspan="5" class="text-right">TOTAL</td>
                        <td class="text-right">{{ $totalItems }}</td>
                        <td class="text-right">{{ number_format($grandTotal, 0, ',', '.') }}</td>
                    </tr>
                </tfoot>
            </table>

            <div class="footer">
                Dicetak secara sistem oleh Shosha Mart Management System.
            </div>
        </div>
    @endforeach
</body>
</html>
