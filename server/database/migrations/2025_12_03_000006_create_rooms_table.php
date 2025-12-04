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
            $table->enum('room_type', ['Single', 'Double', 'Family', 'Dormitory', 'Studio', 'Bedspace'])->default('Single');
            $table->tinyInteger('room_capacity')->default(1); // Using tinyInteger for INT(2)
            $table->enum('room_status', ['Available', 'Occupied'])->default('Available');
            $table->enum('utilities_included', ['None', 'Water Only', 'Electricity Only', 'Water and Electricity'])->default('None');
            $table->string('photo_url', 500)->default('/images/default-room.jpg');
            $table->text('room_description')->nullable();
            
            // Timestamps with custom defaults
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Foreign key constraint
            $table->foreign('property_id')
                  ->references('property_id')
                  ->on('properties')
                  ->onDelete('cascade');
            
            // Indexes matching your schema
            $table->index('property_id', 'idx_property');
            $table->index('room_status', 'idx_status');
            $table->index('room_number', 'idx_room_number');
            $table->index('deleted_at', 'idx_deleted');
            
            // Additional useful indexes
            $table->index('monthly_rent');
            $table->index(['property_id', 'room_status']); // Composite index for filtering rooms by property and status
        });
        
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