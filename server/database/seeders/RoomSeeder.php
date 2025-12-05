<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        // DON'T truncate - it causes foreign key errors!
        // Instead, check if rooms already exist before inserting
        
        $now = now();
        
        $rooms = [
            // Property 1: Sunset Apartments
            ['property_id' => 1, 'room_number' => '101', 'monthly_rent' => 5000.00, 'room_status' => 'Available', 'is_active' => true],
            ['property_id' => 1, 'room_number' => '102', 'monthly_rent' => 5500.00, 'room_status' => 'Available', 'is_active' => true],
            ['property_id' => 1, 'room_number' => '103', 'monthly_rent' => 6000.00, 'room_status' => 'Occupied', 'is_active' => true],
            ['property_id' => 1, 'room_number' => '201', 'monthly_rent' => 5000.00, 'room_status' => 'Available', 'is_active' => true],
            ['property_id' => 1, 'room_number' => '202', 'monthly_rent' => 5500.00, 'room_status' => 'Occupied', 'is_active' => true],
            
            // Property 2: Green Valley Homes
            ['property_id' => 2, 'room_number' => 'G1', 'monthly_rent' => 4500.00, 'room_status' => 'Available', 'is_active' => true],
            ['property_id' => 2, 'room_number' => 'G2', 'monthly_rent' => 4800.00, 'room_status' => 'Maintenance', 'is_active' => true],
            ['property_id' => 2, 'room_number' => 'G3', 'monthly_rent' => 5200.00, 'room_status' => 'Available', 'is_active' => true],
            
            // Property 3: Metro Residences
            ['property_id' => 3, 'room_number' => '301', 'monthly_rent' => 7000.00, 'room_status' => 'Available', 'is_active' => true],
            ['property_id' => 3, 'room_number' => '302', 'monthly_rent' => 7500.00, 'room_status' => 'Available', 'is_active' => true],
            ['property_id' => 3, 'room_number' => '303', 'monthly_rent' => 8000.00, 'room_status' => 'Available', 'is_active' => true],
            
            // Property 4: Urban Lofts
            ['property_id' => 4, 'room_number' => 'A1', 'monthly_rent' => 8500.00, 'room_status' => 'Available', 'is_active' => true],
            ['property_id' => 4, 'room_number' => 'A2', 'monthly_rent' => 9000.00, 'room_status' => 'Available', 'is_active' => true],
        ];
        
        foreach ($rooms as $room) {
            // Check if room already exists (by property_id and room_number)
            $exists = DB::table('rooms')
                ->where('property_id', $room['property_id'])
                ->where('room_number', $room['room_number'])
                ->exists();
            
            if (!$exists) {
                DB::table('rooms')->insert([
                    'property_id' => $room['property_id'],
                    'room_number' => $room['room_number'],
                    'monthly_rent' => $room['monthly_rent'],
                    'room_status' => $room['room_status'],
                    'is_active' => $room['is_active'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
        
        $this->command->info('✅ Rooms seeded successfully!');
    }
}