<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        // Don't truncate here - handled in DatabaseSeeder
        $now = now();
        
        $properties = [
            [
                'landlord_id' => 1,
                'property_name' => 'Sunset Apartments',
                'address' => '123 Main Street',
                'city' => 'Cebu City',
                'total_rooms' => 5,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'landlord_id' => 1,
                'property_name' => 'Green Valley Homes',
                'address' => '456 Oak Avenue',
                'city' => 'Mandaue City',
                'total_rooms' => 3,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'landlord_id' => 2,
                'property_name' => 'Metro Residences',
                'address' => '789 Pine Road',
                'city' => 'Cebu City',
                'total_rooms' => 8,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'landlord_id' => 3,
                'property_name' => 'Urban Lofts',
                'address' => '321 Maple Street',
                'city' => 'Lapu-Lapu City',
                'total_rooms' => 6,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];
        
        DB::table('properties')->insert($properties);
        
        $this->command->info('✅ Properties seeded successfully!');
    }
}