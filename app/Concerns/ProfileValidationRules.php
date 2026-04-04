<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>>
     */
    protected function profileRules(string $userId): array
    {
        return [
            'username' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique(User::class)->ignore($userId)
            ],
            'phone' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique(User::class)->ignore($userId)
            ],
        ];
    }
}
