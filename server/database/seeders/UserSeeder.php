<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // DON'T truncate - it causes foreign key errors!
        // Just insert the data
        
        $passwordHash = Hash::make('admin123');
        $now = now();
        
        // ====================
        // 1. SYSTEM ADMIN
        // ====================
        $adminExists = DB::table('users')->where('username', 'admin')->exists();
        
        if (!$adminExists) {
            $adminUserId = DB::table('users')->insertGetId([
                'username' => 'admin',
                'email' => 'admin@havenly.com',
                'password_hash' => $passwordHash,
                'role' => 'Admin',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('admins')->insert([
                'user_id' => $adminUserId,
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'contact_num' => '09171234567',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ====================
        // 2. LANDLORDS
        // ====================
        $landlords = [
            [
                'username' => 'landlord1',
                'email' => 'landlord@example.com',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'middle_name' => 'Reyes',
                'contact_num' => '09181234567',
            ],
            [
                'username' => 'landlord2',
                'email' => 'landlord2@example.com',
                'first_name' => 'John',
                'last_name' => 'Smith',
                'middle_name' => 'Michael',
                'contact_num' => '09191234567',
            ],
            [
                'username' => 'landlord3',
                'email' => 'landlord3@example.com',
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'middle_name' => 'Marie',
                'contact_num' => '09201234567',
            ],
        ];

        foreach ($landlords as $landlord) {
            $userExists = DB::table('users')->where('username', $landlord['username'])->exists();
            
            if (!$userExists) {
                $userId = DB::table('users')->insertGetId([
                    'username' => $landlord['username'],
                    'email' => $landlord['email'],
                    'password_hash' => $passwordHash,
                    'role' => 'Landlord',
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('landlords')->insert([
                    'user_id' => $userId,
                    'first_name' => $landlord['first_name'],
                    'last_name' => $landlord['last_name'],
                    'middle_name' => $landlord['middle_name'],
                    'contact_num' => $landlord['contact_num'],
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // ====================
        // 3. TENANTS
        // ====================
        $tenants = [
            [
                'username' => 'tenant1',
                'email' => 'tenant@example.com',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'middle_name' => 'Santos',
                'contact_num' => '09171234567',
            ],
            [
                'username' => 'tenant2',
                'email' => 'tenant2@example.com',
                'first_name' => 'Maria',
                'last_name' => 'Garcia',
                'middle_name' => 'Lopez',
                'contact_num' => '09181234568',
            ],
            [
                'username' => 'tenant3',
                'email' => 'tenant3@example.com',
                'first_name' => 'Pedro',
                'last_name' => 'Reyes',
                'middle_name' => 'Manuel',
                'contact_num' => '09191234569',
            ],
            [
                'username' => 'tenant4',
                'email' => 'tenant4@example.com',
                'first_name' => 'Ana',
                'last_name' => 'Lim',
                'middle_name' => 'Marie',
                'contact_num' => '09201234570',
            ],
            [
                'username' => 'tenant5',
                'email' => 'tenant5@example.com',
                'first_name' => 'Luis',
                'last_name' => 'Tan',
                'middle_name' => 'Carlos',
                'contact_num' => '09211234571',
            ],
        ];

        foreach ($tenants as $tenant) {
            $userExists = DB::table('users')->where('username', $tenant['username'])->exists();
            
            if (!$userExists) {
                $userId = DB::table('users')->insertGetId([
                    'username' => $tenant['username'],
                    'email' => $tenant['email'],
                    'password_hash' => $passwordHash,
                    'role' => 'Tenant',
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('tenants')->insert([
                    'user_id' => $userId,
                    'first_name' => $tenant['first_name'],
                    'last_name' => $tenant['last_name'],
                    'middle_name' => $tenant['middle_name'],
                    'contact_num' => $tenant['contact_num'],
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        $this->command->info('✅ Users seeded successfully!');
        $this->command->info('👑 Admin Account:');
        $this->command->info('   • Username: admin');
        $this->command->info('   • Email: admin@havenly.com');
        $this->command->info('   • Password: admin123');
        
        $this->command->info('🏠 Landlord Accounts:');
        $this->command->info('   • landlord1 / admin123');
        $this->command->info('   • landlord2 / admin123');
        $this->command->info('   • landlord3 / admin123');
        
        $this->command->info('👤 Tenant Accounts:');
        $this->command->info('   • tenant1 / admin123');
        $this->command->info('   • tenant2 / admin123');
        $this->command->info('   • tenant3 / admin123');
        $this->command->info('   • tenant4 / admin123');
        $this->command->info('   • tenant5 / admin123');
    }
}