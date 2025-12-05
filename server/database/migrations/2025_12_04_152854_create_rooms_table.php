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
        Schema::create('rooms', function (Blueprint $table) {
            // Primary key
            $table->increments('room_id');
            
            // Foreign key to properties table
            $table->unsignedInteger('property_id');
            
            // Room details
            $table->string('room_number', 20);
            $table->decimal('monthly_rent', 10, 2);
            $table->enum('room_status', ['Available', 'Occupied', 'Maintenance'])->default('Available');
            
            // Active status
            $table->boolean('is_active')->default(true);
            
            // Timestamps
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Indexes
            $table->index('property_id', 'idx_property');
            $table->index('room_status', 'idx_status');
            $table->index('room_number', 'idx_room_number');
            $table->index('is_active', 'idx_active');
            $table->index('deleted_at', 'idx_deleted');
            
            // Unique constraint: room number per property
            $table->unique(['property_id', 'room_number'], 'idx_property_room');
        });
        
        // Add foreign key constraint
        DB::statement('ALTER TABLE rooms ADD FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE RESTRICT');
        
        // Add check constraint
        DB::statement('ALTER TABLE rooms ADD CONSTRAINT chk_monthly_rent CHECK (monthly_rent > 0)');
        
        // Set table engine and charset
        DB::statement('ALTER TABLE rooms ENGINE = InnoDB');
        DB::statement('ALTER TABLE rooms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
