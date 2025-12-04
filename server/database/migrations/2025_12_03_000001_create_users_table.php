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
        Schema::create('users', function (Blueprint $table) {
            // Use increments() to match INT(11) AUTO_INCREMENT
            $table->increments('user_id');
            
            // Username and email with unique constraints
            $table->string('username', 100)->unique();
            $table->string('email', 100)->unique();
            
            // Password field (Laravel typically uses 'password' for hashed passwords)
            $table->string('password_hash', 255);
            
            // Role as ENUM
            $table->enum('role', ['Admin', 'Landlord', 'Tenant']);
            
            // Timestamps with custom defaults
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Indexes
            $table->index('email', 'idx_email');
            $table->index('username', 'idx_username');
            $table->index('role', 'idx_role');
            $table->index('deleted_at', 'idx_deleted');
        });
        
        // Set table engine and charset
        DB::statement('ALTER TABLE users ENGINE = InnoDB');
        DB::statement('ALTER TABLE users CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};