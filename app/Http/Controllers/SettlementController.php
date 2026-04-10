<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Settlement;
use App\Models\Tier;
use App\Services\DebtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SettlementController extends Controller
{
    public function __construct(
        protected DebtService $debtService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $selectedTier = $request->input('tier_id');

        // Authorization: Admin Tier only sees branches in their tier, others use filter or null
        $tierId = $user->isSuperAdmin() ? $selectedTier : $user->tier_id;

        $debtSummary = $this->debtService->getDebtSummary($startDate, $endDate, $tierId);

        // Filter settlements based on date and tier
        $settlementsQuery = Settlement::with(['buyer', 'admin', 'verifiedBy'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate]);
            })
            ->when($tierId, fn ($q) => $q->whereHas('buyer', fn ($bq) => $bq->where('tier_id', $tierId)))
            ->when(! $user->isSuperAdmin(), fn ($q) => $q->whereHas('buyer', fn ($bq) => $bq->where('tier_id', $user->tier_id)));

        // Totals for Dashboard Cards (Global / All-time for better visibility)
        // 1. Total Debt (Cross-month outstanding)
        $globalDebtSummary = $this->debtService->getDebtSummary('1970-01-01', '2099-12-31', $tierId);
        $totalGlobalDebt = $globalDebtSummary->sum('orders_sum_total_amount');

        // 2. Settlement Statistics (Filtered by Date Range for consistency with table)
        $totalPendingAmount = (clone $settlementsQuery)->where('status', 'paid')->sum('total_amount');
        $pendingCount = (clone $settlementsQuery)->where('status', 'paid')->count();
        $totalVerifiedAmount = (clone $settlementsQuery)->where('status', 'verified')->sum('total_amount');

        $settlements = $settlementsQuery->latest()->paginate(15);

        return Inertia::render('settlements/index', [
            'debtSummary' => $debtSummary,
            'settlements' => $settlements,
            'stats' => [
                'total_debt' => (float) $totalGlobalDebt,
                'total_pending' => (float) $totalPendingAmount,
                'pending_count' => (int) $pendingCount,
                'total_verified' => (float) $totalVerifiedAmount,
            ],
            'tiers' => $user->isSuperAdmin() ? Tier::select(['id', 'name'])->get() : [],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'tier_id' => $selectedTier,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'buyer_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        try {
            $settlement = $this->debtService->createSettlement(
                $request->user(),
                $validated['buyer_id'],
                $validated['start_date'],
                $validated['end_date'],
                $request->file('proof')
            );

            return back()->with('message', 'Pelunasan berhasil diajukan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function verify(Request $request, Settlement $settlement)
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Hanya Superadmin yang dapat memverifikasi pelunasan.');
        }

        DB::transaction(function () use ($settlement, $request) {
            $settlement->update([
                'status' => 'verified',
                'verified_by' => $request->user()->id,
                'verified_at' => now(),
            ]);

            // Update linked orders to VERIFIED
            Order::where('settlement_id', $settlement->id)
                ->update(['status' => Order::STATUS_VERIFIED]);
        });

        return back()->with('message', 'Pelunasan telah diverifikasi.');
    }

    public function cancel(Request $request, Settlement $settlement)
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Hanya Superadmin yang dapat membatalkan pelunasan.');
        }

        if ($settlement->status !== 'paid') {
            return back()->withErrors(['error' => 'Hanya pelunasan yang berstatus PENDING (Paid) yang dapat dibatalkan.']);
        }

        DB::transaction(function () use ($settlement) {
            // Revert linked orders to APPROVED (Debt) status and clear settlement_id
            Order::where('settlement_id', $settlement->id)->update([
                'status' => Order::STATUS_DEBT,
                'settlement_id' => null,
            ]);

            // Delete the settlement record
            $settlement->delete();
        });

        return back()->with('message', 'Pelunasan telah dibatalkan dan sisa hutang telah dikembalikan.');
    }
}
