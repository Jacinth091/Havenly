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
        Schema::create('leases', function (Blueprint $table) {
            // Primary key
            $table->increments('lease_id');
            
            // Foreign keys
            $table->unsignedInteger('room_id');
            $table->unsignedInteger('tenant_id');
            
            // Lease dates
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            
            // Financial details
            $table->decimal('monthly_rent', 10, 2);
            $table->decimal('security_deposit', 10, 2)->default(0.00);
            $table->tinyInteger('payment_due_day')->default(1);
            
            // Status and notes
            $table->enum('lease_status', ['Active', 'Expired', 'Terminated', 'Archived'])->default('Active');
            $table->text('notes')->nullable();
            
            // Active status
            $table->boolean('is_active')->default(true);
            
            // Timestamps
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Foreign key constraints
            $table->foreign('room_id')
                  ->references('room_id')
                  ->on('rooms')
                  ->onDelete('restrict');
            
            $table->foreign('tenant_id')
                  ->references('tenant_id')
                  ->on('tenants')
                  ->onDelete('restrict');
            
            // Indexes
            $table->index('room_id', 'idx_room');
            $table->index('tenant_id', 'idx_tenant');
            $table->index('lease_status', 'idx_status');
            $table->index(['start_date', 'end_date'], 'idx_dates');
            $table->index('is_active', 'idx_active');
            $table->index('deleted_at', 'idx_deleted');
        });
        
        // Add check constraints using raw SQL
        DB::statement('ALTER TABLE leases ADD CONSTRAINT chk_monthly_rent CHECK (monthly_rent > 0)');
        DB::statement('ALTER TABLE leases ADD CONSTRAINT chk_security_deposit CHECK (security_deposit >= 0)');
        DB::statement('ALTER TABLE leases ADD CONSTRAINT chk_payment_due_day CHECK (payment_due_day >= 1 AND payment_due_day <= 31)');
        DB::statement('ALTER TABLE leases ADD CONSTRAINT chk_lease_dates CHECK (end_date > start_date)');
        
        // Set table engine and charset
        DB::statement('ALTER TABLE leases ENGINE = InnoDB');
        DB::statement('ALTER TABLE leases CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leases');
    }
};