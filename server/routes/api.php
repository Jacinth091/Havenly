<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RoomController;
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
        Route::put('/register', [AuthController::class, 'register']);  
        //Forgot 
        // TODO:: Forgot Password Route
        //Verify
        Route::post('/verify', [AuthController::class, 'verify'])
            ->middleware(['jwt.auth','jwt.role:admin,tenant,landlord']);
    });

    Route::prefix('/landlord')->group(function () {
        

        // Route::get('/properties', [PropertyController::class, 'getOwnedProperties'])
        //     ->middleware(['jwt.auth', 'jwt.role:landlord']);

        // Route::get('/properties/rooms', [RoomController::class , 'getAllRooms'])
        //     ->middleware(['jwt.auth','jwt.role:landlord,admin']);

        // Route::get('/properties/{property_id}/rooms', [RoomController::class, 'getRoomByProperty'])
        //     ->middleware(['jwt.auth', 'jwt.role:landlord,admin']);

        // Route::get('/properties/{property_id}/rooms/{room_id}', [RoomController::class, 'getRoomDetailsById'])
        //     ->middleware(['jwt.auth', 'jwt.role:landlord,admin']);


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

                // URL: /landlord/properties (PUT)
                // You had an unfinished PUT route in your snippet:
                Route::post('/create', [PropertyController::class, 'createPropertyAndRoom']);
            });

    });

});
