<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Tier;
use App\Models\User;
use App\Models\Product;
use App\Models\TierPrice;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

#[Signature('app:import-production-complete {file=shoshamart_dump.sql} {--wipe : Truncate tables before import}')]
#[Description('Lossless migration from Production SQLite dump to Local MySQL database.')]
class ImportProductionComplete extends Command
{
    public function handle()
    {
        $filePath = base_path($this->argument('file'));
        $wipe = $this->option('wipe');

        if (!File::exists($filePath)) {
            $this->error("File not found at: {$filePath}");
            return Command::FAILURE;
        }

        $tablesMap = [
            'tiers' => Tier::class,
            'users' => User::class,
            'products' => Product::class,
            'tier_prices' => TierPrice::class,
            'orders' => Order::class,
            'order_items' => OrderItem::class,
        ];

        if ($wipe) {
            $this->warn("Wiping local tables...");
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            foreach ($tablesMap as $tableName => $modelClass) {
                DB::table($tableName)->truncate();
            }
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            $this->info("Local tables wiped successfully.");
        }

        $this->info("Starting Data-Driven Multi-Pass Import (6 passes)...");

        $handle = fopen($filePath, "r");
        foreach ($tablesMap as $tableName => $modelClass) {
            $this->info("Importing: [{$tableName}]...");
            rewind($handle);
            $processedCount = 0;
            $errorCount = 0;

            while (($line = fgets($handle)) !== false) {
                $line = trim($line);
                if (empty($line) || stripos($line, 'INSERT INTO') === false) continue;
                
                // Extremely simple check: line must contain "INSERT INTO" and the table name safely
                // Strategy: Find text between 'INSERT INTO' and 'VALUES'
                $valuesPos = stripos($line, 'VALUES');
                if ($valuesPos === false) continue;
                
                $header = substr($line, 0, $valuesPos);
                $cleanHeader = str_replace(['"', "'", '`'], '', $header);
                
                // If the header contains "tableName" as a whole word
                if (preg_match("/\b" . preg_quote($tableName, '/') . "\b/i", $cleanHeader)) {
                    
                    $openParen = strpos($line, '(', $valuesPos);
                    $closeParen = strrpos($line, ')');
                    
                    if ($openParen !== false && $closeParen !== false) {
                        $valuesStr = substr($line, $openParen + 1, $closeParen - $openParen - 1);
                        $data = $this->parseSqlValues($valuesStr);
                        
                        try {
                            $this->mapAndSave($tableName, $data, $modelClass);
                            $processedCount++;
                        } catch (\Exception $e) {
                            $errorCount++;
                            if ($errorCount < 3) {
                                $this->warn("Error in record {$processedCount} of {$tableName}: " . $e->getMessage());
                            }
                        }
                    }
                }
            }
            $this->comment("Finished {$tableName}. Success: {$processedCount}. Errors: {$errorCount}.");
        }
        fclose($handle);

        $this->newLine();
        $this->info("Master Migration Completed Successfully!");
        
        $this->warn("Updating all user passwords to 'password123'...");
        User::query()->update(['password' => \Illuminate\Support\Facades\Hash::make('password123')]);
        $this->info("Passwords updated.");

        return Command::SUCCESS;
    }

    protected function parseSqlValues($str)
    {
        $values = [];
        $current = '';
        $inString = false;

        for ($i = 0; $i < strlen($str); $i++) {
            $char = $str[$i];

            if ($char === "'") {
                if ($i + 1 < strlen($str) && $str[$i+1] === "'") {
                    $current .= "'";
                    $i++; 
                    continue;
                } else {
                    $inString = !$inString;
                    continue;
                }
            }

            if ($char === "," && !$inString) {
                $values[] = $this->cleanValue($current);
                $current = '';
                continue;
            }

            $current .= $char;
        }
        $values[] = $this->cleanValue($current);

        return $values;
    }

    protected function cleanValue($val)
    {
        $val = trim($val);
        $val = preg_replace('/^\'(.*)\'$/s', '$1', $val);
        if (strtoupper($val) === 'NULL' || $val === 'null') return null;
        return $val;
    }

    protected function mapAndSave($tableName, $data, $modelClass)
    {
        $attributes = [];

        switch ($tableName) {
            case 'tiers': $attributes = ['id' => $data[0], 'name' => $data[1]]; break;
            case 'users':
                $attributes = [
                    'id' => substr($data[0] ?? '', 0, 36),
                    'username' => $data[1],
                    'phone' => $data[2],
                    'password' => $data[3],
                    'role' => $data[4],
                    'tier_id' => $data[5],
                    'branch_name' => $data[6],
                    'created_by' => $data[7],
                    'is_active' => (bool)$data[8],
                    'has_completed_tour' => (bool)$data[9],
                ];
                break;
            case 'products':
                $attributes = [
                    'id' => substr($data[0] ?? '', 0, 36),
                    'name' => $data[1],
                    'sku' => $data[2],
                    'base_price' => (int)$data[3],
                    'image_url' => $data[4],
                    'stock' => (int)$data[5],
                    'unit' => $data[6],
                    'satuan_barang' => $data[6],
                    'created_at' => $this->parseTimestamp($data[7] ?? null),
                    'deleted_at' => $this->parseTimestamp($data[8] ?? null),
                ];
                break;
            case 'tier_prices':
                $attributes = [
                    'id' => substr($data[0] ?? '', 0, 36),
                    'product_id' => $data[1],
                    'tier_id' => $data[2],
                    'price' => (int)$data[3],
                    'is_active' => (bool)$data[4],
                ];
                break;
            case 'orders':
                $attributes = [
                    'id' => substr($data[0] ?? '', 0, 36),
                    'buyer_id' => $data[1],
                    'tier_id' => $data[2],
                    'total_amount' => (int)$data[3],
                    'status' => $data[4],
                    'rejection_reason' => $data[5],
                    'created_at' => $this->parseTimestamp($data[6] ?? null),
                    'admin_notes' => $data[7] ?? null,
                    'created_by' => $data[8] ?? null,
                    'buyer_note' => $data[9] ?? null,
                ];
                break;
            case 'order_items':
                $attributes = [
                    'id' => substr($data[0] ?? '', 0, 36),
                    'order_id' => $data[1],
                    'product_id' => $data[2],
                    'quantity' => (int)$data[3],
                    'price' => (int)$data[4],
                    'price_at_purchase' => (int)$data[4],
                    'subtotal' => (int)$data[3] * (int)$data[4],
                ];
                break;
        }

        if (!empty($attributes)) {
            // For users, we update by username to handle potential ID conflicts in the dump
            if ($tableName === 'users') {
                $modelClass::updateOrCreate(['username' => $attributes['username']], $attributes);
            } else {
                $modelClass::updateOrCreate(['id' => $attributes['id']], $attributes);
            }
        }
    }

    protected function parseTimestamp($value)
    {
        if ($value === null || $value === '' || strtoupper($value) === 'NULL') return null;
        $value = trim($value, "'");
        if ($value === '0') return null;
        if (!is_numeric($value)) return $value;

        if ($value > 100000000000) {
            return Carbon::createFromTimestampMs($value);
        }
        
        return Carbon::createFromTimestamp($value);
    }
}
