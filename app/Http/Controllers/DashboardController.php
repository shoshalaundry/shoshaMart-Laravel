<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Base query for orders based on role
        $query = Order::query();

        if ($user->role === 'ADMIN_TIER') {
            if (empty($user->tier_id)) {
                $query->whereRaw('1 = 0');
            } else {
                $query->where('tier_id', $user->tier_id);
            }
        } elseif ($user->role === 'BUYER') {
            // Buyers only see their own dashboard (already logic is separate but for safety)
            $query->where('buyer_id', $user->id);

            return Inertia::render('dashboard', [
                'stats' => [
                    ['title' => 'Pesanan Saya', 'value' => $user->orders()->count(), 'icon' => 'package', 'color' => 'text-blue-600'],
                    ['title' => 'Tier Saya', 'value' => $user->tier->name ?? 'None', 'icon' => 'trending-up', 'color' => 'text-emerald-600'],
                    ['title' => 'Cabang', 'value' => $user->branch_name ?? 'Pusat', 'icon' => 'layout-dashboard', 'color' => 'text-amber-600'],
                ],
                'recentActivity' => $user->orders()->latest()->take(5)->get(),
                'filters' => [
                    'branch_name' => '',
                    'jenis_pesanan' => '',
                    'status' => '',
                ],
                'options' => [
                    'branches' => [],
                    'types' => [],
                    'statuses' => [],
                ],
            ]);
        }

        // --- FILTERING ---
        if ($request->filled('branch_name')) {
            $query->whereHas('buyer', function ($q) use ($request) {
                $q->where('branch_name', $request->branch_name);
            });
        }

        if ($request->filled('jenis_pesanan')) {
            $query->where('jenis_pesanan', $request->jenis_pesanan);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // --- STATISTICS ---
        $stats = [
            [
                'title' => 'Total Pesanan',
                'value' => (clone $query)->count(),
                'icon' => 'shopping-bag',
                'color' => 'text-blue-600',
            ],
            [
                'title' => 'Total Penjualan',
                'value' => 'Rp '.number_format((clone $query)->sum('total_amount'), 0, ',', '.'),
                'icon' => 'trending-up',
                'color' => 'text-emerald-600',
            ],
            [
                'title' => 'Pending',
                'value' => (clone $query)->where('status', 'PENDING')->count(),
                'icon' => 'clock',
                'color' => 'text-amber-600',
            ],
        ];

        // --- CHART DATA (Last 30 Days) ---
        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $chartData[] = [
                'name' => now()->subDays($i)->isoFormat('DD MMM'),
                'total' => (clone $query)->whereDate('created_at', $date)->sum('total_amount'),
            ];
        }

        // --- FILTER OPTIONS ---
        $branchQuery = User::where('role', 'BUYER');
        if ($user->role === 'ADMIN_TIER') {
            $branchQuery->where('tier_id', $user->tier_id);
        }
        $availableBranches = $branchQuery->whereNotNull('branch_name')
            ->where('branch_name', '!=', '')
            ->distinct()
            ->pluck('branch_name');

        $typeQuery = Order::query();
        if ($user->role === 'ADMIN_TIER') {
            $typeQuery->where('tier_id', $user->tier_id);
        }
        $availableTypes = $typeQuery->where('jenis_pesanan', '!=', '')
            ->whereNotNull('jenis_pesanan')
            ->distinct()
            ->pluck('jenis_pesanan');

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentActivity' => (clone $query)->with('buyer')->latest()->take(5)->get(),
            'chartData' => $chartData,
            'filters' => [
                'branch_name' => $request->branch_name,
                'jenis_pesanan' => $request->jenis_pesanan,
                'status' => $request->status,
            ],
            'options' => [
                'branches' => $availableBranches,
                'types' => $availableTypes,
                'statuses' => ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
            ],
        ]);
    }
}
