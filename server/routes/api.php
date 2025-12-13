<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeaseController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\StatisticController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
// use Havenly\controllers\AuthController;

Route::post("/test", function () {
    return response()->json(['message' => 'Pinged Successfully!']);
});

Route::prefix('/v1')->group(function () {
    Route::prefix('/auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);  
        //Forgot 
        // TODO:: Forgot Password Route
        //Verify
        Route::middleware(['jwt.auth', 'jwt.role:admin,tenant,landlord'])->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/verify', [AuthController::class, 'verify']);
        });
    });

    // Tenant routes (authenticated tenant only)
    Route::prefix('/tenant')->group(function () {
        Route::middleware(['jwt.auth', 'jwt.role:tenant'])
            ->group(function () {
                Route::get('/dashboard', [TenantController::class, 'getTenantDashboard']);
                Route::get('/payments', [TenantController::class, 'getTenantPayments']);
                Route::get('/leases', [TenantController::class, 'getTenantLeases']);
                Route::get('/profile', [TenantController::class, 'getTenantProfile']);
                Route::put('/profile', [TenantController::class, 'updateTenantProfile']);
                Route::get('/transactions/{tenantId}', [TransactionController::class, 'getTransactionsByTenant']);

            });
    });

    Route::middleware(['jwt.auth', 'jwt.role:landlord'])
        ->prefix('/landlord')
        ->group(function () {
        
        Route::get('/dashboard', [StatisticController::class, "getLandlordDashboardData"]);
        Route::prefix('/properties')
            ->group(function () {
                // URL: /landlord/properties
            Route::get('/', [PropertyController::class, 'getOwnedProperties']);

            // URL: /landlord/properties/{property_id}/rooms
            Route::get('/{property_id}/rooms', [RoomController::class, 'getRoomByProperty']);

            // URL: /landlord/properties/{property_id}/rooms/{room_id}
            Route::get('/{property_id}/rooms/{room_id}', [RoomController::class, 'getRoomDetailsById']);

            // URL: /landlord/properties/create (POST)
            Route::post('/create', [PropertyController::class, 'createPropertyAndRoom']);
            
            // URL: /landlord/properties/{propertyId}/rooms/create
            Route::post('/{propertyId}/rooms/create', [RoomController::class, 'createRooms']);

            Route::put('/{id}', [PropertyController::class, 'update']);
            // Archive (Toggle Active Status)
            Route::patch('/{id}/archive', [PropertyController::class, 'archive']);
            // Delete (Soft Delete)
            Route::delete('/{id}', [PropertyController::class, 'destroy']);


        });

         Route::prefix('/rooms')
            ->group(function () {  
                // URL: /landlord/properties/rooms
                Route::get('/', [RoomController::class, 'getAllRooms']);
                Route::put('/{id}', [RoomController::class, 'update']);
                Route::patch('{id}/archive', [RoomController::class, 'archive']);
                Route::delete('/{id}', [RoomController::class, 'destroy']);
            });

        Route::prefix('/tenants')
            ->group(function () {

            Route::get('/', [TenantController::class, 'getTenantsWithLease']);
            Route::get('/available', [TenantController::class, 'getAvailableTenants']);
            Route::get('{propertyId}', [TenantController::class, 'getTenantsInProperty']);
            Route::post('/create', [TenantController::class, 'createTenantAccount']);
        });
        Route::prefix('/lease')
            ->group(function () {
            Route::get('/', [LeaseController::class, 'getLandlordLeases']);

            Route::post('/create', [LeaseController::class, 'createLeaseAndAssignTenantToProperty']);
            Route::patch('/{id}/terminate', [LeaseController::class, 'terminate']);
            // Archive: Specific action to hide/soft-delete a lease
            Route::patch('/{id}/archive', [LeaseController::class, 'archive']);
            
        });

        Route::prefix('/transactions')->group(function () {
            // Landlord Scope (Logged-in Landlord)
            Route::get('/', [TransactionController::class, 'getTransactionsByLandlord']);
            Route::post('/create', [TransactionController::class, 'recordPayment']);
            Route::patch('/{id}/verify', [TransactionController::class, 'verifyTransaction']);
            Route::patch('/{id}/reject', [TransactionController::class, 'rejectTransaction']);
            Route::patch('/{id}/archive', [TransactionController::class, 'archiveTransaction']);
        });


    });

    Route::middleware(['jwt.auth', 'jwt.role:landlord,tenant,admin'])
        ->prefix('/user')
        ->group(function () {
        
        Route::put("/profile", [UserController::class, "updateProfile"]);
        Route::put("/password", [UserController::class, "updatePassword"]);
    });

    Route::middleware(['jwt.auth', 'jwt.role:admin'])
        ->prefix('/admin')
        ->group(function () {

        Route::get('/transactions', [TransactionController::class, 'getAllTransactions']);
    });

});


