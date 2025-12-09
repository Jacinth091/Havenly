<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeaseController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\TenantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
// use Havenly\controllers\AuthController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post("/test", function () {
    return response()->json(['message' => 'Pinged Successfully!']);
});

// Route::get('/test-auth', function () {
//     return response()->json([
//         'authenticated' => Auth::check(),
//         'user' => Auth::user(),
//         'user_id' => Auth::id()
//     ]);
// })->middleware('jwt.auth');



Route::prefix('/v1')->group(function () {
    Route::prefix('/auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);  
        //Forgot 
        // TODO:: Forgot Password Route
        //Verify
        Route::post('/verify', [AuthController::class, 'verify'])
            ->middleware(['jwt.auth','jwt.role:admin,tenant,landlord']);
    });

    Route::prefix('/landlord')->group(function () {
        Route::middleware(['jwt.auth', 'jwt.role:landlord,admin'])
            ->prefix('/properties')
            ->group(function () {
                // URL: /landlord/properties
            Route::get('/', [PropertyController::class, 'getOwnedProperties']);

            // URL: /landlord/properties/rooms
            Route::get('/rooms', [RoomController::class, 'getAllRooms']);

            // URL: /landlord/properties/{property_id}/rooms
            Route::get('/{property_id}/rooms', [RoomController::class, 'getRoomByProperty']);

            // URL: /landlord/properties/{property_id}/rooms/{room_id}
            Route::get('/{property_id}/rooms/{room_id}', [RoomController::class, 'getRoomDetailsById']);

            // URL: /landlord/properties/create (POST)
            Route::post('/create', [PropertyController::class, 'createPropertyAndRoom']);
            
            // URL: /landlord/properties/{propertyId}/rooms/create
            Route::post('/{propertyId}/rooms/create', [RoomController::class, 'createRooms']);



        });
        Route::middleware(['jwt.auth', 'jwt.role:landlord,admin'])
            ->prefix('/tenants')
            ->group(function () {

            Route::get('/', [TenantController::class, 'getTenantsWithLease']);
            Route::get('/available', [TenantController::class, 'getAvailableTenants']);
            Route::get('{propertyId}', [TenantController::class, 'getTenantsInProperty']);
            Route::post('/create', [TenantController::class, 'createTenantAccount']);
        });

        Route::middleware(['jwt.auth', 'jwt.role:landlord,admin'])
            ->prefix('/lease')
            ->group(function () {

            Route::post('/create', [LeaseController::class, 'createLeaseAndAssignTenantToProperty']);
            
        });

    });

});
