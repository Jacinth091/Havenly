<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Clean Database
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        DB::table('transactions')->truncate();
        DB::table('leases')->truncate();
        DB::table('rooms')->truncate();
        DB::table('properties')->truncate();
        DB::table('tenants')->truncate();
        DB::table('landlords')->truncate();
        DB::table('admins')->truncate();
        DB::table('users')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Run Seeders in specific order
        $this->call([
            UserSeeder::class,      // Must be first (creates foreign keys for others)
            PropertySeeder::class,  // Must be second (needs landlords)
            RoomSeeder::class,      // Must be third (needs properties)
        ]);
    }
}