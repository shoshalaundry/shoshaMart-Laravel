<?php

/**
 * Firewall-Proof Deployment Webhook for Hostinger
 * This script allows running Artisan commands via HTTP request.
 */

// --- CONFIGURATION ---
$secretToken = 'shosha_deploy_' . bin2hex(random_bytes(16)); // GENERATED TOKEN (User will see this)
// For existing setups, we'll use a secret from environment or hardcoded for now
// IMPORTANT: Change this to a secure random string or use an environment variable
$authToken = 'SHOSHA_MART_DEPLOY_SECRET_XYZ'; 

// --- SECURITY CHECK ---
if (!isset($_GET['token']) || $_GET['token'] !== $authToken) {
    header('HTTP/1.1 403 Forbidden');
    echo "Access Denied. Invalid Token.";
    exit;
}

// --- HELPER FUNCTIONS ---
function runArtisan($command) {
    echo "Running: php artisan $command\n";
    $output = [];
    $returnValue = 0;
    // We use the absolute path to php if possible, or just 'php'
    exec("php artisan $command 2>&1", $output, $returnValue);
    echo implode("\n", $output) . "\n";
    echo "Exit Code: $returnValue\n\n";
    return $returnValue === 0;
}

// --- EXECUTION ---
header('Content-Type: text/plain');
echo "--- SHOSHA MART DEPLOYMENT WEBHOOK ---\n\n";

// 1. Clear Cache
runArtisan('optimize:clear');

// 2. Migration
runArtisan('migrate --force');

// 3. Optimize
runArtisan('optimize');

// 4. Update Public Assets (Manual Copy if needed, similar to SSH script)
echo "Updating public assets...\n";
if (file_exists('../public_html/index.php')) {
    // Copy public files from laravel_core to public_html
    exec("cp -r ./* ../../public_html/ 2>&1", $output, $returnValue);
    echo "Assets Copy status: $returnValue\n";
    
    // Patch index.php root paths
    $indexPath = '../../public_html/index.php';
    if (file_exists($indexPath)) {
        $content = file_get_contents($indexPath);
        $content = str_replace("__DIR__.'/../storage/", "__DIR__.'/../laravel_core/storage/", $content);
        $content = str_replace("__DIR__.'/../vendor/", "__DIR__.'/../laravel_core/vendor/", $content);
        $content = str_replace("__DIR__.'/../bootstrap/", "__DIR__.'/../laravel_core/bootstrap/", $content);
        file_put_contents($indexPath, $content);
        echo "index.php patched successfully.\n";
    }
}

echo "\n--- DEPLOYMENT COMPLETED ---";
