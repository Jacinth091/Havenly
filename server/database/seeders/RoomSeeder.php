<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $now = now();

        // Get ALL property IDs so we can add rooms to every single one
        $propertyIds = DB::table('properties')->pluck('property_id')->toArray();

        foreach ($propertyIds as $propId) {
            // Create 10 rooms PER property
            for ($r = 1; $r <= 10; $r++) {
                // Generate logic for room number (e.g. 101, 102...)
                $floor = ceil($r / 4);
                $roomNum = $floor . sprintf('%02d', ($r % 4) + 1);

                DB::table('rooms')->insert([
                    'property_id' => $propId,
                    'room_number' => "Rm-{$roomNum}",
                    'monthly_rent' => $faker->randomElement([5000, 6500, 8000, 10000]),
                    'room_status' => 'Available',
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }
}