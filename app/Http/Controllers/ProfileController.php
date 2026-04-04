<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Update the authenticated user's phone number.
     */
    public function updatePhone(Request $request)
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone,'.$request->user()->id],
            'has_verified_phone' => 'nullable|boolean',
        ], [
            'phone.unique' => 'Nomor WhatsApp ini sudah digunakan oleh akun lain.',
        ]);

        /** @var User $user */
        $user = $request->user();

        $user->update([
            'phone' => $validated['phone'],
            'has_verified_phone' => $request->boolean('has_verified_phone', false),
        ]);

        return back()->with('success', 'Nomor telepon berhasil diperbarui.');
    }
}
