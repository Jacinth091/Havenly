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
            
            // Lease details
            $table->string('lease_reference', 50)->unique();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->decimal('monthly_rent', 10, 2);
            $table->decimal('security_deposit', 10, 2)->default(0.00);
            $table->tinyInteger('payment_due_day')->default(1);
            $table->date('contract_signed_date')->nullable();
            $table->decimal('early_termination_fee', 10, 2)->default(0.00);
            $table->text('contract_notes')->nullable();
            $table->enum('lease_status', ['Active', 'Expired', 'Terminated', 'Cancelled'])->default('Active');
            
            // Timestamps with custom defaults
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Foreign key constraints
            $table->foreign('room_id')
                  ->references('room_id')
                  ->on('rooms')
                  ->onDelete('cascade');
                  
            $table->foreign('tenant_id')
                  ->references('tenant_id')
                  ->on('tenants')
                  ->onDelete('cascade');
            
            // Indexes matching your schema
            $table->index('room_id', 'idx_room');
            $table->index('tenant_id', 'idx_tenant');
            $table->index('lease_status', 'idx_status');
            $table->index(['start_date', 'end_date'], 'idx_dates');
            $table->index('deleted_at', 'idx_deleted');
            
            // Additional useful indexes
            $table->index('lease_reference');
            $table->index(['tenant_id', 'lease_status']); // For finding active leases for a tenant
            $table->index(['room_id', 'lease_status']); // For checking room occupancy status
            $table->index('contract_signed_date');
        });
        
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