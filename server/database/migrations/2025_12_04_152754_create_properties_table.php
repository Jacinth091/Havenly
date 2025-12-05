<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            // Primary key
            $table->increments('property_id');
            
            // Foreign key to landlords table
            $table->unsignedInteger('landlord_id');
            
            // Property details
            $table->string('property_name', 100);
            $table->string('address', 255);
            $table->string('city', 100);
            $table->integer('total_rooms')->default(0);
            
            // Active status
            $table->boolean('is_active')->default(true);
            
            // Timestamps
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Foreign key constraint
            $table->foreign('landlord_id')
                  ->references('landlord_id')
                  ->on('landlords')
                  ->onDelete('restrict');
            
            // Indexes
            $table->index('landlord_id', 'idx_landlord');
            $table->index('property_name', 'idx_property_name');
            $table->index('city', 'idx_city');
            $table->index('is_active', 'idx_active');
            $table->index('deleted_at', 'idx_deleted');
        });
        
        // Set table engine and charset
        DB::statement('ALTER TABLE properties ENGINE = InnoDB');
        DB::statement('ALTER TABLE properties CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};