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
        Schema::create('landlords', function (Blueprint $table) {
            // Primary key
            $table->increments('landlord_id');
            
            // Foreign key to users table - must match users.user_id type (INT(11))
            $table->unsignedInteger('user_id')->unique();
            
            // Name fields
            $table->string('first_name', 150);
            $table->string('last_name', 150);
            $table->string('middle_name', 150)->nullable();
            
            // Contact number - NOT NULL in your schema
            $table->string('contact_num', 150);
            
            // Timestamps with custom defaults
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Foreign key constraint
            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('cascade');
            
            // Indexes matching your schema
            $table->index('user_id', 'idx_user');
            $table->index(['last_name', 'first_name'], 'idx_name');
            $table->index('contact_num', 'idx_contact');
            $table->index('deleted_at', 'idx_deleted');
        });
        
        // Set table engine and charset
        DB::statement('ALTER TABLE landlords ENGINE = InnoDB');
        DB::statement('ALTER TABLE landlords CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landlords');
    }
};