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
            
            // Transaction details
            $table->decimal('amount', 10, 2);
            $table->string('receipt_number', 50)->unique()->nullable();
            $table->enum('payment_method', ['Cash', 'Bank_Transfer', 'Check', 'GCash', 'Other'])->default('Cash');
            $table->dateTime('transaction_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('transaction_status', ['Pending', 'Completed', 'Cancelled'])->default('Completed');
            $table->text('notes')->nullable();
            
            // Timestamps with custom defaults
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->dateTime('deleted_at')->nullable()->default(null);
            
            // Foreign key constraint - ON DELETE RESTRICT (can't delete lease if transactions exist)
            $table->foreign('lease_id')
                  ->references('lease_id')
                  ->on('leases')
                  ->onDelete('restrict');
            
            // Indexes matching your schema
            $table->index('lease_id', 'idx_lease');
            $table->index('transaction_status', 'idx_status');
            $table->index('transaction_date', 'idx_date');
            $table->index('receipt_number', 'idx_receipt');
            $table->index('payment_method', 'idx_method');
            
            // Additional useful indexes
            $table->index(['lease_id', 'transaction_status']);
            $table->index(['transaction_date', 'transaction_status']);
            $table->index('amount');
        });
        
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