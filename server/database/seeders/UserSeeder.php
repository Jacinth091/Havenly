<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('en_PH');
        $password = Hash::make('password123');
        $now = now();

        // --- 1. Admin ---
        $adminUserId = DB::table('users')->insertGetId([
            'username' => 'admin',
            'email' => 'admin@havenly.com',
            'password_hash' => $password,
            'role' => 'Admin',
            'is_active' => true,
            'created_at' => $now, 'updated_at' => $now,
        ]);

        DB::table('admins')->insert([
            'user_id' => $adminUserId,
            'first_name' => 'System', 'last_name' => 'Admin',
            'contact_num' => '09170000000',
            'is_active' => true,
            'created_at' => $now, 'updated_at' => $now,
        ]);

        // --- 2. Landlords (5 Accounts) ---
        for ($i = 1; $i <= 5; $i++) {
            $userId = DB::table('users')->insertGetId([
                'username' => "landlord{$i}",
                'email' => "landlord{$i}@example.com",
                'password_hash' => $password,
                'role' => 'Landlord',
                'is_active' => true,
                'created_at' => $now, 'updated_at' => $now,
            ]);

            DB::table('landlords')->insert([
                'user_id' => $userId,
                'first_name' => $faker->firstName,
                'last_name' => $faker->lastName,
                'contact_num' => $faker->mobileNumber,
                'is_active' => true,
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        // --- 3. Tenants (5 Accounts) ---
        for ($i = 1; $i <= 5; $i++) {
            $userId = DB::table('users')->insertGetId([
                'username' => "tenant{$i}",
                'email' => "tenant{$i}@example.com",
                'password_hash' => $password,
                'role' => 'Tenant',
                'is_active' => true,
                'created_at' => $now, 'updated_at' => $now,
            ]);

            DB::table('tenants')->insert([
                'user_id' => $userId,
                'first_name' => $faker->firstName,
                'last_name' => $faker->lastName,
                'contact_num' => $faker->mobileNumber,
                'is_active' => true,
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }
    }
}