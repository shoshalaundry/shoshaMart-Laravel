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
        Schema::table('products', function (Blueprint $table) {
            $table->string('image_url')->nullable()->after('sku');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('nama_pemesan')->after('buyer_id');
            $table->string('jenis_pesanan')->after('nama_pemesan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('image_url');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['nama_pemesan', 'jenis_pesanan']);
        });
    }
};
