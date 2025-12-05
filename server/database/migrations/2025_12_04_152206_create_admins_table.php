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
        Schema::create('admins', function (Blueprint $table) {
            // Primary key
            $table->increments('admin_id');
            
            // Foreign key to users table
            $table->unsignedInteger('user_id')->unique();
            
            // Name fields
            $table->string('first_name', 150);
            $table->string('last_name', 150);
            $table->string('middle_name', 150)->nullable();
            
            // Contact number
            $table->string('contact_num', 150)->nullable();
            
            // Active status
            $table->boolean('is_active')->default(true);
            
            // Timestamps
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Foreign key constraint
            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('restrict');
            
            // Indexes
            $table->index('user_id', 'idx_user');
            $table->index(['last_name', 'first_name'], 'idx_name');
            $table->index('is_active', 'idx_active');
            $table->index('deleted_at', 'idx_deleted');
        });
        
        // Set table engine and charset
        DB::statement('ALTER TABLE admins ENGINE = InnoDB');
        DB::statement('ALTER TABLE admins CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};