<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear all tables in correct order (child first, parent last)
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
        
        // Run seeders
        $this->call([
            UserSeeder::class,
            PropertySeeder::class,
            RoomSeeder::class,
        ]);
    }
}