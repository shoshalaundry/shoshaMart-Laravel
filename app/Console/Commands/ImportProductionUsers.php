<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

use App\Models\User;
use Illuminate\Support\Facades\File;

#[Signature('app:import-production-users {file=storage/app/import/production_users.json}')]
#[Description('Import production users from a JSON file with schema mapping.')]
class ImportProductionUsers extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');

        if (!File::exists($filePath)) {
            $this->error("File not found at: {$filePath}");
            return Command::FAILURE;
        }

        $this->info("Reading data from {$filePath}...");
        $json = File::get($filePath);
        $users = json_decode($json, true);

        if (!$users) {
            $this->error("Invalid JSON format.");
            return Command::FAILURE;
        }

        $this->info("Found " . count($users) . " users. Starting import...");
        $bar = $this->output->createProgressBar(count($users));
        $bar->start();

        foreach ($users as $data) {
            User::updateOrCreate(
                ['username' => $data['username']],
                [
                    'id' => $data['id'] ?? (string) \Illuminate\Support\Str::uuid(),
                    'phone' => $data['phone'] ?? null,
                    'password' => $data['password'],
                    'role' => $data['role'] ?? 'BUYER',
                    'tier_id' => $data['tier_id'] ?? null,
                    'branch_name' => $data['branch_name'] ?? null,
                    'created_by' => $data['created_by'] ?? null,
                    'is_active' => $data['is_active'] ?? true,
                    'has_completed_tour' => $data['has_completed_tour'] ?? false,
                    'created_at' => $data['created_at'] ?? now(),
                    'updated_at' => $data['updated_at'] ?? now(),
                ]
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Import completed successfully!");

        return Command::SUCCESS;
    }
}
