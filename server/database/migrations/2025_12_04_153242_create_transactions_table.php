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
        Schema::create('transactions', function (Blueprint $table) {
            // Primary key
            $table->increments('transaction_id');
            
            // Foreign key to leases table
            $table->unsignedInteger('lease_id');
            
            // Payment details
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['Cash', 'Bank Transfer', 'GCash', 'PayMaya', 'Check', 'Other'])->default('Cash');
            $table->string('reference_number', 100)->nullable();
            $table->date('payment_for_month')->nullable();
            
            // Transaction details
            $table->dateTime('transaction_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('transaction_status', ['Pending', 'Completed', 'Cancelled', 'Archived'])->default('Completed');
            $table->text('notes')->nullable();
            
            // Active status
            $table->boolean('is_active')->default(true);
            
            // Timestamps
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Foreign key constraint
            $table->foreign('lease_id')
                  ->references('lease_id')
                  ->on('leases')
                  ->onDelete('restrict');
            
            // Indexes
            $table->index('lease_id', 'idx_lease');
            $table->index('transaction_status', 'idx_status');
            $table->index('transaction_date', 'idx_date');
            $table->index('payment_for_month', 'idx_payment_month');
            $table->index('reference_number', 'idx_reference');
            $table->index('is_active', 'idx_active');
            $table->index('deleted_at', 'idx_deleted');
            
            // Optional: Unique constraint for reference number per payment method
            // $table->unique(['payment_method', 'reference_number'], 'idx_method_reference');
        });
        
        // Add check constraint using raw SQL
        DB::statement('ALTER TABLE transactions ADD CONSTRAINT chk_amount CHECK (amount > 0)');
        
        // Set table engine and charset
        DB::statement('ALTER TABLE transactions ENGINE = InnoDB');
        DB::statement('ALTER TABLE transactions CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};