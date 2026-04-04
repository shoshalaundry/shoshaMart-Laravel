<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Request::create('/login', 'POST', [
    'username' => 'buyer',
    'password' => 'password',
]);

// Since we are running in CLI, we might need to bypass CSRF if we want to test logic.
// But it's better to check if Auth::attempt works.

$app->boot();

if (Auth::attempt(['username' => 'buyer', 'password' => 'password'])) {
    echo "Auth Attempt: Success\n";
    echo "User role: " . Auth::user()->role . "\n";
} else {
    echo "Auth Attempt: Failed\n";
}
