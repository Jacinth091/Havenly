<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// use Havenly\controllers\AuthController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post("/test", function () {
    return response()->json(['message' => 'Pinged Successfully!']);
});

Route::prefix('/v1')->group(function () {
    Route::prefix('/auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'login']);  
        //Forgot 
        // Reset
        //Verify
        Route::post('/verify', [AuthController::class, 'verify'])
            ->middleware('jwt.role:admin,tenant,landlord');
    });


});
