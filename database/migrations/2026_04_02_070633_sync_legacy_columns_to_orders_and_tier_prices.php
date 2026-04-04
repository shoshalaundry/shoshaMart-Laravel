<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('admin_notes')->nullable()->after('rejection_reason');
            $table->string('created_by')->nullable()->after('admin_notes');
            $table->text('buyer_note')->nullable()->after('created_by');
        });

        Schema::table('tier_prices', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['admin_notes', 'created_by', 'buyer_note']);
        });

        Schema::table('tier_prices', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
