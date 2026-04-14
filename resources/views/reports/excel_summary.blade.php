<table>
    <thead>
        <tr>
            <th colspan="3" style="font-weight: bold; font-size: 14pt; text-align: center;">RINGKASAN PENGADAAN PER CABANG</th>
        </tr>
        <tr>
            <th colspan="3" style="font-weight: bold; text-align: center;">SHOSHA MART</th>
        </tr>
        <tr>
            <th colspan="3" style="font-weight: bold; text-align: center;">TIER: {{ strtoupper($tierName ?? 'SEMUA TIER') }}</th>
        </tr>
        <tr></tr>
        <tr style="background-color: #f2f2f2;">
            <th style="font-weight: bold; width: 10px; border: thin solid #000; text-align: center;">No</th>
            <th style="font-weight: bold; width: 40px; border: thin solid #000; text-align: center;">Nama Cabang</th>
            <th style="font-weight: bold; width: 25px; border: thin solid #000; text-align: center;">Total Tagihan</th>
        </tr>
    </thead>
    <tbody>
        @php $grandTotalAllBranches = 0; @endphp
        @foreach($groupedOrders as $buyerId => $orders)
            @php 
                $branchName = $orders->first()->buyer->branch_name ?? $orders->first()->buyer->username;
                $branchTotal = $orders->sum('total_amount');
                $grandTotalAllBranches += $branchTotal;
            @endphp
            <tr>
                <td style="text-align: center; border: thin solid #000;">{{ $loop->iteration }}</td>
                <td style="border: thin solid #000;">{{ strtoupper($branchName) }}</td>
                <td style="text-align: right; border: thin solid #000;">Rp. {{ number_format($branchTotal, 0, ',', '.') }}</td>
            </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr style="background-color: #eeeeee;">
            <td colspan="2" style="font-weight: bold; text-align: right; border: thin solid #000;">TOTAL KESELURUHAN</td>
            <td style="font-weight: bold; text-align: right; border: thin solid #000;">Rp. {{ number_format($grandTotalAllBranches, 0, ',', '.') }}</td>
        </tr>
    </tfoot>
</table>
