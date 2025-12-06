<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('en_PH');
        $now = now();
        $cities = ['Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Talisay City'];

        // Get all valid Landlord IDs from the database
        $landlordIds = DB::table('landlords')->pluck('landlord_id')->toArray();

        // Create 20 Properties
        for ($i = 1; $i <= 20; $i++) {
            DB::table('properties')->insert([
                'landlord_id' => $faker->randomElement($landlordIds),
                'property_name' => $faker->company . ' Residences',
                'address' => $faker->streetAddress,
                'city' => $faker->randomElement($cities),
                'total_rooms' => 10, // Hardcoded as per your requirement
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}